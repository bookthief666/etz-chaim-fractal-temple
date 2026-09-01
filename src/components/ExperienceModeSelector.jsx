const MODES = [
  { id: 'vision', label: 'Vision', latin: 'VISIO', title: 'Pure Vision — direct immersion, minimal interface' },
  { id: 'study', label: 'Study', latin: 'STUDIUM', title: 'Study — dossiers, provenance and attribution layers' },
  { id: 'contemplation', label: 'Contemplate', latin: 'CONTEMPLATIO', title: 'Contemplation — restrained threshold phrases and prompts' },
]

export default function ExperienceModeSelector({ value, onChange, disabled = false }) {
  return (
    <div className="experience-mode-selector" role="group" aria-label="Experience mode">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          className={`experience-mode-button ${value === mode.id ? 'is-active' : ''}`}
          disabled={disabled}
          aria-pressed={value === mode.id}
          title={mode.title}
          onClick={() => onChange(mode.id)}
        >
          <span>{mode.label}</span>
          <small>{mode.latin}</small>
        </button>
      ))}
    </div>
  )
}
