import React from "react";

interface KeypadProps {
  onKeyPress: (key: string) => void;
  className?: string;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress, className }) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "00"];

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onKeyPress(key)}
          className="flex h-20 items-center justify-center rounded-xl bg-white text-2xl font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 active:shadow-inner dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          {key}
        </button>
      ))}
    </div>
  );
};

export default Keypad;
