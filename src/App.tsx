import { useState, useEffect, useCallback } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import type {
  StoredState,
  ChildProfile,
  UserRoutine,
} from "./routine";
import {
  createDefaultChild,
  StepStatus,
} from "./routine";
import RoutineView from "./components/RoutineView";
import SettingsView from "./components/SettingsView";
import InstallPrompt from "./components/InstallPrompt";
import { preloadAllSVGs } from "./svgCache";
import "./App.css";

const STORAGE_KEY = "min-rutin-state-v2";

const resetRoutineForRun = (routine: UserRoutine) => ({
  ...routine,
  steps: routine.steps.map((step) => ({
    ...step,
    status: StepStatus.Todo,
    remainingSeconds: step.minutes * 60,
  })),
});

const getRoutineTotalSeconds = (routine: UserRoutine) =>
  routine.steps.reduce((sum, step) => sum + step.remainingSeconds, 0);

// Preload all SVGs on app start
preloadAllSVGs();

// Migrate old icon names to new ones
function migrateIconNames(state: StoredState): StoredState {
  const iconMap: { [key: string]: string } = {
    "moon.stars": "moon-stars",
    "lamp.table": "lamp-table",
  };

  return {
    ...state,
    children: state.children.map(child => ({
      ...child,
      routines: child.routines.map(routine => ({
        ...routine,
        steps: routine.steps.map(step => ({
          ...step,
          iconName: step.iconName && iconMap[step.iconName] ? iconMap[step.iconName] : step.iconName,
        })),
      })),
    })),
  };
}

