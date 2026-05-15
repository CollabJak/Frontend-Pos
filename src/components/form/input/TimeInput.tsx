import { useState, useRef, useEffect } from "react";
import { TimeIcon } from "../../../icons";

interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string | boolean;
  hint?: string;
  className?: string;
}

export const TimeInput = ({
  value,
  onChange,
  disabled = false,
  error,
  hint,
  className = "",
}: TimeInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize initial value to HH:mm
  const normalizedValue = typeof value === "string" && value ? value.substring(0, 5) : "";
  const [selectedHour, setSelectedHour] = useState(normalizedValue ? normalizedValue.split(":")[0] : "");
  const [selectedMinute, setSelectedMinute] = useState(normalizedValue ? normalizedValue.split(":")[1] : "");

  useEffect(() => {
    if (value) {
      const val = value.substring(0, 5);
      setSelectedHour(val.split(":")[0]);
      setSelectedMinute(val.split(":")[1]);
    } else {
      setSelectedHour("");
      setSelectedMinute("");
    }
  }, [value]);

  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [align, setAlign] = useState<"left" | "right">("left");

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (disabled) return;

    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();

      // Vertical placement
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 220) {
        setPlacement("top");
      } else {
        setPlacement("bottom");
      }

      // Horizontal alignment
      const spaceRight = window.innerWidth - rect.left;
      const isRightHalf = rect.left > window.innerWidth / 2;
      
      // If we are in the right half of the screen OR space on the right is limited,
      // align to the right edge of the input (extending to the left).
      if (isRightHalf || spaceRight < 240) {
        setAlign("right");
      } else {
        setAlign("left");
      }
    }
    setIsOpen(!isOpen);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    if (!selectedMinute) {
      setSelectedMinute("00");
      onChange?.(`${hour}:00`);
    } else {
      onChange?.(`${hour}:${selectedMinute}`);
    }
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    if (!selectedHour) {
      setSelectedHour("00");
      onChange?.(`00:${minute}`);
    } else {
      onChange?.(`${selectedHour}:${minute}`);
    }
  };

  let containerClasses = `relative flex items-center h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs transition-colors dark:bg-gray-900 ${className}`;

  if (disabled) {
    containerClasses += ` bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 opacity-60`;
  } else if (error) {
    containerClasses += ` border-error-500 focus-within:border-error-500 focus-within:ring-3 focus-within:ring-error-500/20 bg-white dark:border-error-500 dark:focus-within:border-error-800`;
  } else {
    containerClasses += ` border-gray-300 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20 bg-white dark:border-gray-700 dark:focus-within:border-brand-800`;
  }

  const displayValue = selectedHour && selectedMinute ? `${selectedHour}:${selectedMinute}` : "";

  return (
    <div className={`relative w-full ${isOpen ? "z-50" : ""}`} ref={dropdownRef}>
      <div
        className={`${containerClasses} ${!disabled ? "cursor-pointer" : ""}`}
        onClick={toggleDropdown}
      >
        <div className={`flex-1 ${displayValue ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-500"}`}>
          {displayValue || "--:--"}
        </div>
        <div className="text-gray-400 dark:text-gray-500">
          <TimeIcon className="size-5" />
        </div>
      </div>

      {isOpen && (
        <div className={`absolute z-50 flex min-w-full w-[220px] gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700 ${placement === "top" ? "bottom-full mb-1" : "top-full mt-1"} ${align === "right" ? "right-0" : "left-0"}`}>
          {/* Hours Column */}
          <div className="flex-1">
            <div className="mb-1 text-xs font-semibold text-center text-gray-500 dark:text-gray-400">Jam</div>
            <ul className="overflow-y-auto max-h-48 custom-scrollbar rounded-md border border-gray-100 dark:border-gray-700">
              {hours.map((hour) => (
                <li
                  key={`h-${hour}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHourSelect(hour);
                  }}
                  className={`px-3 py-1.5 text-center text-sm cursor-pointer transition-colors ${selectedHour === hour
                    ? "bg-brand-50 text-brand-600 font-medium dark:bg-brand-500/20 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                    }`}
                >
                  {hour}
                </li>
              ))}
            </ul>
          </div>

          {/* Minutes Column */}
          <div className="flex-1">
            <div className="mb-1 text-xs font-semibold text-center text-gray-500 dark:text-gray-400">Menit</div>
            <ul className="overflow-y-auto max-h-48 custom-scrollbar rounded-md border border-gray-100 dark:border-gray-700">
              {minutes.map((minute) => (
                <li
                  key={`m-${minute}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMinuteSelect(minute);
                  }}
                  className={`px-3 py-1.5 text-center text-sm cursor-pointer transition-colors ${selectedMinute === minute
                    ? "bg-brand-50 text-brand-600 font-medium dark:bg-brand-500/20 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                    }`}
                >
                  {minute}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Error or Hint Message */}
      {(error || hint) && (
        <p
          className={`mt-1.5 text-xs ${error ? "text-error-500" : "text-gray-500"
            }`}
        >
          {typeof error === "string" ? error : hint}
        </p>
      )}
    </div>
  );
};

export default TimeInput;
