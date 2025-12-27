import { useEffect, useState } from "react";
import "./Confetti.css";

interface ConfettiProps {
  childName: string;
  onComplete: () => void;
}

export default function Confetti({ childName, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      delay: Math.random() * 0.3,
    }));
    setParticles(newParticles);

    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="confetti-overlay">
      <div className="celebration-box">
        <h1 className="celebration-text">Bra jobbat, {childName}! 🎉</h1>
      </div>

      <div className="confetti-container">
        {particles.map((p) => (
          <div
            key={p.id}
            className="confetti-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              "--delay": `${p.delay}s`,
            } as React.CSSProperties & { "--delay": string }}
          />
        ))}
      </div>
    </div>
  );
}
