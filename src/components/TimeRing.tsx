import "./TimeRing.css";

interface TimeRingProps {
  totalSeconds: number;
  remainingSeconds?: number;
  size?: number;
}

export default function TimeRing({ totalSeconds, remainingSeconds, size = 280 }: TimeRingProps) {
  const total = Math.max(1, Math.floor(totalSeconds));
  const remaining = Math.max(0, Math.floor(remainingSeconds ?? totalSeconds));
  const ratio = Math.min(1, Math.max(0, remaining / total));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const circumference = 2 * Math.PI * (size / 2 - 16);
  const offset = circumference * (1 - ratio);

  return (
    <div className="time-ring-container" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="time-ring-svg"
      >
        {/* Green outer ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="#E0F2F1"
          strokeWidth="4"
        />

        {/* White background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 16}
          fill="white"
          stroke="none"
        />

        {/* Red progress sector */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 16}
          fill="none"
          stroke="#D1463A"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transform: `rotate(-90deg)`,
            transformOrigin: `${size / 2}px ${size / 2}px`,
            transition: "stroke-dashoffset 1s linear",
          }}
        />
      </svg>

      {/* Center label */}
      <div className="time-ring-label">
        <div className="time-display">
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
