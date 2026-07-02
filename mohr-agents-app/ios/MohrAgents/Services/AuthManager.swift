import AuthenticationServices
import SwiftUI

// Sign in with Apple → exchange the identity token with the backend
// (POST /v1/auth/apple) for a session token stored in the keychain.
@MainActor
final class AuthManager: ObservableObject {
    @Published private(set) var sessionToken: String?
    @Published var lastError: String?

    private static let tokenKey = "sessionToken"

    var isSignedIn: Bool { sessionToken != nil }

    init() {
        sessionToken = Keychain.get(Self.tokenKey)
    }

    func configure(_ request: ASAuthorizationAppleIDRequest) {
        request.requestedScopes = [.email]
    }

    func handle(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
                  let tokenData = credential.identityToken,
                  let identityToken = String(data: tokenData, encoding: .utf8) else {
                lastError = "Apple sign-in returned no identity token."
                return
            }
            Task { await exchange(identityToken: identityToken) }
        case .failure(let error):
            lastError = error.localizedDescription
        }
    }

    private func exchange(identityToken: String) async {
        do {
            var request = URLRequest(url: APIClient.shared.baseURL.appending(path: "/v1/auth/apple"))
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONEncoder().encode(["identity_token": identityToken])

            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else {
                lastError = "Sign-in failed on the server."
                return
            }
            struct TokenResponse: Decodable { let token: String }
            let token = try JSONDecoder().decode(TokenResponse.self, from: data).token
            Keychain.set(token, for: Self.tokenKey)
            sessionToken = token
        } catch {
            lastError = error.localizedDescription
        }
    }

    func signOut() {
        Keychain.delete(Self.tokenKey)
        sessionToken = nil
    }
}
