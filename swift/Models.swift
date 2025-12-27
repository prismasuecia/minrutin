import Foundation

enum Mode: String, Codable {
    case morning
    case evening
}

enum StepStatus: String, Codable {
    case todo
    case running
    case done
}

struct RoutineStep: Identifiable, Codable {
    var id: String
    var title: String
    var minutes: Int
    var status: StepStatus
    var remainingSeconds: Int
    // optional: allow disabling a timer per step
    var timerEnabled: Bool = true
}

struct UserRoutine: Identifiable, Codable {
    var id: String
    var title: String
    var mode: Mode
    var steps: [RoutineStep]
}

struct ChildProfile: Identifiable, Codable {
    var id: String
    var name: String
    var colorHex: String
    var singleStepOnly: Bool = false
    var routines: [Mode: UserRoutine] = [:]
}

struct StoredState: Codable {
    var activeScreen: String = "start"
    var activeProfileId: String?
    var profiles: [ChildProfile]
}
