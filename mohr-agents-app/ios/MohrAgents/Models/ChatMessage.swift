import Foundation

struct ChatMessage: Identifiable, Codable, Equatable {
    enum Role: String, Codable {
        case user, assistant
    }

    let id: UUID
    let role: Role
    var text: String

    init(id: UUID = UUID(), role: Role, text: String) {
        self.id = id
        self.role = role
        self.text = text
    }
}
