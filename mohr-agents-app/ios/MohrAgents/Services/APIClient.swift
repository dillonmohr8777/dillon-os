import Foundation

// Talks to the Mohr Agents backend (see ../backend). Prompts and Anthropic API
// keys live server-side only — the app never holds them.
struct APIClient {
    static let shared = APIClient()

    // Override per-scheme via Info.plist key MOHR_API_BASE_URL
    // (Debug → local backend, Release → production).
    var baseURL: URL {
        if let s = Bundle.main.object(forInfoDictionaryKey: "MOHR_API_BASE_URL") as? String,
           let url = URL(string: s) {
            return url
        }
        return URL(string: "https://api.mohrmedia.com")!
    }

    struct MessageRequest: Encodable {
        let messages: [ChatMessage]
        let business: String?   // optional business context ("HVAC, Pittsburgh, $1,800/mo ads")
    }

    struct MessageResponse: Decodable {
        let reply: String
    }

    enum APIError: LocalizedError {
        case unauthorized
        case subscriptionRequired
        case rateLimited(retryAfter: Int?, message: String)
        case server(String)

        var errorDescription: String? {
            switch self {
            case .unauthorized:         return "Please sign in again."
            case .subscriptionRequired: return "A Mohr Agents Pro subscription is required."
            case .rateLimited(_, let message): return message
            case .server(let message):  return message
            }
        }
    }

    // The backend returns a JSON body `{ "error": "..." }` on failures.
    private struct ErrorBody: Decodable { let error: String? }

    private func serverMessage(_ data: Data, fallbackStatus: Int) -> String {
        if let body = try? JSONDecoder().decode(ErrorBody.self, from: data), let message = body.error {
            return message
        }
        return "Server error (\(fallbackStatus))"
    }

    private func makeRequest(path: String, messages: [ChatMessage], token: String?) throws -> URLRequest {
        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = try JSONEncoder().encode(MessageRequest(messages: messages, business: nil))
        return request
    }

    // Validates the response status, throwing a typed APIError with the
    // server-provided message/Retry-After when present. `data` may be empty
    // for streaming responses, in which case only the status is used.
    private func check(_ response: URLResponse, data: Data = Data()) throws {
        guard let http = response as? HTTPURLResponse else { throw APIError.server("No response") }
        switch http.statusCode {
        case 200: return
        case 401: throw APIError.unauthorized
        case 402: throw APIError.subscriptionRequired
        case 429:
            let retryAfter = (http.value(forHTTPHeaderField: "Retry-After")).flatMap(Int.init)
            throw APIError.rateLimited(retryAfter: retryAfter,
                                       message: serverMessage(data, fallbackStatus: 429))
        default:
            throw APIError.server(serverMessage(data, fallbackStatus: http.statusCode))
        }
    }

    func send(messages: [ChatMessage], to agent: Agent, token: String?) async throws -> String {
        let request = try makeRequest(path: "/v1/agents/\(agent.id)/messages", messages: messages, token: token)
        let (data, response) = try await URLSession.shared.data(for: request)
        try check(response, data: data)
        return try JSONDecoder().decode(MessageResponse.self, from: data).reply
    }

    // Push a freshly-made StoreKit transaction to the backend so it grants the
    // entitlement immediately, rather than waiting on Apple's async webhook.
    @discardableResult
    func verifySubscription(signedTransaction: String, token: String?) async throws -> Bool {
        var request = URLRequest(url: baseURL.appending(path: "/v1/subscriptions/verify"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        request.httpBody = try JSONEncoder().encode(["signed_transaction": signedTransaction])
        let (data, response) = try await URLSession.shared.data(for: request)
        try check(response, data: data)
        struct VerifyResponse: Decodable { let subscribed: Bool }
        return try JSONDecoder().decode(VerifyResponse.self, from: data).subscribed
    }

    // Exchange a Sign in with Apple identity token for a session (routed through
    // APIClient so auth uses the same request/error handling as everything else).
    struct AppleAuthResult: Decodable { let token: String; let app_account_token: String? }

    func exchangeApple(identityToken: String) async throws -> AppleAuthResult {
        var request = URLRequest(url: baseURL.appending(path: "/v1/auth/apple"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["identity_token": identityToken])
        let (data, response) = try await URLSession.shared.data(for: request)
        try check(response, data: data)
        return try JSONDecoder().decode(AppleAuthResult.self, from: data)
    }

    private struct StreamEvent: Decodable {
        let delta: String?
        let reset: String?   // discard partial content, replace with this text
        let done: Bool?
        let error: String?
    }

    // What the stream yields: either an incremental delta or a full reset.
    enum StreamChunk {
        case delta(String)
        case reset(String)
    }

    // SSE variant — yields chunks (deltas, or a reset on refusal) as the agent writes them.
    func stream(messages: [ChatMessage], to agent: Agent, token: String?) async throws -> AsyncThrowingStream<StreamChunk, Error> {
        let request = try makeRequest(path: "/v1/agents/\(agent.id)/messages/stream", messages: messages, token: token)
        let (bytes, response) = try await URLSession.shared.bytes(for: request)
        try check(response)

        return AsyncThrowingStream { continuation in
            let task = Task {
                do {
                    for try await line in bytes.lines {
                        guard line.hasPrefix("data: ") else { continue }
                        let payload = Data(line.dropFirst(6).utf8)
                        guard let event = try? JSONDecoder().decode(StreamEvent.self, from: payload) else { continue }
                        if let message = event.error {
                            continuation.finish(throwing: APIError.server(message))
                            return
                        }
                        if let delta = event.delta {
                            continuation.yield(.delta(delta))
                        }
                        if let reset = event.reset {
                            continuation.yield(.reset(reset))
                        }
                        if event.done == true { break }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
            continuation.onTermination = { _ in task.cancel() }
        }
    }
}
