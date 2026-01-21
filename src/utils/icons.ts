/**
 * Icon Management System
 * 
 * This module manages the available icons for routine steps.
 * 
 * Icons can come from:
 * 1. Custom SVG icons - stored in /src/assets/icons/
 * 2. SF Symbols (Apple's icon set) - using their standard names
 * 3. Emoji fallbacks - for web/non-Apple environments
 * 
 * Each icon has a name, label, and emoji fallback for accessibility.
 */

export interface IconDefinition {
  name: string;           // Unique identifier
  label: string;          // Human-readable label for UI
  emoji: string;          // Emoji fallback for display
  category?: string;      // Category for organizing icons (optional)
  svgPath?: string;       // Path to SVG file in /src/assets/icons/
}

/**
 * Complete list of available icons organized by category.
 * Add new icons here and they'll automatically be available in the selector.
 */
export const AVAILABLE_ICONS: IconDefinition[] = [
  // Morning routines
  { name: "wake-up", label: "Gå upp", emoji: "🛏️", category: "Morgon", svgPath: "icons/wake-up.svg" },
  { name: "brush-teeth", label: "Borsta tänder", emoji: "✨", category: "Morgon", svgPath: "icons/brush-teeth.svg" },
  { name: "take-shower", label: "Duscha", emoji: "🚿", category: "Morgon", svgPath: "icons/take-shower.svg" },
  { name: "get-dressed", label: "Klä på dig", emoji: "👕", category: "Morgon", svgPath: "icons/get-dressed.svg" },
  
  // Meals
  { name: "eat-breakfast", label: "Äta frukost", emoji: "🍴", category: "Mat", svgPath: "icons/eat-breakfast.svg" },
  
  // Activities
  { name: "read-book", label: "Läsa bok", emoji: "📖", category: "Aktiviteter", svgPath: "icons/read-book.svg" },
  
  // Evening routines
  { name: "lamp-table", label: "Läsa på kvällen", emoji: "💡", category: "Kväll", svgPath: "icons/lamp-table.svg" },
  { name: "moon-stars", label: "Sova", emoji: "🌙", category: "Kväll", svgPath: "icons/moon-stars.svg" },
  { name: "bedtime", label: "Sovdags", emoji: "🌙", category: "Kväll", svgPath: "icons/bedtime.svg" },
  
  // Default/General
  { name: "star", label: "Aktivitet", emoji: "⭐", category: "Allmänt", svgPath: "icons/star.svg" },
];

/**
 * Get icon definition by name
 */
export function getIcon(iconName?: string): IconDefinition | null {
  if (!iconName) return null;
  return AVAILABLE_ICONS.find(icon => icon.name === iconName) || null;
}

/**
 * Get all icons grouped by category
 */
export function getIconsByCategory(): Record<string, IconDefinition[]> {
  const grouped: Record<string, IconDefinition[]> = {};
  
  AVAILABLE_ICONS.forEach(icon => {
    const category = icon.category || "Övriga";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(icon);
  });
  
  return grouped;
}

/**
 * Get all available icon names
 */
export function getAllIconNames(): string[] {
  return AVAILABLE_ICONS.map(icon => icon.name);
}

/**
 * Validate that an icon name exists in the available icons
 */
export function isValidIcon(iconName?: string): boolean {
  if (!iconName) return true; // undefined/empty is valid (means no icon)
  return getAllIconNames().includes(iconName);
}

/**
 * Get emoji for an icon name (useful for quick display)
 */
export function getIconEmoji(iconName?: string): string {
  const icon = getIcon(iconName);
  return icon?.emoji || "◯"; // Return circle as default fallback
}
