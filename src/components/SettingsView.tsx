import { useState, useRef, useEffect } from "react";
import type {
  ChildProfile,
  ColorProfile,
  UserRoutine,
} from "../routine";
import { StepStatus } from "../routine";
import IconSelector from "./IconSelector";
import IconDisplay from "./IconDisplay";
import "./SettingsView.css";

interface SettingsViewProps {
  children: ChildProfile[];
  activeChildId: string;
  onClose: () => void;
  onUpdateChild: (child: ChildProfile) => void;
  onAddChild: (name: string) => void;
  onDeleteChild: (id: string) => void;
  onSelectChild: (id: string) => void;
}

export default function SettingsView({
  children,
  activeChildId,
  onClose,
  onUpdateChild,
  onAddChild,
  onDeleteChild,
  onSelectChild,
}: SettingsViewProps) {
  const [newChildName, setNewChildName] = useState("");
  const activeChild = children.find((c) => c.id === activeChildId);

  const handleAddChild = () => {
    if (newChildName.trim()) {
      onAddChild(newChildName);
      setNewChildName("");
    }
  };

  const updateChildColor = (profile: ChildProfile, color: ColorProfile) => {
    onUpdateChild({ ...profile, colorProfile: color });
  };

  const updateChildRoutine = (profile: ChildProfile, updatedRoutine: UserRoutine) => {
    console.log("💾 Saving routine:", updatedRoutine.title, "with steps:", updatedRoutine.steps.length);
    console.log("   Steps detail:", updatedRoutine.steps.map(s => ({ id: s.id, title: s.title, minutes: s.minutes })));
    const updated = {
      ...profile,
      routines: profile.routines.map((r) => r.id === updatedRoutine.id ? updatedRoutine : r),
    };
    console.log("   Updated child routines:", updated.routines.map(r => ({ id: r.id, title: r.title, stepCount: r.steps.length })));
    onUpdateChild(updated);
  };

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h1>Föräldraläge</h1>
        <button 
          className="btn-close" 
          onClick={() => {
            console.log("🔴 Close button clicked!");
            onClose();
          }}
          style={{ pointerEvents: 'auto' }}
        >
          ✕
        </button>
      </div>

      <div className="settings-content">
        {/* Child Profiles Section */}
        <section className="settings-section">
          <h2>Barnprofiler</h2>
          <div className="children-grid">
            {children.map((child) => (
              <div
                key={child.id}
                className={`child-card ${child.id === activeChildId ? "active" : ""}`}
                onClick={() => onSelectChild(child.id)}
              >
                <div className="child-avatar">{child.name.charAt(0)}</div>
                <h3>{child.name}</h3>
                <div className="child-actions">
                  <button
                    className="btn-small btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChild(child.id);
                    }}
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="add-child-form">
            <input
              type="text"
              placeholder="Nytt barns namn"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddChild()}
            />
            <button className="btn-primary" onClick={handleAddChild}>
              + Lägg till barn
            </button>
          </div>
        </section>

        {/* Edit Active Child */}
        {activeChild && (
          <section className="settings-section">
            <h2>Inställningar för {activeChild.name}</h2>

            <div className="setting-group">
              <label>Barnets namn</label>
              <input
                type="text"
                value={activeChild.name}
                onChange={(e) =>
                  onUpdateChild({ ...activeChild, name: e.target.value })
                }
                className="name-input"
                placeholder="Barnets namn"
              />
            </div>

            <div className="setting-group">
              <label>Färgtema</label>
              <div className="color-buttons">
                <button
                  className={`color-btn ${activeChild.colorProfile === "calm" ? "active" : ""}`}
                  style={{ backgroundColor: "#CDE8D8" }}
                  onClick={() => updateChildColor(activeChild, "calm")}
                  title="Dova färger och mjuka kontraster – rekommenderas för NPF"
                >
                  🟢 Lugn
                </button>
                <button
                  className={`color-btn ${activeChild.colorProfile === "highContrast" ? "active" : ""}`}
                  style={{ backgroundColor: "#A7D7A9" }}
                  onClick={() => updateChildColor(activeChild, "highContrast")}
                  title="Kraftigare färger och hög kontrast – ger tydligare visuella signaler"
                >
                  🔴 Starkt
                </button>
              </div>
              <p className="color-description">
                {activeChild.colorProfile === "calm" 
                  ? "Dova färger och mjuka kontraster – rekommenderas för NPF."
                  : "Kraftigare färger och hög kontrast – ger tydligare visuella signaler."}
              </p>
            </div>

            <div className="routines-list">
              <h3>Rutiner</h3>
              {activeChild.routines.map((routine) => (
                <div key={routine.id} className="routine-edit-section">
                  <RoutineEditor
                    routine={routine}
                    onSave={(r) => updateChildRoutine(activeChild, r)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

interface RoutineEditorProps {
  routine: UserRoutine;
  onSave: (routine: UserRoutine) => void;
}

function RoutineEditor({ routine, onSave }: RoutineEditorProps) {
  const [edited, setEdited] = useState(routine);
  const newStepIdsRef = useRef<Set<string>>(new Set());
  const [iconSelectorOpen, setIconSelectorOpen] = useState<string | null>(null); // Track which step's icon selector is open

  // Sync edited state when routine prop changes
  useEffect(() => {
    setEdited(routine);
  }, [routine.id]); // Only update when routine id changes, not when entire routine object changes

  const handleStepChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updatedSteps = [...edited.steps];
    const step = { ...updatedSteps[index], [field]: value };
    
    console.log(`📝 Step change - field: ${field}, value: ${value}, iconName before: ${updatedSteps[index].iconName}, iconName after: ${step.iconName}`);
    
    // If minutes changed, update remainingSeconds
    if (field === "minutes") {
      step.remainingSeconds = value * 60;
    }
    
    updatedSteps[index] = step;
    setEdited({ ...edited, steps: updatedSteps });
  };

  const handleIconSelect = (stepId: string, iconName: string) => {
    const stepIndex = edited.steps.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      handleStepChange(stepIndex, "iconName", iconName);
      setIconSelectorOpen(null);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setEdited({
      ...edited,
      title: newTitle,
    });
  };

  const handleAddStep = () => {
    const newStepId = "step-" + Math.random().toString(36).substr(2, 9);
    const newStep = {
      id: newStepId,
      title: "Ny aktivitet",
      minutes: 5,
      status: StepStatus.Todo,
      remainingSeconds: 300,
      timerEnabled: true,
      iconName: "star",
    };
    setEdited({
      ...edited,
      steps: [...edited.steps, newStep],
    });
    // Track that this is a new step using ref
    newStepIdsRef.current.add(newStepId);
  };

  const handleRemoveStep = (index: number) => {
    const removedStepId = edited.steps[index].id;
    newStepIdsRef.current.delete(removedStepId);
    setEdited({
      ...edited,
      steps: edited.steps.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="routine-editor">
      <div className="routine-title-input">
        <input
          type="text"
          value={edited.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Rutinens namn"
          className="routine-name-input"
          disabled
        />
      </div>
      <div className="routine-steps">
        {edited.steps.map((step, idx) => (
          <div key={step.id} className="step-row">
            <div className="step-icon-selector">
              <button
                className="btn-icon-select"
                onClick={() => setIconSelectorOpen(step.id)}
                title="Välj ikon för denna aktivitet"
              >
                <IconDisplay iconName={step.iconName} size="medium" />
              </button>
              {iconSelectorOpen === step.id && (
                <IconSelector
                  selectedIcon={step.iconName}
                  onSelectIcon={(iconName) => handleIconSelect(step.id, iconName)}
                  onClose={() => setIconSelectorOpen(null)}
                />
              )}
            </div>
            <input
              type="text"
              value={step.title}
              onChange={(e) => handleStepChange(idx, "title", e.target.value)}
              className="step-title-input"
              placeholder="Stegnamn"
            />
            <input
              type="number"
              min="1"
              max="60"
              value={step.minutes}
              onChange={(e) =>
                handleStepChange(idx, "minutes", parseInt(e.target.value))
              }
              className="step-minutes-input"
            />
            <span className="step-minutes-label">min</span>
            <label className="step-toggle">
              <input
                type="checkbox"
                checked={step.timerEnabled ?? true}
                onChange={(e) =>
                  handleStepChange(idx, "timerEnabled", e.target.checked)
                }
              />
              Timer
            </label>
            <button
              className="btn-remove-step"
              onClick={() => handleRemoveStep(idx)}
              title="Ta bort denna aktivitet"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="routine-editor-actions">
        <button className="btn-small btn-add-step" onClick={handleAddStep}>
          + Lägg till aktivitet
        </button>
        <button className="btn-small" onClick={() => {
          console.log("✅ Save button clicked for routine:", edited.title);
          console.log("   Total steps:", edited.steps.length);
          console.log("   Steps:", edited.steps.map(s => ({ id: s.id, title: s.title })));
          
          // Only filter out placeholder steps that still have the default "Ny aktivitet" title
          const filteredRoutine = {
            ...edited,
            steps: edited.steps.filter(step => {
              // If this is a new step that still has the placeholder name, filter it out
              if (newStepIdsRef.current.has(step.id) && step.title.trim() === "Ny aktivitet") {
                console.log("   Filtering out placeholder step:", step.id);
                return false;
              }
              // Keep all other steps
              return true;
            })
          };
          console.log("   After filtering:", filteredRoutine.steps.length, "steps");
          onSave(filteredRoutine);
        }}>
          Spara ändringar
        </button>
      </div>
    </div>
  );
}