export default function App() {
  const demoChild = createDefaultChild("Demobarn");
  const [state, setState] = useState<StoredState>({
    activeChildId: demoChild.id,
    children: [demoChild],
    screen: "start",
    routine: null,
    totalSeconds: 0,
    paused: false,
  });
  const [previousScreen, setPreviousScreen] = useState<"start" | "routine">("start");
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
    } = useRegisterSW({
      immediate: false,
    });
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    setShowUpdateBanner(Boolean(needRefresh));
  }, [needRefresh]);

  const handleConfirmUpdate = useCallback(async () => {
    setShowUpdateBanner(false);
    try {
      if (updateServiceWorker) {
        await updateServiceWorker(true);
      } else {
        window.location.reload();
      }
    } finally {
      setNeedRefresh(false);
    }
  }, [setNeedRefresh, updateServiceWorker]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        // Migrate old icon names to new ones
        parsed = migrateIconNames(parsed);
        setState(parsed);
      } catch {
        // Keep demo state
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activeChild = state.children.find((c) => c.id === state.activeChildId);

  const openRoutine = (routine: UserRoutine) => {
    const resetRoutine = resetRoutineForRun(routine);
    const totalSeconds = getRoutineTotalSeconds(resetRoutine);
    setPreviousScreen("start");
    setState((prev) => ({
      ...prev,
      screen: "routine",
      routine: resetRoutine,
      totalSeconds,
      paused: false,
    }));
  };

  const handleUpdateRoutine = (updated: UserRoutine) => {
    if (activeChild) {
      const updatedRoutines = activeChild.routines.map((r) =>
        r.id === updated.id ? updated : r
      );
      const updatedChild = {
        ...activeChild,
        routines: updatedRoutines,
      };
      const updatedChildren = state.children.map((c) =>
        c.id === activeChild.id ? updatedChild : c
      );
      setTimeout(() => {
        setState((prevState) => {
          return {
            ...prevState,
            children: updatedChildren,
            routine: updated,
          };
        });
      }, 0);
    }
  };

  const handleUpdateChild = (child: ChildProfile) => {
    console.log("👶 Updating child:", child.name);
    const updated = state.children.map((c) => (c.id === child.id ? child : c));
    
    // If routine is currently running and belongs to this child, update it too
    let newState = { ...state, children: updated };
    if (state.routine && child.id === state.activeChildId) {
      const updatedRoutine = child.routines.find(r => r.id === state.routine?.id);
      if (updatedRoutine) {
        console.log("🔄 Syncing routine changes back to active routine");
        newState = { ...newState, routine: updatedRoutine };
      }
    }
    setState(newState);
  };

  const handleAddChild = (name: string) => {
    console.log("➕ Adding child:", name);
    const newChild = createDefaultChild(name);
    setState({
      ...state,
      children: [...state.children, newChild],
      activeChildId: newChild.id,
    });
  };

  const handleDeleteChild = (id: string) => {
    const filtered = state.children.filter((c) => c.id !== id);
    
    // Om inga barn finns kvar, skapa ett nytt demo barn
    if (filtered.length === 0) {
      const demoChild = createDefaultChild("Demobarn");
      setState({
        ...state,
        children: [demoChild],
        activeChildId: demoChild.id,
      });
      return;
    }

    // Välj nästa barn (eller första om det raderade barnet var aktivt)
    const newActiveId = id === state.activeChildId ? filtered[0].id : state.activeChildId;
    
    setState({
      ...state,
      children: filtered,
      activeChildId: newActiveId,
    });
  };

  const handleSelectChild = (id: string) => {
    setState({ ...state, activeChildId: id, screen: "start" });
  };

  const startSettingsLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    const currentScreen = state.screen === "routine" ? "routine" : "start";
    const timer = window.setTimeout(() => {
      setLongPressTimer(null);
      setPreviousScreen(currentScreen);
      setState((prev) => ({ ...prev, screen: "settings" }));
    }, 800);
    setLongPressTimer(timer);
  };

  const cancelSettingsLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  if (!activeChild) {
    return (
      <div className="app-loading">
        <div>
          <p>⚠️ Kunde inte ladda barn</p>
          <p style={{ fontSize: "12px", marginTop: "10px" }}>activeChildId: {state.activeChildId}</p>
          <p style={{ fontSize: "12px" }}>children count: {state.children.length}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: "20px", padding: "10px 20px" }}>Ladda om</button>
        </div>
      </div>
    );
  }

  const morningRoutine = activeChild.routines.find((r) => r.title === "Morgonrutin") ?? activeChild.routines[0];
  const eveningRoutine = activeChild.routines.find((r) => r.title === "Kvällsrutin") ?? activeChild.routines.find((r) => r.id !== morningRoutine?.id);

  const handleCardSelect = (routine?: UserRoutine) => {
    if (routine) {
      openRoutine(routine);
    }
  };

  return (
    <div className="app">
      {state.screen === "start" && (
        <div
          className="start-screen"
          onPointerDown={startSettingsLongPress}
          onPointerUp={cancelSettingsLongPress}
          onPointerLeave={cancelSettingsLongPress}
          onPointerCancel={cancelSettingsLongPress}
        >
          <div className="start-content">
            <h1 className="start-title">Min rutin</h1>
            <p className="start-subtitle">God morgon</p>
            <div className="start-cards">
              <div
                className="routine-card-option routine-card-morning"
                role="button"
                tabIndex={0}
                onClick={() => handleCardSelect(morningRoutine)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardSelect(morningRoutine);
                  }
                }}
              >
                Morgonrutin
              </div>
              <div
                className="routine-card-option routine-card-evening"
                role="button"
                tabIndex={0}
                onClick={() => handleCardSelect(eveningRoutine)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardSelect(eveningRoutine);
                  }
                }}
              >
                Kvällsrutin
              </div>
            </div>
          </div>
        </div>
      )}

      {state.screen === "routine" && state.routine && (
        <RoutineView
          key={state.routine.id}
          child={activeChild}
          routine={state.routine}
          onUpdateRoutine={handleUpdateRoutine}
          onBack={() => setState({ ...state, screen: "start" })}
          onEnterSettings={() => {
            setPreviousScreen("routine");
            setState({ ...state, screen: "settings" });
          }}
        />
      )}

      {state.screen === "settings" && (
        <SettingsView
          children={state.children}
          activeChildId={state.activeChildId}
          onClose={() => {
            console.log("❌ Settings closing");
            console.log("   previousScreen:", previousScreen);
            console.log("   state.screen:", state.screen);

            setState((prev) => {
              if (previousScreen === "routine" && prev.routine) {
                const currentChild = prev.children.find((c) => c.id === prev.activeChildId);
                const latestRoutine = currentChild?.routines.find(
                  (r) => r.id === prev.routine?.id
                );

                if (latestRoutine) {
                  const resetRoutine = resetRoutineForRun(latestRoutine);
                  const totalSeconds = getRoutineTotalSeconds(resetRoutine);
                  console.log("🔄 Refreshing routine after settings close");
                  return {
                    ...prev,
                    screen: "routine",
                    routine: resetRoutine,
                    totalSeconds,
                    paused: false,
                  };
                }
              }

              return { ...prev, screen: previousScreen };
            });
          }}
          onUpdateChild={handleUpdateChild}
          onAddChild={handleAddChild}
          onDeleteChild={handleDeleteChild}
          onSelectChild={handleSelectChild}
        />
      )}
      {state.screen !== "settings" && state.screen !== "start" && showUpdateBanner && (
        <div className="update-banner" role="status" aria-live="polite">
          <span>Ny version redo! Tryck på Okej så får du alla förbättringar direkt.</span>
          <button type="button" onClick={handleConfirmUpdate}>
            Okej
          </button>
        </div>
      )}
      <InstallPrompt />
    </div>
  );
}
