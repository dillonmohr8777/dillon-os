import SwiftUI

// The "Mohr Agents" wordmark, shared by the sign-in, home, and paywall screens
// so the brand colors and weights live in one place.
struct Wordmark: View {
    var size: CGFloat = 25
    var showsPro: Bool = false

    var body: some View {
        HStack(spacing: 5) {
            Text("Mohr").foregroundStyle(Theme.green)
            Text("Agents").foregroundStyle(Theme.blue)
            if showsPro {
                Text("Pro").foregroundStyle(Theme.orange)
            }
        }
        .font(.system(size: size, weight: .heavy))
    }
}
