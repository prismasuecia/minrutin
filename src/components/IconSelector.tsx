import { useState } from "react";
import { AVAILABLE_ICONS, getIconsByCategory } from "../utils/icons";
import IconDisplay from "./IconDisplay";
import "./IconSelector.css";

interface IconSelectorProps {
  selectedIcon?: string;
  onSelectIcon: (iconName: string) => void;
  onClose?: () => void;
}

export default function IconSelector({ selectedIcon, onSelectIcon, onClose }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const iconsByCategory = getIconsByCategory();

  // Filter icons by search term
  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectIcon = (iconName: string) => {
    onSelectIcon(iconName);
    if (onClose) {
      onClose();
    }
  };

  const handleClearIcon = () => {
    onSelectIcon("");
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="icon-selector-overlay" onClick={onClose}>
      <div className="icon-selector" onClick={(e) => e.stopPropagation()}>
        <div className="icon-selector-header">
          <h3>Välj ikon</h3>
          {onClose && (
            <button
              className="icon-selector-close"
              onClick={onClose}
              title="Stäng"
            >
              ✕
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Sök ikon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="icon-selector-search"
          autoFocus
        />

        <div className="icon-selector-content">
          {searchTerm ? (
            // Search results
            <div className="icon-grid">
              {filteredIcons.length > 0 ? (
                filteredIcons.map((icon) => (
                  <button
                    key={icon.name}
                    className={`icon-item ${selectedIcon === icon.name ? "selected" : ""}`}
                    onClick={() => handleSelectIcon(icon.name)}
                    title={icon.label}
                  >
                    <span className="icon-emoji">
                      <IconDisplay iconName={icon.name} size="large" />
                    </span>
                    <span className="icon-label">{icon.label}</span>
                  </button>
                ))
              ) : (
                <p className="no-results">Inga ikoner hittades</p>
              )}
            </div>
          ) : (
            // Category view
            <div className="icon-categories">
              {Object.entries(iconsByCategory).map(([category, icons]) => (
                <div key={category} className="icon-category">
                  <h4 className="category-title">{category}</h4>
                  <div className="icon-grid">
                    {icons.map((icon) => (
                      <button
                        key={icon.name}
                        className={`icon-item ${selectedIcon === icon.name ? "selected" : ""}`}
                        onClick={() => handleSelectIcon(icon.name)}
                        title={icon.label}
                      >
                        <span className="icon-emoji">
                          <IconDisplay iconName={icon.name} size="large" />
                        </span>
                        <span className="icon-label">{icon.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="icon-selector-footer">
          <button
            className="btn-small btn-secondary"
            onClick={handleClearIcon}
          >
            Ingen ikon
          </button>
        </div>
      </div>
    </div>
  );
}
