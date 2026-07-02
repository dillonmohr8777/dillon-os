import SwiftUI

struct HomeView: View {
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 12), count: 4)

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    header
                    ForEach(AgentGroup.allCases) { group in
                        section(for: group)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
            .background(Theme.ground)
            .navigationDestination(for: Agent.self) { agent in
                AgentChatView(agent: agent)
            }
        }
    }

    private var header: some View {
        HStack {
            Wordmark()

            Spacer()

            Text(Date.now, format: .dateTime.weekday(.abbreviated).month(.abbreviated).day())
                .font(.caption2.weight(.bold))
                .textCase(.uppercase)
                .foregroundStyle(Theme.inkFaint)
        }
        .padding(.top, 12)
    }

    private func section(for group: AgentGroup) -> some View {
        VStack(alignment: .leading, spacing: 13) {
            HStack(spacing: 8) {
                Text(group.title)
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .kerning(1.5)
                    .foregroundStyle(Theme.inkFaint)
                Rectangle()
                    .fill(Theme.ink.opacity(0.06))
                    .frame(height: 1)
            }
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(AgentCatalog.agents(in: group)) { agent in
                    NavigationLink(value: agent) {
                        AgentTile(agent: agent)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

struct AgentTile: View {
    let agent: Agent

    var body: some View {
        VStack(spacing: 7) {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(agent.gradient)
                .aspectRatio(1, contentMode: .fit)
                .overlay {
                    Image(systemName: agent.symbol)
                        .font(.system(size: 26, weight: .semibold))
                        .foregroundStyle(.white)
                }
                .shadow(color: .black.opacity(0.25), radius: 8, y: 5)

            Text(agent.name)
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(Theme.ink)
                .lineLimit(2)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(0.8)
        }
    }
}

#Preview {
    HomeView()
        .environmentObject(AuthManager())
        .environmentObject(StoreManager())
}
