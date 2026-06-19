import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESET_COLORS = [
  "#000000", // Black
  "#FFFFFF", // White
  "#808080", // Gray
  "#C0C0C0", // Silver
  "#8B4513", // Brown
  "#F5DEB3", // Beige
  "#FF0000", // Red
  "#DC143C", // Crimson
  "#FFA500", // Orange
  "#FFD700", // Yellow
  "#008000", // Green
  "#00A86B", // Emerald
  "#0000FF", // Blue
  "#1E3A8A", // Navy
  "#4B0082", // Indigo
  "#800080", // Purple
  "#FFC0CB", // Pink
  "#FF69B4", // Hot Pink
  "#40E0D0", // Turquoise
  "#008080", // Teal
] as const;

const wrapperClass = "space-y-4";

const headerClass = "space-y-1";

const titleClass = "text-sm font-semibold text-foreground";

const actionsRowClass = "flex flex-wrap items-center gap-3";

const colorInputClass = "h-11 w-16 rounded-lg p-1";

const presetGridClass = "flex flex-wrap gap-2";

const presetButtonClass =
  "h-8 w-8 rounded-full border border-border shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const colorsListClass = "flex flex-wrap gap-2";

const colorChipClass =
  "group inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground transition hover:bg-muted";

const colorDotClass =
  "h-4 w-4 rounded-full border border-black/10 shrink-0";

const colorLabelClass =
  "font-mono text-xs uppercase text-muted-foreground";

const removeIconClass =
  "h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground";

type ColorPickerProps = {
  colors: string[];
  onAdd: (color: string) => void;
  onRemove: (color: string) => void;
};

export function ColorPicker({
  colors,
  onAdd,
  onRemove,
}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState("#111111");

  return (
    <div className={wrapperClass}>
      <div className={headerClass}>
        <h3 className={titleClass}>Colors</h3>
      </div>

      <div className={actionsRowClass}>
        <Input
          type="color"
          value={selectedColor}
          onChange={(event) => setSelectedColor(event.target.value)}
          className={colorInputClass}
        />

        <Button
          type="button"
          variant="secondary"
          onClick={() => onAdd(selectedColor)}
        >
          Add Color
        </Button>
      </div>

      <div className={presetGridClass}>
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Add color ${color}`}
            title={color}
            onClick={() => onAdd(color)}
            className={presetButtonClass}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {colors.length > 0 && (
        <div className={colorsListClass}>
          {colors.map((colorItem) => (
            <button
              key={colorItem}
              type="button"
              onClick={() => onRemove(colorItem)}
              className={colorChipClass}
              title={`Remove ${colorItem}`}
            >
              <span
                className={colorDotClass}
                style={{ backgroundColor: colorItem }}
              />

              <span className={colorLabelClass}>
                {colorItem}
              </span>

              <X className={removeIconClass} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

