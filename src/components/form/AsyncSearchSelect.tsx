import type React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAsyncOptions } from "../../hooks/useAsyncOptions";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

type OptionValue = string | number;

export interface AsyncSearchSelectProps<TOption extends Record<string, unknown>> {
  value: OptionValue | null;
  onChange: (value: OptionValue | null, option?: TOption | null) => void;
  placeholder?: string;
  label?: string;
  displayValue?: string;
  fetchOptions: (params: {
    limit: number;
    search?: string;
    signal?: AbortSignal;
  }) => Promise<TOption[]>;
  optionLabel: keyof TOption;
  optionValue: keyof TOption;
  limit?: number;
  disabled?: boolean;
  debounceMs?: number;
  searchMinLength?: number;
}

export default function AsyncSearchSelect<TOption extends Record<string, unknown>>({
  value,
  onChange,
  placeholder = "Select an option",
  label,
  displayValue,
  fetchOptions,
  optionLabel,
  optionValue,
  limit = 20,
  disabled = false,
  debounceMs = 400,
  searchMinLength = 3,
}: AsyncSearchSelectProps<TOption>) {
  const listboxId = useId();
  const inputId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedLabel, setSelectedLabel] = useState("");

  const debouncedSearch = useDebouncedValue(inputValue.trim(), debounceMs);
  const shouldFetch =
    isOpen &&
    (debouncedSearch.length === 0 || debouncedSearch.length >= searchMinLength);

  const {
    data: options = [],
    isLoading,
    isFetching,
  } = useAsyncOptions<TOption>({
    enabled: shouldFetch,
    limit,
    search: debouncedSearch.length >= searchMinLength ? debouncedSearch : undefined,
    fetchOptions,
  });

  const displayOptions = useMemo(
    () => (shouldFetch ? options : []),
    [options, shouldFetch]
  );

  useEffect(() => {
    if (!isOpen && value != null && displayValue) {
      setSelectedLabel(displayValue);
      setInputValue(displayValue);
      return;
    }

  }, [isOpen, displayValue, value]);

  useEffect(() => {
    if (!isOpen && value == null) {
      setInputValue("");
      setSelectedLabel("");
    }
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen && value != null && selectedLabel) {
      setInputValue(selectedLabel);
    }
  }, [isOpen, value, selectedLabel]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [isOpen]);

  const getOptionLabel = (option: TOption) => String(option[optionLabel]);
  const getOptionValue = (option: TOption) => option[optionValue] as OptionValue;

  const handleSelect = (option: TOption) => {
    const newValue = getOptionValue(option);
    const newLabel = getOptionLabel(option);
    setSelectedLabel(newLabel);
    setInputValue(newLabel);
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange(newValue, option);
  };

  const handleClear = () => {
    setInputValue("");
    setSelectedLabel("");
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange(null, null);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    setFocusedIndex(-1);
    if (!isOpen && value != null && selectedLabel) {
      setInputValue(selectedLabel);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setFocusedIndex((prev) =>
          prev < displayOptions.length - 1 ? prev + 1 : 0
        );
      }
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (isOpen) {
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : displayOptions.length - 1
        );
      }
    }

    if (event.key === "Enter") {
      if (isOpen && focusedIndex >= 0) {
        event.preventDefault();
        handleSelect(displayOptions[focusedIndex]);
      } else if (!isOpen) {
        setIsOpen(true);
      }
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const activeDescendantId =
    focusedIndex >= 0 && focusedIndex < displayOptions.length
      ? `${listboxId}-option-${String(
          getOptionValue(displayOptions[focusedIndex])
        )}`
      : undefined;

  return (
    <div className="w-full" ref={wrapperRef}>
      {label && (
        <label
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
          htmlFor={inputId}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`flex min-h-11 items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 shadow-theme-xs transition focus-within:border-brand-300 focus-within:shadow-focus-ring dark:border-gray-700 dark:bg-gray-900 ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-text"
          }`}
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
            }
          }}
        >
          <input
            id={inputId}
            className="w-full bg-transparent text-sm text-gray-800 outline-hidden placeholder:text-gray-400 dark:text-white/90 dark:placeholder:text-gray-500"
            placeholder={placeholder}
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (!isOpen) {
                setIsOpen(true);
              }
              setFocusedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeDescendantId}
          />

          {value != null && !disabled && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleClear();
              }}
              className="ml-2 text-gray-400 hover:text-gray-600"
              aria-label="Clear selection"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleToggle();
            }}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Toggle dropdown"
            disabled={disabled}
          >
            <svg
              className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute z-40 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            {isLoading || isFetching ? (
              <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
            ) : displayOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {debouncedSearch.length > 0 && debouncedSearch.length < searchMinLength
                  ? `Type at least ${searchMinLength} characters to search`
                  : "No results found"}
              </div>
            ) : (
              displayOptions.map((option, index) => {
                const optionLabelText = getOptionLabel(option);
                const optionValueId = String(getOptionValue(option));
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={optionValueId}
                    id={`${listboxId}-option-${optionValueId}`}
                    role="option"
                    aria-selected={value === getOptionValue(option)}
                    className={`cursor-pointer px-3 py-2 text-sm text-gray-800 hover:bg-brand-50 dark:text-white/90 dark:hover:bg-white/[0.05] ${
                      isFocused ? "bg-brand-50 dark:bg-white/[0.05]" : ""
                    }`}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onClick={() => handleSelect(option)}
                  >
                    {optionLabelText}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
