import { useEffect, useMemo, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type DateTimePickerProps = {
  id: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  enableTime?: boolean;
  allowClear?: boolean;
};

export default function DateTimePicker({
  id,
  label,
  placeholder,
  value = "",
  onChange,
  enableTime = true,
  allowClear = false,
}: DateTimePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<flatpickr.Instance | null>(null);

  const dateFormat = useMemo(
    () => (enableTime ? "Y-m-d H:i" : "Y-m-d"),
    [enableTime]
  );

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    const instance = flatpickr(inputRef.current, {
      static: false,
      position: "auto left",
      monthSelectorType: "static",
      dateFormat,
      enableTime,
      time_24hr: true,
      allowInput: true,
      defaultDate: value || undefined,
      onChange: (_, dateString) => {
        onChange?.(dateString);
      },
    });

    pickerRef.current = instance;

    return () => {
      instance.destroy();
      pickerRef.current = null;
    };
  }, [dateFormat, enableTime, onChange]);

  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) {
      return;
    }

    const currentValue = picker.input.value;
    const nextValue = value ?? "";

    if (currentValue === nextValue) {
      return;
    }

    if (nextValue.trim() === "") {
      picker.clear(false);
      return;
    }

    picker.setDate(nextValue, false, dateFormat);
  }, [dateFormat, value]);

  const handleClear = () => {
    const picker = pickerRef.current;
    if (!picker) {
      return;
    }

    picker.clear();
    onChange?.("");
  };

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pr-20 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />

        {allowClear && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear
          </button>
        )}

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
