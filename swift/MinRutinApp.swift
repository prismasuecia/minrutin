import SwiftUI

@main
struct MinRutinApp: App {
    @StateObject private var store = RoutineStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
        }
    }
}
