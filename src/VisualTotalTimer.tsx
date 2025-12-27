import { useEffect, useMemo, useState } from "react";

type Props = {
  totalSeconds: number;
  remainingSeconds: number;
  label?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const to2 = (x: number) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixHex(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(lerp(A.r, B.r, t), lerp(A.g, B.g, t), lerp(A.b, B.b, t));
}

function ringColorFromRatio(ratio: number) {
  const green = "#6CBF84";
  const yellow = "#E6C15A";
  const red = "#E07A7A";

  const r = clamp(ratio, 0, 1);

  if (r >= 0.5) {
    const t = (1 - r) / (1 - 0.5);
    return mixHex(green, yellow, t);
  }

  const tRaw = (0.5 - r) / 0.5;
  const t = Math.pow(tRaw, 0.85);
  return mixHex(yellow, red, t);
}

export default function VisualTotalTimer({ totalSeconds, remainingSeconds, label }: Props) {
  const total = Math.max(1, Math.floor(totalSeconds));
  const remaining = clamp(Math.floor(remainingSeconds), 0, total);
  const ratio = remaining / total;

  const baseSize = 280;
  const baseStroke = 22;

  // ✅ Kritisk zon: under 10% blir ringen lite tjockare (diskret men tydligt)
  const isCritical = ratio <= 0.1;
  const stroke = isCritical ? 28 : baseStroke;

  // Eftersom stroke ändras måste vi räkna om radien så att allt fortfarande ryms
  const size = baseSize;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const dashOffset = c * (1 - ratio);
  const ringColor = useMemo(() => ringColorFromRatio(ratio), [ratio]);

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const apply = () => setReducedMotion(!!mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const showLowHint = ratio <= 0.2;

  return (
    <div style={{ display: "grid", placeItems: "center" }}>
      {label ? (
        <div style={{ fontWeight: 900, opacity: 0.75, marginBottom: 10, fontSize: "1rem" }}>
          {label}
        </div>
      ) : null}

      <div
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          position: "relative",
        }}
        aria-label={`Tid kvar ${formatMMSS(remaining)}`}
      >
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={stroke}
          />

          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dashOffset}
            style={{
              transition: reducedMotion
                ? "none"
                : "stroke 250ms ease, stroke-dashoffset 450ms ease, stroke-width 250ms ease",
            }}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            padding: 10,
          }}
        >
          <div style={{ fontSize: "3.2rem", fontWeight: 950, lineHeight: 1 }}>
            {formatMMSS(remaining)}
          </div>

          {showLowHint ? (
            <div style={{ marginTop: 8, fontWeight: 900, opacity: 0.75 }}>
              Snart klart
            </div>
          ) : (
            <div style={{ marginTop: 8, fontWeight: 900, opacity: 0.55 }}>
              {Math.round(ratio * 100)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}