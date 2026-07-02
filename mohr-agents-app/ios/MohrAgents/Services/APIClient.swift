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

    func send(messages: [ChatMessage], to agent: Agent, token: String?) async throws -> String {
        var request = URLRequest(url: baseURL.appending(path: "/v1/agents/\(agent.id)/messages"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = try JSONEncoder().encode(MessageRequest(messages: messages, business: nil))

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.server("No response") }

        switch http.statusCode {
        case 200:
            return try JSONDecoder().decode(MessageResponse.self, from: data).reply
        case 401:
            throw APIError.unauthorized
        case 402:
            throw APIError.subscriptionRequired
        default:
            let body = String(data: data, encoding: .utf8) ?? ""
            throw APIError.server("Server error (\(http.statusCode)) \(body)")
        }
    }
}
