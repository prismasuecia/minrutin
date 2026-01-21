import type { RoutineStep } from "../routine";
import { StepStatus } from "../routine";
import IconDisplay from "./IconDisplay";
import "./RoutineCard.css";

interface RoutineCardProps {
  step: RoutineStep;
  onStart: () => void;
  onComplete: () => void;
  colorHex: string;
}

export default function RoutineCard({
  step,
  onStart,
  onComplete,
  colorHex,
}: RoutineCardProps) {
  const isDone = step.status === StepStatus.Done;
  const isRunning = step.status === StepStatus.Running;
  const roundedSeconds = Math.max(0, Math.round(step.remainingSeconds));
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;

  let timerContent: string | null = null;
  if (step.timerEnabled) {
    timerContent = isDone
      ? "Klar ✅"
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <div
      className={`routine-card ${isDone ? "done" : ""} ${isRunning ? "running" : ""}`}
      style={{
        backgroundColor: colorHex,
        opacity: isDone ? 0.5 : 1,
      }}
      onClick={() => {
        console.log(`🔘 Clicked on "${step.title}" - isDone: ${isDone}, isRunning: ${isRunning}`);
        if (!isDone && !isRunning) {
          console.log(`▶️ Starting step: ${step.title}`);
          onStart();
        }
      }}
    >
      <div className="card-icon">
        <IconDisplay iconName={step.iconName} size="large" />
      </div>

      <div className="card-content">
        <h2 className="card-title">{step.title}</h2>
        {timerContent && <div className="card-timer">{timerContent}</div>}
      </div>

      {isRunning && (
        <button className="btn-complete" onClick={onComplete}>
          Jag är klar!
        </button>
      )}
    </div>
  );
}
