import * as React from "react";
import { Calendar } from "./calendar";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { CalendarDays } from "lucide-react";

export interface ShadcnDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export function ShadcnDatePicker({ value, onChange, placeholder = "เลือกวัน" }: ShadcnDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const display = value ? value.toLocaleDateString("en-CA") : placeholder;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center border-2 border-gray-300 px-4 py-2 rounded-lg w-full text-left text-black bg-white-200 hover:bg-gray-200 focus:bg-gray-100 focus:outline-none shadow-sm transition-colors"
          onClick={() => setOpen(true)}
        >
          <span className="flex-1 text-[#7B61FF]">{display}</span>
          <CalendarDays className="w-5 h-5 ml-2 text-[#7B61FF]" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" sideOffset={4} align="start">
        <div className="min-h-[320px] flex items-center justify-center">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => {
              onChange(date ?? null);
            }}
            fixedWeeks
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
