import SwiftUI

struct ContentView: View {
    @EnvironmentObject var store: RoutineStore
    @State private var showingSettings = false
    @State private var showPinPrompt = false

    var body: some View {
        NavigationView {
            VStack(spacing: 18) {
                HStack {
                    Text("Min rutin")
                        .font(.system(size: 40, weight: .bold, design: .rounded))
                    Spacer()
                    if let profile = store.activeProfile {
                        Text("God morgon, \(profile.name)!")
                            .font(.system(size: 28, weight: .semibold, design: .rounded))
                    }
                }
                .padding(.horizontal)

                RoutineView()
                    .environmentObject(store)

                HStack(spacing: 12) {
                    Button(action: { store.togglePause() }) {
                        Text(store.paused ? "Fortsätt" : "Pausa")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .padding(.horizontal, 18)
                            .padding(.vertical, 10)
                            .background(Color.white)
                            .cornerRadius(12)
                            .shadow(radius: 1)
                    }

                    Button(action: { store.resetRoutine() }) {
                        Text("Återställ")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .padding(.horizontal, 18)
                            .padding(.vertical, 10)
                            .background(Color.white)
                            .cornerRadius(12)
                            .shadow(radius: 1)
                    }

                    Spacer()
                }
                .padding()
            }
            .navigationBarHidden(true)
            .background(Color(hex: "#F8F8F8").edgesIgnoringSafeArea(.all))
            .onLongPressGesture(minimumDuration: 0.8) {
                // open settings (in real app you'd lock behind PIN)
                showingSettings = true
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView { newProfile in
                    if let p = newProfile { store.updateProfile(p) }
                    showingSettings = false
                }
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(RoutineStore())
            .previewInterfaceOrientation(.landscapeLeft)
    }
}
