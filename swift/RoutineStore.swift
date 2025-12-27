import Foundation
import Combine
import SwiftUI

final class RoutineStore: ObservableObject {
    @Published var profiles: [ChildProfile] = []
    @Published var activeProfileId: String? = nil
    @Published var currentRoutine: UserRoutine? = nil
    @Published var paused: Bool = false
    @Published var totalRemaining: Int = 0
    @Published var activeStepId: String? = nil

    private var timerCancellable: AnyCancellable?
    private var tick = Timer.publish(every: 1.0, on: .main, in: .common).autoconnect()
    private let storageKey = "min-rutin-state-v1-swift"

    init() {
        loadDefaultsIfNeeded()
        restoreState()
        startTicker()
    }

    private func loadDefaultsIfNeeded() {
        if profiles.isEmpty {
            let morning = defaultRoutine(mode: .morning)
            let evening = defaultRoutine(mode: .evening)
            let defaultProfile = ChildProfile(id: UUID().uuidString, name: "Alex", colorHex: "#BEE3DB", singleStepOnly: false, routines: [.morning: morning, .evening: evening])
            profiles = [defaultProfile]
            activeProfileId = defaultProfile.id
            currentRoutine = morning
            recalcTotal()
        }
    }

    func defaultRoutine(mode: Mode) -> UserRoutine {
        if mode == .morning {
            return UserRoutine(id: "morning", title: "Morgonrutin", mode: .morning, steps: [
                RoutineStep(id: "wake", title: "Gå upp", minutes: 2, status: .todo, remainingSeconds: 2 * 60),
                RoutineStep(id: "brush", title: "Borsta tänderna", minutes: 3, status: .todo, remainingSeconds: 3 * 60),
                RoutineStep(id: "dress", title: "Klä på dig", minutes: 5, status: .todo, remainingSeconds: 5 * 60),
                RoutineStep(id: "eat", title: "Äta frukost", minutes: 10, status: .todo, remainingSeconds: 10 * 60),
            ])
        } else {
            return UserRoutine(id: "evening", title: "Kvällsrutin", mode: .evening, steps: [
                RoutineStep(id: "brush", title: "Borsta tänderna", minutes: 3, status: .todo, remainingSeconds: 3 * 60),
                RoutineStep(id: "pyjamas", title: "Ta på pyjamas", minutes: 4, status: .todo, remainingSeconds: 4 * 60),
                RoutineStep(id: "read", title: "Läsa bok", minutes: 10, status: .todo, remainingSeconds: 10 * 60),
            ])
        }
    }

    private func startTicker() {
        timerCancellable = tick.sink { [weak self] _ in
            self?.tickSecond()
        }
    }

    private func tickSecond() {
        guard !paused else { return }
        guard var r = currentRoutine else { return }
        guard let activeId = activeStepId else { return }
        guard let idx = r.steps.firstIndex(where: { $0.id == activeId }) else { return }

        var step = r.steps[idx]
        guard step.timerEnabled else { return }
        if step.status != .running { return }
        if step.remainingSeconds > 0 {
            step.remainingSeconds -= 1
            r.steps[idx] = step
            currentRoutine = r
            recalcTotal()
            if step.remainingSeconds == 0 {
                // mark done automatically
                step.status = .done
                r.steps[idx] = step
                currentRoutine = r
                activeStepId = nil
                recalcTotal()
                saveState()
            }
        }
    }

    func recalcTotal() {
        guard let r = currentRoutine else { totalRemaining = 0; return }
        totalRemaining = r.steps.reduce(0) { $0 + max(0, $1.remainingSeconds) }
    }

    func startStep(_ stepId: String) {
        guard var r = currentRoutine else { return }
        for i in 0..<r.steps.count {
            if r.steps[i].id == stepId {
                if r.steps[i].status == .done { continue }
                r.steps[i].status = .running
                if r.steps[i].remainingSeconds <= 0 {
                    r.steps[i].remainingSeconds = r.steps[i].minutes * 60
                }
                activeStepId = stepId
            } else if r.steps[i].status == .running {
                r.steps[i].status = .todo
            }
        }
        currentRoutine = r
        recalcTotal()
        saveState()
    }

    func markDone(_ stepId: String) {
        guard var r = currentRoutine else { return }
        if let idx = r.steps.firstIndex(where: { $0.id == stepId }) {
            r.steps[idx].status = .done
            r.steps[idx].remainingSeconds = 0
            if activeStepId == stepId { activeStepId = nil }
        }
        currentRoutine = r
        recalcTotal()
        saveState()
    }

    func togglePause() {
        paused.toggle()
        saveState()
    }

    func resetRoutine() {
        guard var r = currentRoutine else { return }
        for i in 0..<r.steps.count {
            r.steps[i].status = .todo
            r.steps[i].remainingSeconds = r.steps[i].minutes * 60
        }
        currentRoutine = r
        activeStepId = nil
        paused = false
        recalcTotal()
        saveState()
    }

    // MARK: - Persistence
    func saveState() {
        let st = StoredState(activeScreen: "routine", activeProfileId: activeProfileId, profiles: profiles)
        if let data = try? JSONEncoder().encode(st) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    func restoreState() {
        if let data = UserDefaults.standard.data(forKey: storageKey), let st = try? JSONDecoder().decode(StoredState.self, from: data) {
            profiles = st.profiles
            activeProfileId = st.activeProfileId ?? profiles.first?.id
            if let profile = profiles.first(where: { $0.id == activeProfileId }), let r = profile.routines[.morning] {
                currentRoutine = r
            }
            recalcTotal()
        }
    }

    // Profile helpers
    var activeProfile: ChildProfile? { profiles.first(where: { $0.id == activeProfileId }) }

    func setActiveProfile(by id: String) {
        activeProfileId = id
        if let p = activeProfile, let r = p.routines[.morning] {
            currentRoutine = r
        }
        recalcTotal()
        saveState()
    }

    func updateProfile(_ p: ChildProfile) {
        if let idx = profiles.firstIndex(where: { $0.id == p.id }) {
            profiles[idx] = p
        } else {
            profiles.append(p)
        }
        saveState()
    }
}
