import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { es } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { dateToISO, isoToDate } from "@/lib/dates";
import { cn, formatDate } from "@/lib/utils";

interface Props {
  id?: string;
  /** "YYYY-MM-DD", or "" when empty. */
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
}

/**
 * Native date picker on phones (the OS picker is the most comfortable there)
 * and a shadcn Calendar in a popover on larger screens.
 */
export function DatePicker({ id, value, onChange, placeholder = "Elige una fecha" }: Props) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block"
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}
        >
          <CalendarIcon />
          {value ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          selected={value ? isoToDate(value) : undefined}
          defaultMonth={value ? isoToDate(value) : undefined}
          onSelect={(date) => {
            if (!date) return;
            onChange(dateToISO(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
