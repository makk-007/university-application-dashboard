import { Plus, GripVertical, Trash2 } from "lucide-react";
import { motion, Reorder } from "motion/react";
import type { ChecklistItem } from "../types";
import { inputCls } from "./ui/input-classes";

interface ChecklistEditorProps {
  items: ChecklistItem[];
  completed: number;
  total: number;
  onReorder: (items: ChecklistItem[]) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  /** Inline rename state and actions (state lives in the parent). */
  rename: {
    editingId: string | null;
    text: string;
    onTextChange: (text: string) => void;
    onStart: (id: string, currentText: string) => void;
    /** Called when the rename box loses focus (Enter also triggers this). */
    onCommit: (id: string) => void;
    onCancel: () => void;
  };
  /** "Add new requirement" box state and action (state lives in the parent). */
  add: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
  };
}

/**
 * Requirements checklist for a drawer: drag to reorder, tick, click the text
 * to rename, delete, and add new items. Purely presentational; the parent
 * owns the state and the save calls.
 */
export function ChecklistEditor({
  items,
  completed,
  total,
  onReorder,
  onToggle,
  onDelete,
  rename,
  add,
}: ChecklistEditorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-3 block">
        Requirements Checklist{" "}
        <span className="ml-2 text-xs text-muted-foreground font-normal tabular-nums">
          {completed}/{total}
        </span>
      </label>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={onReorder}
        className="space-y-2"
      >
        {items.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 group-hover:text-muted-foreground touch-none">
              <GripVertical className="size-4" aria-hidden="true" />
            </div>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggle(item.id, !item.completed)}
              className="size-4 rounded border-border accent-[var(--brand-600)] cursor-pointer"
            />
            {rename.editingId === item.id ? (
              <input
                autoFocus
                value={rename.text}
                onChange={(e) => rename.onTextChange(e.target.value)}
                onBlur={() => rename.onCommit(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") {
                    rename.onCancel();
                  }
                }}
                className="flex-1 text-sm bg-transparent border-b border-primary outline-none text-foreground"
              />
            ) : (
              <motion.span
                initial={false}
                animate={{ opacity: item.completed ? 0.6 : 1 }}
                transition={{ duration: 0.15 }}
                onClick={() => rename.onStart(item.id, item.item)}
                className={`flex-1 text-sm cursor-text ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
              >
                {item.item}
              </motion.span>
            )}
            <button
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <div className="mt-3 flex gap-2">
        <input
          value={add.value}
          onChange={(e) => add.onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add.onSubmit()}
          placeholder="Add new requirement..."
          className={`flex-1 ${inputCls}`}
        />
        <button
          onClick={add.onSubmit}
          className="px-4 h-9 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>
    </div>
  );
}
