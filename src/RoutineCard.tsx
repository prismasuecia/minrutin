import type { RoutineStep } from "./RoutineStepModel";
import { StepStatus } from "./RoutineStepModel";

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

type IconProps = { size?: number };

function IconToothbrush({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h10v3H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 6v6c0 1-1 2-2 2H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 6v11c0 2-1.5 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconPlate({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconShirt({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 5l4 3 4-3 3 3-2 3v11H7V11L5 8l3-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconShower({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h10a4 4 0 1 0-8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 13l-1 2M12 13l-1 2M16 13l-1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconBook({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 4h9a3 3 0 0 1 3 3v13H9a3 3 0 0 0-3 3V4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M6 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconBag({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 8V7a5 5 0 0 1 10 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 8h12l-1 13H7L6 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function IconGeneric({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function pickIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("tänd") || t.includes("tand") || t.includes("borsta")) return IconToothbrush;
  if (t.includes("frukost") || t.includes("middag") || t.includes("äta")) return IconPlate;
  if (t.includes("klä") || t.includes("tröja") || t.includes("jacka") || t.includes("pyj")) return IconShirt;
  if (t.includes("dusch") || t.includes("bada")) return IconShower;
  if (t.includes("läsa") || t.includes("bok")) return IconBook;
  if (t.includes("väska") || t.includes("packa")) return IconBag;
  return IconGeneric;
}

export default function RoutineCard({  step,
  disabled,
  onPress,
}: {
  step: RoutineStep;
  disabled?: boolean;
  onPress: () => void;
}) {
  const Icon = pickIcon(step.title);
  const isDone = step.status === StepStatus.Done;
  const isRunning = step.status === StepStatus.Running;

  return (
    <button
      onClick={onPress}
      disabled={disabled || isDone}
      style={{
        width: "100%",
        padding: "14px 14px",
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.12)",
        background: isRunning ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.02)",
        textAlign: "left",
        cursor: disabled || isDone ? "default" : "pointer",
        opacity: isDone ? 0.58 : 1,
        display: "grid",
        gridTemplateColumns: "44px 1fr auto",
        alignItems: "center",
        gap: 12,
      }}
      aria-label={`${step.title} ${isDone ? "klar" : "ej klar"}`}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: "rgba(0,0,0,0.04)",
          display: "grid",
          placeItems: "center",
          color: "rgba(0,0,0,0.78)",
        }}
      >
        <Icon size={26} />
      </div>

      <div>
        <div style={{ fontWeight: 950, fontSize: "1.1rem" }}>{step.title}</div>
        <div style={{ opacity: 0.72, fontWeight: 800, marginTop: 4 }}>
          {isDone ? "Klar" : formatMMSS(step.remainingSeconds)}
        </div>
      </div>

      <div style={{ fontWeight: 950, opacity: 0.72, paddingLeft: 8 }}>
        {isDone ? "✔" : isRunning ? "⏳" : "▶"}
      </div>
    </button>
  );
}