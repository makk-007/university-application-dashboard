import { Loader2 } from "lucide-react";
import { inputCls } from "./ui/input-classes";

interface EditableLinkProps {
  label: string;
  value: string;
  error: string | null;
  saving: boolean;
  onChange: (value: string) => void;
  /** Called when the box loses focus; the parent validates and saves. */
  onBlur: () => void;
}

/** Drawer URL field with a "Saving…" indicator and an inline error. */
export function EditableLink({
  label,
  value,
  error,
  saving,
  onChange,
  onBlur,
}: EditableLinkProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {saving && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" />
            Saving…
          </span>
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="https://..."
        className={`${inputCls} ${error ? "border-destructive focus-visible:border-destructive" : ""}`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
