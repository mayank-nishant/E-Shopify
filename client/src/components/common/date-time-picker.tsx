import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DateTimePicker({
  value,
  onChange,
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined,
  );

  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");

  useEffect(() => {
    if (!value) return;

    const current = new Date(value);

    setDate(current);
    setHour(String(current.getHours()).padStart(2, "0"));
    setMinute(String(current.getMinutes()).padStart(2, "0"));
  }, [value]);

  function updateDateTime(
    nextDate: Date | undefined,
    nextHour = hour,
    nextMinute = minute,
  ) {
    if (!nextDate) {
      onChange("");
      return;
    }

    const updated = new Date(nextDate);

    updated.setHours(Number(nextHour));
    updated.setMinutes(Number(nextMinute));
    updated.setSeconds(0);
    updated.setMilliseconds(0);

    setDate(updated);
    onChange(updated.toISOString());
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between rounded-none font-normal"
        >
          {date
            ? format(date, "PPP p")
            : "Select date & time"}

          <CalendarIcon className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-3"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) =>
            updateDateTime(selected)
          }
        />

        <div className="mt-4 flex gap-2">
          <Select
            value={hour}
            onValueChange={(value) => {
              setHour(value);
              updateDateTime(date, value, minute);
            }}
          >
            <SelectTrigger className="w-25">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>

            <SelectContent>
              {Array.from(
                { length: 24 },
                (_, index) => (
                  <SelectItem
                    key={index}
                    value={String(index).padStart(
                      2,
                      "0",
                    )}
                  >
                    {String(index).padStart(2, "0")}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select
            value={minute}
            onValueChange={(value) => {
              setMinute(value);
              updateDateTime(date, hour, value);
            }}
          >
            <SelectTrigger className="w-25">
              <SelectValue placeholder="Minute" />
            </SelectTrigger>

            <SelectContent>
              {Array.from(
                { length: 60 },
                (_, index) => (
                  <SelectItem
                    key={index}
                    value={String(index).padStart(
                      2,
                      "0",
                    )}
                  >
                    {String(index).padStart(2, "0")}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}