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

    private var updatesTask: Task<Void, Never>?

    init() {
        updatesTask = Task { await listenForTransactions() }
        Task {
            await loadProducts()
            await refreshEntitlements()
        }
    }

    deinit {
        updatesTask?.cancel()
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
            }
        }
        isSubscribed = active
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
