import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect/index";
import "flatpickr/dist/plugins/monthSelect/style.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  viewMode?: "date" | "month";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
};

export default function DatePicker({
  id,
  mode,
  viewMode = "date",
  onChange,
  label,
  defaultDate,
  placeholder,
  error,
  required = false,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    const plugins = [];
    if (viewMode === "month") {
      plugins.push(
        monthSelectPlugin({
          shorthand: true,
          dateFormat: "Y-m",
          altFormat: "F Y",
        })
      );
    }

    const instance = flatpickr(inputRef.current, {
      mode: mode || "single",
      static: false,
      position: "auto left",
      monthSelectorType: "static",
      dateFormat: viewMode === "month" ? "Y-m" : "Y-m-d",
      altInput: viewMode === "month",
      altFormat: "F Y",
      altInputClass: `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 ${
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/50"
          : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
      }`,
      defaultDate: defaultDate || undefined,
      onChange: (selectedDates, dateStr, instance) => {
        if (typeof onChangeRef.current === "function") {
          onChangeRef.current(selectedDates, dateStr, instance);
        } else if (Array.isArray(onChangeRef.current)) {
          onChangeRef.current.forEach((fn) => fn(selectedDates, dateStr, instance));
        }
      },
      onReady: (_, __, fp) => {
        if (fp.altInput) {
          fp.input.style.display = "none";
        }
      },
      plugins,
    });

    pickerRef.current = Array.isArray(instance) ? instance[0] : instance;

    return () => {
      if (pickerRef.current) {
        pickerRef.current.destroy();
        pickerRef.current = null;
      }
    };
  }, [id, mode, viewMode, error]);

  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) {
      return;
    }

    if (!defaultDate || (typeof defaultDate === "string" && defaultDate.trim() === "")) {
      picker.clear(false);
      return;
    }

    const dateFormat = viewMode === "month" ? "Y-m" : "Y-m-d";
    picker.setDate(defaultDate, false, dateFormat);
  }, [defaultDate, viewMode]);

  return (
    <div>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/50"
              : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
          }`}
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
