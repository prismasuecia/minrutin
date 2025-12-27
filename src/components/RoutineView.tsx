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
  const [paused, setPaused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAdultDialog, setShowAdultDialog] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(
    routine.steps.reduce((sum, s) => sum + s.remainingSeconds, 0)
  );
  const timerRef = useRef<number | null>(null);
  const pressStartTime = useRef<number>(0);

  // Log when routine changes (e.g., from settings update)
  useEffect(() => {
    console.log("📋 RoutineView received updated routine:", {
      title: routine.title,
      steps: routine.steps.map(s => ({ id: s.id, title: s.title, minutes: s.remainingSeconds / 60, iconName: s.iconName }))
    });
    setTotalSeconds(routine.steps.reduce((sum, s) => sum + s.remainingSeconds, 0));
    setShowConfetti(false); // Always reset confetti when routine opens
    setPaused(false); // Unpause
  }, [routine.id]);

  const colorMap: { [key: string]: string } = {
    calm: "#CDE8D8",
    highContrast: "#A7D7A9",
  };
  const bgColor = colorMap[child.colorProfile] || "#CDE8D8";

  // Timer loop - only runs if at least one step is Running
  useEffect(() => {
    // Check if any step is running
    const hasRunningStep = routine.steps.some(s => s.status === StepStatus.Running);
    
    if (paused || !hasRunningStep) return;

    const interval = setInterval(() => {
      setTotalSeconds((_prev) => {
        let updated = { ...routine };
        let allDone = true;
        let changed = false;

        updated.steps = updated.steps.map((step) => {
          if (step.status === StepStatus.Running && step.timerEnabled) {
            const newRemaining = Math.max(0, step.remainingSeconds - 1);
            if (newRemaining === 0) {
              changed = true;
              return { ...step, remainingSeconds: 0, status: StepStatus.Done };
            }
            allDone = false;
            changed = true;
            return { ...step, remainingSeconds: newRemaining };
          }
          if (step.status !== StepStatus.Done) {
            allDone = false;
          }
          return step;
        });

        if (changed) {
          onUpdateRoutine(updated);
        }

        const newTotal = updated.steps.reduce(
          (sum, s) => sum + s.remainingSeconds,
          0
        );

        // Only show confetti if ALL steps are done
        if (allDone && !paused) {
          console.log("🎉 All done! Showing confetti");
          setShowConfetti(true);
          setPaused(true);
        }

        return newTotal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [routine, paused, onUpdateRoutine]);

  const handleStartStep = useCallback(
    (stepId: string) => {
      const updated = setStepStatus(routine, stepId, StepStatus.Running);
      onUpdateRoutine(updated);
    },
    [routine, onUpdateRoutine]
  );

  const handleCompleteStep = useCallback(
    (stepId: string) => {
      const updated = setStepStatus(routine, stepId, StepStatus.Done);
      onUpdateRoutine(updated);
    },
    [routine, onUpdateRoutine]
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
      ...routine,
      steps: routine.steps.map((s) => ({
        ...s,
        status: StepStatus.Todo,
        remainingSeconds: s.minutes * 60,
      })),
    };
    onUpdateRoutine(reset);
    setShowConfetti(false);
    setPaused(false);
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

  const todoSteps = routine.steps.filter((s) => s.status !== StepStatus.Done);
  const doneSteps = routine.steps.filter((s) => s.status === StepStatus.Done);

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
        >
          {paused ? "Fortsätt" : "Pausa"}
        </button>
        <button 
          className="btn btn-reset" 
          onClick={handleReset}
          style={{ pointerEvents: 'auto' }}
        >
          Återställ
        </button>
      </div>

      <div className="routine-main">
        <div className="time-ring-wrapper">
          <TimeRing totalSeconds={totalSeconds} size={240} />
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
