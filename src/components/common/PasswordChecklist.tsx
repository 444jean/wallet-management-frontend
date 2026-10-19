import { Check, Circle } from "lucide-react";
import type { PasswordRule } from "@/lib/password-policy";
import { cn } from "@/lib/utils";

/** Live password requirements: each rule gets a check and is struck through once met. */
export function PasswordChecklist({ rules, className }: { rules: PasswordRule[]; className?: string }) {
  return (
    <ul className={cn("space-y-1", className)} aria-label="Requisitos de la contraseña">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-colors",
            rule.met ? "text-income" : "text-muted-foreground",
          )}
        >
          {rule.met ? (
            <Check className="size-3.5 shrink-0" />
          ) : (
            <Circle className="size-3.5 shrink-0 opacity-40" />
          )}
          <span className={cn(rule.met && "line-through decoration-1")}>{rule.label}</span>
          <span className="sr-only">{rule.met ? "(cumplido)" : "(pendiente)"}</span>
        </li>
      ))}
    </ul>
  );
}
