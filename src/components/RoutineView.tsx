import { useState, useEffect, useCallback, useRef } from "react";
import type {
  UserRoutine,
  ChildProfile,
} from "../routine";
import {
  StepStatus,
  setStepStatus,
} from "../routine";
import RoutineCard from "./RoutineCard";
import TimeRing from "./TimeRing";
import Confetti from "./Confetti";
import "./RoutineView.css";

interface RoutineViewProps {
  child: ChildProfile;
  routine: UserRoutine;
  onUpdateRoutine: (routine: UserRoutine) => void;
  onBack?: () => void;
  onEnterSettings?: () => void;
}

export default function RoutineView({
  child,
  routine,
  onUpdateRoutine,
  onBack,
  onEnterSettings,
}: RoutineViewProps) {
  const [localRoutine, setLocalRoutine] = useState(routine);
  const [paused, setPaused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAdultDialog, setShowAdultDialog] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(
    routine.steps.reduce((sum, s) => sum + s.remainingSeconds, 0)
  );
  const [remainingTotalSeconds, setRemainingTotalSeconds] = useState(
    routine.steps.reduce((sum, s) => sum + s.remainingSeconds, 0)
  );
  const timerRef = useRef<number | null>(null);
  const pressStartTime = useRef<number>(0);
  const lastTickRef = useRef<number | null>(null);
  const totalLastTickRef = useRef<number | null>(null);
  const totalTimerActiveRef = useRef(false);

  // Sync prop routine to local routine ONLY when routine.id changes (i.e., switching to a different routine)
  // Do NOT sync on every prop change, or it will revert local state changes
  useEffect(() => {
    console.log("📋 RoutineView loaded routine:", routine.title);
    setLocalRoutine(routine);
    const newTotal = routine.steps.reduce((sum, s) => sum + s.remainingSeconds, 0);
    setTotalSeconds(newTotal);
    setRemainingTotalSeconds(newTotal);
    setShowConfetti(false);
    setPaused(false);
    totalTimerActiveRef.current = false;
  }, [routine.id]);

  const colorMap: { [key: string]: string } = {
    calm: "#CDE8D8",
    highContrast: "#A7D7A9",
  };
  const bgColor = colorMap[child.colorProfile] || "#CDE8D8";

  const hasRunningStep = localRoutine.steps.some(
    (s) => s.status === StepStatus.Running && s.timerEnabled !== false
  );

  // Total timer: counts down overall time once the first step starts
  useEffect(() => {
    if (paused) {
      totalLastTickRef.current = null;
      return;
    }

    if (!totalTimerActiveRef.current && hasRunningStep) {
      totalTimerActiveRef.current = true;
      totalLastTickRef.current = Date.now();
    }

    if (!totalTimerActiveRef.current) {
      return;
    }

    const applyTotalElapsed = (seconds: number) => {
      if (seconds <= 0) return;
      setRemainingTotalSeconds((prev) => Math.max(0, prev - seconds));
    };

    const tick = () => {
      const now = Date.now();
      const last = totalLastTickRef.current ?? now;
      totalLastTickRef.current = now;
      applyTotalElapsed((now - last) / 1000);
    };

    totalLastTickRef.current = totalLastTickRef.current ?? Date.now();
    const interval = window.setInterval(tick, 1000);

    const resume = () => {
      if (!totalTimerActiveRef.current) return;
      const now = Date.now();
      const last = totalLastTickRef.current;
      if (last) {
        applyTotalElapsed((now - last) / 1000);
      }
      totalLastTickRef.current = now;
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        resume();
      }
    };

    window.addEventListener("focus", resume);
    window.addEventListener("pageshow", resume);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", resume);
      window.removeEventListener("pageshow", resume);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [hasRunningStep, paused]);

  // Timer loop - compensates for throttled timers when the screen sleeps
  useEffect(() => {
    if (paused || !hasRunningStep) {
      lastTickRef.current = null;
      return;
    }

    const applyElapsed = (elapsedSeconds: number) => {
      if (elapsedSeconds <= 0) return;

      setLocalRoutine((currentRoutine) => {
        let allDone = true;
        let changed = false;

        const updatedSteps = currentRoutine.steps.map((step) => {
          if (step.status === StepStatus.Running && step.timerEnabled !== false) {
            const newRemaining = Math.max(0, step.remainingSeconds - elapsedSeconds);
            const nextStatus = newRemaining === 0 ? StepStatus.Done : step.status;

            if (newRemaining !== step.remainingSeconds || nextStatus !== step.status) {
              changed = true;
            }

            if (nextStatus !== StepStatus.Done) {
              allDone = false;
            }

            if (nextStatus !== step.status || newRemaining !== step.remainingSeconds) {
              return { ...step, remainingSeconds: newRemaining, status: nextStatus };
            }
            return step;
          }

          if (step.status !== StepStatus.Done) {
            allDone = false;
          }

          return step;
        });

        if (allDone && !paused) {
          console.log("🎉 All done! Showing confetti");
          setShowConfetti(true);
          setPaused(true);
          totalTimerActiveRef.current = false;
        }

        return changed ? { ...currentRoutine, steps: updatedSteps } : currentRoutine;
      });
    };

    const tick = () => {
      const now = Date.now();
      const last = lastTickRef.current ?? now;
      lastTickRef.current = now;
      applyElapsed((now - last) / 1000);
    };

    lastTickRef.current = Date.now();
    const interval = window.setInterval(tick, 1000);

    const handleResume = () => {
      const now = Date.now();
      const last = lastTickRef.current;
      if (last) {
        applyElapsed((now - last) / 1000);
      }
      lastTickRef.current = now;
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleResume();
      }
    };

    window.addEventListener("focus", handleResume);
    window.addEventListener("pageshow", handleResume);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleResume);
      window.removeEventListener("pageshow", handleResume);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [hasRunningStep, paused]);

  const handleStartStep = useCallback(
    (stepId: string) => {
      const updated = setStepStatus(localRoutine, stepId, StepStatus.Running);
      setLocalRoutine(updated);
      onUpdateRoutine(updated);
    },
    [localRoutine, onUpdateRoutine]
  );

  const handleCompleteStep = useCallback(
    (stepId: string) => {
      const updated = setStepStatus(localRoutine, stepId, StepStatus.Done);
      setLocalRoutine(updated);
      onUpdateRoutine(updated);
    },
    [localRoutine, onUpdateRoutine]
  );

  // Long press timer effect - removed, no longer needed with PointerEvents
  
  const startPress = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    pressStartTime.current = Date.now();

    timerRef.current = window.setTimeout(() => {
      setShowAdultDialog(true);
    }, 2000);
  };

  const cancelPress = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e) {
      e.preventDefault();
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pressStartTime.current = 0;
  };

  const handleAdultYes = () => {
    setShowAdultDialog(false);
    if (onEnterSettings) {
      onEnterSettings();
    }
  };

  const handleAdultNo = () => {
    setShowAdultDialog(false);
  };

  const handleReset = () => {
    const reset = {
      ...localRoutine,
      steps: localRoutine.steps.map((s) => ({
        ...s,
        status: StepStatus.Todo,
        remainingSeconds: s.minutes * 60,
      })),
    };
    setLocalRoutine(reset);
    const resetTotal = reset.steps.reduce((sum, s) => sum + s.remainingSeconds, 0);
    setTotalSeconds(resetTotal);
    setRemainingTotalSeconds(resetTotal);
    onUpdateRoutine(reset);
    setShowConfetti(false);
    setPaused(false);
    totalTimerActiveRef.current = false;
  };

  // Auto-redirect back after confetti finishes
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false); // Close confetti before redirect
        if (onBack) {
          onBack();
        }
      }, 3000); // Wait for confetti to finish (2600ms) + 400ms buffer
      return () => clearTimeout(timer);
    }
  }, [showConfetti, onBack]);

  const todoSteps = localRoutine.steps.filter((s) => s.status !== StepStatus.Done);
  const doneSteps = localRoutine.steps.filter((s) => s.status === StepStatus.Done);

  return (
    <div className="routine-view">
      {/* Only show confetti if we actually have done steps */}
      {showConfetti && doneSteps.length > 0 && (
        <Confetti 
          show={true} 
          childName={child.name}
          onComplete={() => {
            console.log("🎉 Confetti complete, returning to start");
            if (onBack) onBack();
          }}
        />
      )}

      {showAdultDialog && (
        <div className="adult-dialog-overlay">
          <div className="adult-dialog">
            <h2>Är du vuxen?</h2>
            <div className="adult-dialog-buttons">
              <button className="adult-btn adult-btn-yes" onClick={handleAdultYes}>
                Ja
              </button>
              <button className="adult-btn adult-btn-no" onClick={handleAdultNo}>
                Nej
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="routine-header-container">
        {onBack && (
          <button className="btn-back" onClick={onBack}>
            ← Till startsidan
          </button>
        )}
        <div className="routine-header">
        <div 
          role="button"
          tabIndex={0}
          aria-label={`Långtryck på ${child.name} för inställningar`}
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerCancel={cancelPress}
          onPointerLeave={cancelPress}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none' as any,
            cursor: 'pointer',
            touchAction: 'none',
            outline: 'none',
          }}
        >
          <h1
            style={{ margin: 0, pointerEvents: 'none' }}
            title="Tryck och håll på namnet för att ändra inställningar"
          >
            God morgon, {child.name}!
          </h1>
        </div>
          <p className="long-press-hint">Tryck och håll på namnet för att ändra inställningar</p>
        </div>
      </div>

      <div className="routine-controls">
        <button
          className="btn btn-pause"
          onClick={() => setPaused(!paused)}
          title="Pausa eller återuppta rutinen"
        >
          {paused ? "Fortsätt" : "Pausa"}
        </button>
        <button
          className="btn btn-reset"
          onClick={handleReset}
          title="Återställ alla steg till början"
        >
          Nollställ
        </button>
      </div>

      <div className="routine-main">
        <div className="time-ring-wrapper">
          <TimeRing totalSeconds={totalSeconds} remainingSeconds={remainingTotalSeconds} size={240} />
        </div>

        <div className="routine-zones">
          <div className="zone todo-zone">
            <h2>Att göra</h2>
            <div className="cards-list">
              {todoSteps.map((step) => (
                <RoutineCard
                  key={step.id}
                  step={step}
                  onStart={() => handleStartStep(step.id)}
                  onComplete={() => handleCompleteStep(step.id)}
                  colorHex={bgColor}
                />
              ))}
            </div>
          </div>

          <div className="zone done-zone">
            <h2>Klart</h2>
            <div className="cards-list">
              {doneSteps.map((step) => (
                <RoutineCard
                  key={step.id}
                  step={step}
                  onStart={() => {}}
                  onComplete={() => {}}
                  colorHex={bgColor}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
