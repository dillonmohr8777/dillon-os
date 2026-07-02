import AuthenticationServices
import SwiftUI

struct RootView: View {
    @EnvironmentObject private var auth: AuthManager

    var body: some View {
        if auth.isSignedIn {
            HomeView()
        } else {
            SignInView()
        }
    }
}

struct SignInView: View {
    @EnvironmentObject private var auth: AuthManager

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            HStack(spacing: 6) {
                Text("Mohr").foregroundStyle(Theme.green)
                Text("Agents").foregroundStyle(Theme.blue)
            }
            .font(.system(size: 34, weight: .heavy))

            Text("The agency in your pocket.\nGoogle Ads, SEO, reviews, reports — the exact agents we run for clients.")
                .font(.callout)
                .foregroundStyle(Theme.inkSoft)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            Spacer()

            SignInWithAppleButton(.signIn) { request in
                auth.configure(request)
            } onCompletion: { result in
                auth.handle(result)
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 52)
            .padding(.horizontal, 24)

            if let error = auth.lastError {
                Text(error)
                    .font(.footnote)
                    .foregroundStyle(Theme.crit)
                    .padding(.horizontal, 24)
            }

            Spacer().frame(height: 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.ground)
    }
}
