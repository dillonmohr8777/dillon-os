import StoreKit
import SwiftUI

struct PaywallView: View {
    @EnvironmentObject private var store: StoreManager
    @EnvironmentObject private var auth: AuthManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 20) {
            Capsule()
                .fill(Theme.inkFaint.opacity(0.4))
                .frame(width: 36, height: 5)
                .padding(.top, 10)

            Wordmark(size: 28, showsPro: true)
                .padding(.top, 8)

            VStack(alignment: .leading, spacing: 10) {
                benefit("All 11 agents, unlimited questions")
                benefit("The exact playbooks we run for agency clients")
                benefit("Built on Fable 5 — answers before you finish reading")
            }
            .padding(.horizontal, 28)

            Spacer()

            if store.products.isEmpty {
                ProgressView()
            } else {
                ForEach(store.products, id: \.id) { product in
                    Button {
                        Task {
                            await store.purchase(product, appAccountToken: auth.appAccountToken)
                            if store.isSubscribed {
                                // Tell the backend now, so the first chat send
                                // doesn't race Apple's async notification.
                                await store.syncWithBackend(token: auth.sessionToken)
                                dismiss()
                            }
                        }
                    } label: {
                        VStack(spacing: 2) {
                            Text(product.displayName).font(.headline)
                            Text("\(product.displayPrice) / \(periodLabel(product))")
                                .font(.footnote)
                                .opacity(0.85)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Theme.orange, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .foregroundStyle(.white)
                    }
                    .padding(.horizontal, 24)
                }
            }

            Button("Restore purchases") {
                Task {
                    await store.restore()
                    if store.isSubscribed { dismiss() }
                }
            }
            .font(.footnote)
            .foregroundStyle(Theme.inkSoft)

            if let error = store.lastError {
                Text(error).font(.caption).foregroundStyle(Theme.crit)
            }

            Spacer().frame(height: 20)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.ground)
        .presentationDetents([.medium, .large])
    }

    private func benefit(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "checkmark.square.fill")
                .foregroundStyle(Theme.green)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(Theme.ink)
        }
    }

    private func periodLabel(_ product: Product) -> String {
        guard let period = product.subscription?.subscriptionPeriod else { return "period" }
        switch period.unit {
        case .month: return "month"
        case .year:  return "year"
        case .week:  return "week"
        case .day:   return "day"
        @unknown default: return "period"
        }
    }
}
