import StoreKit
import SwiftUI

// StoreKit 2 subscriptions. Product IDs must match ios/MohrAgents.storekit
// (local testing) and App Store Connect (production).
@MainActor
final class StoreManager: ObservableObject {
    static let monthlyID = "com.mohrmedia.mohragents.pro.monthly"
    static let yearlyID  = "com.mohrmedia.mohragents.pro.yearly"

    @Published private(set) var products: [Product] = []
    @Published private(set) var isSubscribed = false
    @Published var lastError: String?

    // JWS of the newest active transaction, pushed to the backend so it can
    // grant the entitlement without waiting on Apple's async notification.
    private(set) var latestTransactionJWS: String?

    // No deinit: StoreManager is an app-lifetime @StateObject, so the
    // Transaction.updates listener runs for the process lifetime. (A deinit
    // touching @MainActor state would be an isolation violation under Swift 6.)
    init() {
        Task { await listenForTransactions() }
        Task {
            // Independent — load the catalog and resolve entitlements concurrently.
            async let productsLoaded: Void = loadProducts()
            async let entitlementsRefreshed: Void = refreshEntitlements()
            _ = await (productsLoaded, entitlementsRefreshed)
        }
    }

    func loadProducts() async {
        do {
            products = try await Product.products(for: [Self.monthlyID, Self.yearlyID])
                .sorted { $0.price < $1.price }
        } catch {
            lastError = "Couldn't load subscriptions: \(error.localizedDescription)"
        }
    }

    func purchase(_ product: Product, appAccountToken: UUID? = nil) async {
        do {
            // appAccountToken lets App Store Server Notifications map the
            // transaction to our backend user (see backend/src/entitlements.ts).
            var options: Set<Product.PurchaseOption> = []
            if let appAccountToken {
                options.insert(.appAccountToken(appAccountToken))
            }
            let result = try await product.purchase(options: options)
            switch result {
            case .success(let verification):
                if case .verified(let transaction) = verification {
                    latestTransactionJWS = verification.jwsRepresentation
                    await transaction.finish()
                    await refreshEntitlements()
                }
            case .userCancelled, .pending:
                break
            @unknown default:
                break
            }
        } catch {
            lastError = error.localizedDescription
        }
    }

    func restore() async {
        try? await AppStore.sync()
        await refreshEntitlements()
    }

    func refreshEntitlements() async {
        var active = false
        for await entitlement in Transaction.currentEntitlements {
            if case .verified(let transaction) = entitlement,
               transaction.productType == .autoRenewable,
               transaction.revocationDate == nil {
                active = true
                latestTransactionJWS = entitlement.jwsRepresentation
            }
        }
        isSubscribed = active
    }

    // Push the current transaction to the backend so its entitlement store
    // reflects this subscriber immediately (StoreKit knows before the webhook).
    func syncWithBackend(token: String?) async {
        guard let jws = latestTransactionJWS else { return }
        do {
            _ = try await APIClient.shared.verifySubscription(signedTransaction: jws, token: token)
        } catch {
            lastError = error.localizedDescription
        }
    }

    private func listenForTransactions() async {
        for await update in Transaction.updates {
            if case .verified(let transaction) = update {
                await transaction.finish()
                await refreshEntitlements()
            }
        }
    }
}
