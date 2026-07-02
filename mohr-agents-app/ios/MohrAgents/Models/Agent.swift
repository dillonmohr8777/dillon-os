import SwiftUI

enum AgentGroup: String, CaseIterable, Identifiable, Codable {
    case found, win, run

    var id: String { rawValue }

    var title: String {
        switch self {
        case .found: return "Get found"
        case .win:   return "Win customers"
        case .run:   return "Run it"
        }
    }
}

struct Agent: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let tag: String
    let symbol: String       // SF Symbol name
    let tintTop: UInt32      // gradient top color
    let tintBottom: UInt32   // gradient bottom color
    let group: AgentGroup
    let placeholder: String  // sample question shown in the input field

    var gradient: LinearGradient {
        LinearGradient(
            colors: [Color(hex: tintTop), Color(hex: tintBottom)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

// Static catalog mirroring the prototype. The backend serves the same list at
// GET /v1/agents and is the source of truth; this copy renders the home grid
// before first network fetch.
enum AgentCatalog {
    static let all: [Agent] = [
        // ---------- GET FOUND ----------
        Agent(id: "ads", name: "Google Ads", tag: "Stop the wasted spend",
              symbol: "megaphone.fill", tintTop: 0xFF6600, tintBottom: 0xD9540A,
              group: .found, placeholder: "Where is my ad budget actually going this month?"),
        Agent(id: "seo", name: "SEO Ranker", tag: "Climb the local rankings",
              symbol: "magnifyingglass", tintTop: 0x2F9E36, tintBottom: 0x1F7A28,
              group: .found, placeholder: "Why am I not on page 1 for my main service?"),
        Agent(id: "gmb", name: "Google Business", tag: "Own the map pack",
              symbol: "mappin.and.ellipse", tintTop: 0x1F5AA6, tintBottom: 0x123F78,
              group: .found, placeholder: "What should I do on my profile this week?"),
        Agent(id: "lp", name: "Landing Pages", tag: "Turn clicks into calls",
              symbol: "square.grid.2x2.fill", tintTop: 0x2E8B84, tintBottom: 0x1E625C,
              group: .found, placeholder: "Build a landing page for my current offer."),
        // ---------- WIN CUSTOMERS ----------
        Agent(id: "adwriter", name: "Ad Writer", tag: "Copy that converts",
              symbol: "bolt.fill", tintTop: 0xF0980E, tintBottom: 0xC1760A,
              group: .win, placeholder: "Write me a Facebook ad for my special."),
        Agent(id: "leads", name: "Lead Reviver", tag: "Wake up cold quotes",
              symbol: "line.3.horizontal.decrease", tintTop: 0x004784, tintBottom: 0x00335F,
              group: .win, placeholder: "Re-engage the quotes I never followed up on."),
        Agent(id: "reviews", name: "Review Reply", tag: "Every review, on-brand",
              symbol: "star.fill", tintTop: 0x2A7FB0, tintBottom: 0x1C5C84,
              group: .win, placeholder: "Help me reply to this review without sounding defensive."),
        Agent(id: "content", name: "Content Engine", tag: "One idea → a week of posts",
              symbol: "arrow.triangle.branch", tintTop: 0x3A4E9E, tintBottom: 0x26356E,
              group: .win, placeholder: "I have an event next month. Give me content."),
        // ---------- RUN IT ----------
        Agent(id: "report", name: "Report Card", tag: "What your marketing did",
              symbol: "chart.line.uptrend.xyaxis", tintTop: 0x3AA34A, tintBottom: 0x248034,
              group: .run, placeholder: "Give me last month's report in plain English."),
        Agent(id: "web", name: "Website Fixes", tag: "Find what's costing you",
              symbol: "wrench.and.screwdriver.fill", tintTop: 0x4F7383, tintBottom: 0x374F5C,
              group: .run, placeholder: "Something feels off on my site — check it."),
        Agent(id: "quote", name: "Quote Builder", tag: "Job → priced estimate",
              symbol: "doc.text.fill", tintTop: 0x6E5A72, tintBottom: 0x4E3F52,
              group: .run, placeholder: "Customer needs a job quoted. Price it out."),
    ]

    static func agents(in group: AgentGroup) -> [Agent] {
        all.filter { $0.group == group }
    }
}
