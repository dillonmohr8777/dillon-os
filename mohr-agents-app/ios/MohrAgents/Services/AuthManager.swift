import AuthenticationServices
import SwiftUI

// Sign in with Apple → exchange the identity token with the backend
// (POST /v1/auth/apple) for a session token stored in the keychain.
@MainActor
final class AuthManager: ObservableObject {
    @Published private(set) var sessionToken: String?
    // Backend-issued UUID attached to StoreKit purchases (appAccountToken) so
    // App Store Server Notifications map back to this user.
    @Published private(set) var appAccountToken: UUID?
    @Published var lastError: String?

    private static let tokenKey = "sessionToken"
    private static let accountTokenKey = "appAccountToken"

    var isSignedIn: Bool { sessionToken != nil }

    init() {
        sessionToken = Keychain.get(Self.tokenKey)
        appAccountToken = Keychain.get(Self.accountTokenKey).flatMap(UUID.init(uuidString:))
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
            let result = try await APIClient.shared.exchangeApple(identityToken: identityToken)
            Keychain.set(result.token, for: Self.tokenKey)
            sessionToken = result.token
            if let raw = result.app_account_token, let uuid = UUID(uuidString: raw) {
                Keychain.set(raw, for: Self.accountTokenKey)
                appAccountToken = uuid
            }
        } catch {
            lastError = error.localizedDescription
        }
    }

    func signOut() {
        Keychain.delete(Self.tokenKey)
        Keychain.delete(Self.accountTokenKey)
        sessionToken = nil
        appAccountToken = nil
    }
}
