import SwiftUI

// Palette lifted from the Netlify prototype (prototype/index.html :root vars),
// itself pulled from mohrmedia.com — logo greens/blues + signature orange.
enum Theme {
    static let ground     = Color(hex: 0xFBF7F1)  // warm near-white background
    static let ground2    = Color(hex: 0xF4EFE7)
    static let panel      = Color(hex: 0xF3EEE5)
    static let paper      = Color.white           // cards
    static let ink        = Color(hex: 0x221F27)
    static let inkSoft    = Color(hex: 0x6B6570)
    static let inkFaint   = Color(hex: 0xA9A2AC)
    static let orange     = Color(hex: 0xFF6600)  // signature
    static let orangeDeep = Color(hex: 0xD9540A)
    static let green      = Color(hex: 0x2F9E36)  // MOHR
    static let greenDeep  = Color(hex: 0x1F7A28)
    static let blue       = Color(hex: 0x1F5AA6)  // MEDIA
    static let navy       = Color(hex: 0x004784)
    static let amber      = Color(hex: 0xF0980E)
    static let crit       = Color(hex: 0xE23A15)
}

extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }
}
