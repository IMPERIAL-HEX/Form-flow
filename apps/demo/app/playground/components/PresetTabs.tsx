import type { SchemaPreset } from '@/lib/schemas/presetSchemas';

interface PresetTabsProps {
  presets: SchemaPreset[];
  activePresetId: string;
  onSelect: (presetId: string) => void;
}

export function PresetTabs({ presets, activePresetId, onSelect }: PresetTabsProps): React.ReactNode {
  return (
    <div className="ff-tabs" role="tablist" aria-label="Schema presets">
      {presets.map((preset) => {
        const selected = preset.id === activePresetId;

        return (
          <button
            key={preset.id}
            type="button"
            className={`ff-tab ${selected ? 'ff-tab-active' : ''}`}
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(preset.id)}
          >
            <span className="ff-tab-title">{preset.title}</span>
            <span className="ff-tab-description">{preset.description}</span>
          </button>
        );
      })}
    </div>
  );
}
