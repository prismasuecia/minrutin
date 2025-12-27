import SwiftUI

struct RoutineView: View {
    @EnvironmentObject var store: RoutineStore

    var body: some View {
        HStack(alignment: .top, spacing: 18) {
            // Left column: Att göra
            ScrollView {
                VStack(spacing: 18) {
                    ForEach(store.currentRoutine?.steps.filter { $0.status != .done } ?? []) { step in
                        RoutineCard(step: step, onActivate: {
                            store.startStep(step.id)
                        }, onComplete: {
                            store.markDone(step.id)
                        }, colorHex: store.activeProfile?.colorHex ?? "#DDE7FF")
                            .frame(maxWidth: 720)
                    }
                }
                .padding()
            }
            .frame(maxWidth: .infinity)

            // Right column: Klart
            ScrollView {
                VStack(spacing: 18) {
                    ForEach(store.currentRoutine?.steps.filter { $0.status == .done } ?? []) { step in
                        RoutineCard(step: step, onActivate: {}, onComplete: {}, colorHex: store.activeProfile?.colorHex ?? "#EDE7DF")
                            .opacity(0.6)
                            .frame(maxWidth: 360)
                    }
                }
                .padding()
            }
            .frame(width: 360)
        }
        .padding(.horizontal)
        .onAppear { store.recalcTotal() }
    }
}

struct RoutineView_Previews: PreviewProvider {
    static var previews: some View {
        RoutineView().environmentObject(RoutineStore()).previewInterfaceOrientation(.landscapeLeft)
    }
}
