import SwiftUI

struct AgentChatView: View {
    let agent: Agent

    @EnvironmentObject private var auth: AuthManager
    @EnvironmentObject private var store: StoreManager

    @State private var messages: [ChatMessage] = []
    @State private var draft = ""
    @State private var isThinking = false
    @State private var showPaywall = false
    @State private var errorText: String?

    var body: some View {
        VStack(spacing: 0) {
            thread
            inputBar
        }
        .background(Theme.ground)
        .navigationTitle(agent.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                VStack(spacing: 1) {
                    Text(agent.name).font(.headline).foregroundStyle(Theme.ink)
                    Text(agent.tag).font(.caption2).foregroundStyle(Theme.inkFaint)
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                HStack(spacing: 5) {
                    Circle().fill(Theme.green).frame(width: 6, height: 6)
                    Text("Fable 5")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(Theme.greenDeep)
                }
                .padding(.horizontal, 9)
                .padding(.vertical, 5)
                .background(Theme.green.opacity(0.13), in: Capsule())
            }
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView()
        }
    }

    private var thread: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 14) {
                    ForEach(messages) { message in
                        MessageBubble(message: message)
                    }
                    if isThinking {
                        ThinkingIndicator()
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    if let errorText {
                        Text(errorText)
                            .font(.footnote)
                            .foregroundStyle(Theme.crit)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .padding(16)
            }
            // Scroll on new bubbles only — not on every streamed token, which
            // would kick off an animated scroll per delta.
            .onChange(of: messages.count) {
                if let last = messages.last {
                    withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                }
            }
        }
    }

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField(agent.placeholder, text: $draft, axis: .vertical)
                .lineLimit(1...4)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(Theme.paper, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 15, style: .continuous)
                        .strokeBorder(Theme.ink.opacity(0.1))
                }

            Button(action: send) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(canSend ? Theme.orange : Theme.inkFaint)
            }
            .disabled(!canSend)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Theme.ground2)
    }

    private var canSend: Bool {
        !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isThinking
    }

    private func send() {
        guard store.isSubscribed else {
            showPaywall = true
            return
        }
        guard canSend else { return }
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        draft = ""
        errorText = nil
        let userMessage = ChatMessage(role: .user, text: text)
        messages.append(userMessage)
        isThinking = true

        Task {
            defer { isThinking = false }
            do {
                let stream = try await APIClient.shared.stream(
                    messages: messages, to: agent, token: auth.sessionToken)
                var assistantIndex: Int?
                func ensureAssistantBubble() {
                    if assistantIndex == nil {
                        isThinking = false
                        messages.append(ChatMessage(role: .assistant, text: ""))
                        assistantIndex = messages.count - 1
                    }
                }
                for try await chunk in stream {
                    switch chunk {
                    case .delta(let delta):
                        ensureAssistantBubble()
                        if let index = assistantIndex { messages[index].text += delta }
                    case .reset(let replacement):
                        // Refusal mid-stream: discard partial content, show only the reply.
                        ensureAssistantBubble()
                        if let index = assistantIndex { messages[index].text = replacement }
                    }
                }
                if assistantIndex == nil {
                    errorText = "No response — try again."
                }
            } catch APIClient.APIError.subscriptionRequired {
                // StoreKit says we're subscribed but the backend hasn't recorded
                // it yet (Apple's webhook lags). Sync the transaction and retry
                // rather than bouncing a paying user back to the paywall.
                rollBack(userMessage)
                if store.isSubscribed {
                    errorText = "Activating your subscription…"
                    await store.syncWithBackend(token: auth.sessionToken)
                } else {
                    showPaywall = true
                }
            } catch APIClient.APIError.unauthorized {
                auth.signOut()
            } catch {
                // Roll back the optimistic user bubble so a retry doesn't stack
                // two user turns (and the failed message isn't left dangling).
                rollBack(userMessage)
                errorText = error.localizedDescription
            }
        }
    }

    private func rollBack(_ message: ChatMessage) {
        if messages.last?.id == message.id {
            messages.removeLast()
            draft = message.text
        }
    }
}

struct MessageBubble: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.role == .user { Spacer(minLength: 48) }
            Text(message.text)
                .font(.subheadline)
                .foregroundStyle(message.role == .user ? .white : Theme.ink)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    message.role == .user ? AnyShapeStyle(Theme.orange) : AnyShapeStyle(Theme.paper),
                    in: RoundedRectangle(cornerRadius: 18, style: .continuous)
                )
                .overlay {
                    if message.role == .assistant {
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .strokeBorder(Theme.ink.opacity(0.1))
                    }
                }
            if message.role == .assistant { Spacer(minLength: 24) }
        }
        .id(message.id)
    }
}

struct ThinkingIndicator: View {
    @State private var phase = 0

    var body: some View {
        HStack(spacing: 5) {
            ForEach(0..<3, id: \.self) { index in
                Circle()
                    .fill(Theme.inkFaint)
                    .frame(width: 7, height: 7)
                    .opacity(phase == index ? 1 : 0.3)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Theme.paper, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(300))
                phase = (phase + 1) % 3
            }
        }
    }
}
