interface PageButtonProps {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function PageButton({
  children,
  active = false,
  disabled = false,
  onClick,
}: PageButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        h-9 min-w-[36px] px-3 rounded-md text-sm
        transition-all duration-150
        ${
          active
            ? "bg-brand-500 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }
        ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : ""
        }
        border
      `}
    >
      {children}
    </button>
  );
}
