import "./TimeRing.css";

interface TimeRingProps {
  totalSeconds: number;
  size?: number;
}

export default function TimeRing({ totalSeconds, size = 280 }: TimeRingProps) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  // Assume max 60 minutes (3600 seconds)
  const percent = Math.min(100, (totalSeconds / 3600) * 100);
  const circumference = 2 * Math.PI * (size / 2 - 16);
  const offset = circumference - (percent / 100) * circumference;

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
