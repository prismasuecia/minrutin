import { useEffect, useMemo, useState } from "react";

type Piece = {
  id: string;
  left: number; // %
  size: number; // px
  delay: number; // s
  duration: number; // s
  rotate: number; // deg
};

export default function Confetti({ show }: { show: boolean }) {
  const pieces = useMemo<Piece[]>(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: `c${i}`,
      left: Math.random() * 100,
      size: 6 + Math.random() * 10,
      delay: Math.random() * 0.6,
      duration: 1.6 + Math.random() * 1.2,
      rotate: Math.random() * 360,
    }));
  }, []);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [show]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      <style>
        {`
          @keyframes confetti-fall {
            0% { transform: translateY(-10vh) rotate(var(--r)); opacity: 1; }
            100% { transform: translateY(110vh) rotate(calc(var(--r) + 720deg)); opacity: 0.9; }
          }
        `}
      </style>

      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "-10vh",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${Math.max(8, p.size * 1.4)}px`,
            borderRadius: 3,
            background: "currentColor",
            opacity: 0.95,
            animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
            color: "hsl(var(--hue, 200) 80% 55%)",
            ["--r" as any]: `${p.rotate}deg`,
            ["--hue" as any]: `${Math.floor(Math.random() * 360)}`,
          }}
        />
      ))}
    </div>
  );
}