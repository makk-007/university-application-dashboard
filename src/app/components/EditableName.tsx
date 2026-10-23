import { Pencil } from "lucide-react";

interface EditableNameProps {
  /** Saved name, shown as the heading. */
  name: string;
  ariaLabel: string;
  editing: boolean;
  /** Text currently in the edit box. */
  draft: string;
  error: string | null;
  onStartEdit: () => void;
  onDraftChange: (value: string) => void;
  /** Called when the edit box loses focus (Enter also triggers this). */
  onCommit: () => void;
  /** Called on Escape; the parent resets the draft, error and editing flag. */
  onCancel: () => void;
}

/** Drawer heading that turns into an inline text box when clicked. */
export function EditableName({
  name,
  ariaLabel,
  editing,
  draft,
  error,
  onStartEdit,
  onDraftChange,
  onCommit,
  onCancel,
}: EditableNameProps) {
  if (editing) {
    return (
      <div>
        <input
          autoFocus
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") onCancel();
          }}
          className="text-xl font-semibold text-card-foreground bg-transparent border-b-2 border-primary outline-none w-full"
        />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={onStartEdit}
      className="group flex items-center gap-2 min-w-0 text-left"
      aria-label={ariaLabel}
    >
      <h2 className="text-xl font-semibold text-card-foreground truncate">
        {name}
      </h2>
      <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}
