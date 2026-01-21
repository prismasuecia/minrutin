import { useState, useEffect } from "react";
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
    // Reset all steps to Todo status when opening routine
    const resetRoutine = {
      ...routine,
      steps: routine.steps.map(step => ({
        ...step,
        status: StepStatus.Todo,
        remainingSeconds: step.minutes * 60,
      })),
    };
    setPreviousScreen("start");
    setState({
      ...state,
      screen: "routine",
      routine: resetRoutine,
      totalSeconds: resetRoutine.steps.reduce((sum, s) => sum + s.remainingSeconds, 0),
      paused: false,
    });
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

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setPreviousScreen(state.screen as "start" | "routine");
      setState({ ...state, screen: "settings" });
    }, 800);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
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

  return (
    <div
      className="app"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {state.screen === "start" && (
        <div className="start-screen">
          <div className="start-icon">🌞</div>
          <h1 className="app-title">Min rutin</h1>
          <p className="greeting">God morgon, {activeChild.name}!</p>

          <div className="mode-buttons">
            {activeChild.routines.map((routine) => (
              <button
                key={routine.id}
                className="btn-large"
                onClick={() => openRoutine(routine)}
              >
                {routine.title}
              </button>
            ))}
          </div>

          {state.children.length > 1 && (
            <div className="child-selector">
              <p>Välj barn:</p>
              <div className="children-buttons">
                {state.children.map((c) => (
                  <button
                    key={c.id}
                    className={`btn-child ${c.id === state.activeChildId ? "active" : ""}`}
                    onClick={() => handleSelectChild(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
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
            
            // If returning to routine view, update the routine with latest version from activeChild
            let newState = { ...state, screen: previousScreen };
            if (previousScreen === "routine" && state.routine && activeChild) {
              const updatedRoutine = activeChild.routines.find(r => r.id === state.routine?.id);
              if (updatedRoutine) {
                console.log("🔄 Updating routine with latest version from activeChild");
                newState = { ...newState, routine: updatedRoutine };
              }
            }
            setState(newState);
          }}
          onUpdateChild={handleUpdateChild}
          onAddChild={handleAddChild}
          onDeleteChild={handleDeleteChild}
          onSelectChild={handleSelectChild}
        />
      )}
      {state.screen !== "settings" && (
        <a 
          href="https://www.prismasuecia.se" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="app-logo"
        >
          <img src="logo.png" alt="Logga" />
          <p className="app-credits">
            Min rutin är ett digitalt hjälpmedel utvecklat av <strong>Prisma Utbildning</strong> för att stödja barn i vardagliga rutiner på ett tryggt och förutsägbart sätt.
          </p>
        </a>
      )}
      <InstallPrompt />
    </div>
  );
}
