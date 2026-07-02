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
        case server(String)

        var errorDescription: String? {
            switch self {
            case .unauthorized:         return "Please sign in again."
            case .subscriptionRequired: return "A Mohr Agents Pro subscription is required."
            case .server(let message):  return message
            }
        }
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

    private func check(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else { throw APIError.server("No response") }
        switch http.statusCode {
        case 200: return
        case 401: throw APIError.unauthorized
        case 402: throw APIError.subscriptionRequired
        default:  throw APIError.server("Server error (\(http.statusCode))")
        }
    }

    func send(messages: [ChatMessage], to agent: Agent, token: String?) async throws -> String {
        let request = try makeRequest(path: "/v1/agents/\(agent.id)/messages", messages: messages, token: token)
        let (data, response) = try await URLSession.shared.data(for: request)
        try check(response)
        return try JSONDecoder().decode(MessageResponse.self, from: data).reply
    }

    private struct StreamEvent: Decodable {
        let delta: String?
        let done: Bool?
        let error: String?
    }

    // SSE variant — yields text deltas as the agent writes them.
    func stream(messages: [ChatMessage], to agent: Agent, token: String?) async throws -> AsyncThrowingStream<String, Error> {
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
                            continuation.yield(delta)
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
