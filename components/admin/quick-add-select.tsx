"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { Select, Input } from "@/components/ui/form-fields";
import { cn } from "@/utils/cn";

interface Option {
  id: string;
  label: string;
}

interface QuickAddSelectProps {
  id: string;
  value: string;
  options: Option[];
  placeholder: string;
  onChange: (id: string) => void;
  onQuickAdd: (label: string) => Promise<void>;
  addLabel: string;
  className?: string;
}

export function QuickAddSelect({
  id,
  value,
  options,
  placeholder,
  onChange,
  onQuickAdd,
  addLabel,
  className,
}: QuickAddSelectProps) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setIsSaving(true);
    try {
      await onQuickAdd(newLabel.trim());
      setNewLabel("");
      setAdding(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (adding) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Input
          autoFocus
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder={addLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
            if (e.key === "Escape") setAdding(false);
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isSaving}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sage-500/12 text-sage-600 disabled:opacity-50"
          aria-label="Confirm"
        >
          <Check className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink-950/5 text-text-950/60 dark:bg-white/5 dark:text-ink-100/60"
          aria-label="Cancel"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </Select>
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-600 transition-colors hover:bg-gold-400/25 dark:text-gold-300"
        aria-label={addLabel}
        title={addLabel}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
