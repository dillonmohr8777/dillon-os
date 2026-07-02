import SwiftUI

@main
struct MohrAgentsApp: App {
    @StateObject private var auth = AuthManager()
    @StateObject private var store = StoreManager()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(auth)
                .environmentObject(store)
                .tint(Theme.orange)
        }
    }
}
