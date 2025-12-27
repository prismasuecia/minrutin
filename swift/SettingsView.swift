import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var store: RoutineStore
    @Environment(\.presentationMode) var presentationMode

    // PIN management
    @State private var storedPin: String? = UserDefaults.standard.string(forKey: "min-rutin-pin")
    @State private var pinEntry: String = ""
    @State private var isUnlocked: Bool = false
    @State private var settingPinMode: Bool = false
    @State private var showAlert: Bool = false
    @State private var alertMessage: String = ""

    // profile editing
    @State private var newName: String = ""
    @State private var newColorHex: String = "#BEE3DB"

    var onSave: ((ChildProfile?) -> Void)?

    var body: some View {
        NavigationView {
            Group {
                if !isUnlocked {
                    pinLockView
                } else {
                    unlockedView
                }
            }
            .navigationBarTitle("Inställningar", displayMode: .inline)
            .navigationBarItems(leading: Button("Stäng") { presentationMode.wrappedValue.dismiss() }, trailing: doneButton)
            .onAppear { if storedPin == nil { settingPinMode = true } }
            .alert(isPresented: $showAlert) { Alert(title: Text("Fel"), message: Text(alertMessage), dismissButton: .default(Text("OK"))) }
        }
    }

    private var doneButton: some View {
        Button(action: { presentationMode.wrappedValue.dismiss() }) { Text("Klar").bold() }
    }

    private var pinLockView: some View {
        VStack(spacing: 18) {
            if settingPinMode {
                Text("Sätt en PIN-kod för föräldrakontroll")
                    .font(.headline)
                SecureField("Ny PIN-kod", text: $pinEntry)
                    .keyboardType(.numberPad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .frame(maxWidth: 240)
                HStack {
                    Button("Avbryt") { settingPinMode = false; pinEntry = "" }
                    Spacer()
                    Button("Spara") { saveNewPin() }
                }
                .padding(.horizontal, 40)
            } else {
                Text("Ange PIN-kod")
                    .font(.headline)
                SecureField("PIN", text: $pinEntry)
                    .keyboardType(.numberPad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .frame(maxWidth: 200)
                HStack(spacing: 12) {
                    Button("Avbryt") { presentationMode.wrappedValue.dismiss() }
                    Spacer()
                    Button("OK") { verifyPin() }
                }
                .padding(.horizontal, 40)
                if storedPin == nil {
                    Button("Sätt PIN istället") { settingPinMode = true }
                        .padding(.top, 12)
                }
            }
        }
        .padding()
    }

    private var unlockedView: some View {
        Form {
            Section(header: Text("Barnprofiler")) {
                ForEach(store.profiles) { p in
                    HStack {
                        Button(action: { store.setActiveProfile(by: p.id) }) {
                            HStack {
                                Circle()
                                    .fill(Color(hex: p.colorHex))
                                    .frame(width: 28, height: 28)
                                Text(p.name)
                                if store.activeProfileId == p.id { Spacer(); Text("Aktiv").foregroundColor(.secondary) }
                            }
                        }
                    }
                }

                HStack {
                    TextField("Nytt barn", text: $newName)
                    ColorPicker("Färg", selection: Binding(get: { Color(hex: newColorHex) }, set: { newColorHex = $0.toHex() ?? "#BEE3DB" }))
                }
                Button("Lägg till barn") { addProfile() }
            }

            if let profile = store.activeProfile {
                Section(header: Text("Inställningar för \(profile.name)")) {
                    Toggle("Endast en uppgift åt gången", isOn: Binding(get: { profile.singleStepOnly }, set: { newVal in
                        var p = profile; p.singleStepOnly = newVal; store.updateProfile(p)
                    }))

                    if let r = profile.routines[.morning] {
                        NavigationLink("Redigera morgonrutin", destination: RoutineEditorView(profile: profile, routine: r) { updated in
                            var p = profile
                            p.routines[.morning] = updated
                            store.updateProfile(p)
                        })
                    }

                    if let r = profile.routines[.evening] {
                        NavigationLink("Redigera kvällsrutin", destination: RoutineEditorView(profile: profile, routine: r) { updated in
                            var p = profile
                            p.routines[.evening] = updated
                            store.updateProfile(p)
                        })
                    }
                }
            }

            Section(header: Text("Föräldrakontroll")) {
                Button("Byt PIN-kod") { settingPinMode = true; isUnlocked = false }
                Button("Ta bort PIN") { removePin() }
            }

            Section(header: Text("Appinställningar")) {
                Toggle("Spela upp ljud vid målgång", isOn: .constant(false))
            }
        }
    }

    private func saveNewPin() {
        guard pinEntry.count >= 4 else { alertMessage = "PIN måste vara minst 4 siffror"; showAlert = true; return }
        UserDefaults.standard.set(pinEntry, forKey: "min-rutin-pin")
        storedPin = pinEntry
        pinEntry = ""
        settingPinMode = false
        isUnlocked = true
    }

    private func verifyPin() {
        guard let stored = storedPin else { showAlert = true; alertMessage = "Ingen PIN satt"; return }
        if pinEntry == stored {
            isUnlocked = true
            pinEntry = ""
        } else {
            showAlert = true
            alertMessage = "Fel PIN-kod"
            pinEntry = ""
        }
    }

    private func removePin() {
        UserDefaults.standard.removeObject(forKey: "min-rutin-pin")
        storedPin = nil
        isUnlocked = false
    }

    private func addProfile() {
        guard !newName.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        let p = ChildProfile(id: UUID().uuidString, name: newName, colorHex: newColorHex, singleStepOnly: false, routines: [.morning: store.defaultRoutine(mode: .morning), .evening: store.defaultRoutine(mode: .evening)])
        store.updateProfile(p)
        store.setActiveProfile(by: p.id)
        newName = ""
    }
}

// Simple editor for toggling timers per step and renaming steps
struct RoutineEditorView: View {
    var profile: ChildProfile
    @State var routine: UserRoutine
    var onSave: (UserRoutine) -> Void

    var body: some View {
        Form {
            Section(header: Text(routine.title)) {
                TextField("Namn", text: Binding(get: { routine.title }, set: { routine.title = $0 }))
            }

            Section(header: Text("Steg")) {
                ForEach(0..<routine.steps.count, id: \.self) { idx in
                    HStack {
                        VStack(alignment: .leading) {
                            TextField("Namn", text: Binding(get: { routine.steps[idx].title }, set: { routine.steps[idx].title = $0 }))
                            Text("\(routine.steps[idx].minutes) min")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Toggle("Timer", isOn: Binding(get: { routine.steps[idx].timerEnabled }, set: { routine.steps[idx].timerEnabled = $0 }))
                            .labelsHidden()
                    }
                }
            }

            Button("Spara") { onSave(routine) }
        }
        .navigationBarTitle("Redigera", displayMode: .inline)
    }
}

// Helpers for Color <-> Hex conversions
extension Color {
    func toHex() -> String? {
        guard let components = UIColor(self).cgColor.components, components.count >= 3 else { return nil }
        let r = Int(components[0] * 255)
        let g = Int(components[1] * 255)
        let b = Int(components[2] * 255)
        return String(format: "#%02X%02X%02X", r, g, b)
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView(onSave: { _ in })
            .environmentObject(RoutineStore())
            .previewInterfaceOrientation(.landscapeLeft)
    }
}
