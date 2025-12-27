import { getIcon, getIconEmoji } from "../utils/icons";

interface IconDisplayProps {
  iconName?: string;
  className?: string;
  size?: "small" | "medium" | "large";
}

/**
 * Display an icon using emoji (fast and responsive)
 */
export default function IconDisplay({ iconName, className = "", size = "medium" }: IconDisplayProps) {
  const sizeClass = `icon-display-${size}`;
  const emoji = getIconEmoji(iconName);
  const icon = getIcon(iconName);

  return (
    <span
      className={`icon-display ${sizeClass} ${className}`}
      title={icon?.label || "Ingen ikon"}
    >
      {emoji}
    </span>
  );
}
