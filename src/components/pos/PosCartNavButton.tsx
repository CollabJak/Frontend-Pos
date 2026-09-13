import { useLocation } from "react-router";
import { usePosStore } from "../../stores/pos.store";

export default function PosCartNavButton() {
  const { pathname } = useLocation();
  const cartItems = usePosStore((s) => s.cartItems);
  const isCartDrawerOpen = usePosStore((s) => s.isCartDrawerOpen);
  const setCartDrawerOpen = usePosStore((s) => s.setCartDrawerOpen);

  if (pathname !== "/pos") return null;

  const count = cartItems.reduce((n, item) => n + item.qty, 0);

  return (
    <button
      onClick={() => setCartDrawerOpen(!isCartDrawerOpen)}
      aria-label="Keranjang belanja"
      className={`relative flex xl:hidden items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isCartDrawerOpen
          ? "text-brand-600 dark:text-brand-400"
          : "text-gray-700 dark:text-gray-400"
      }`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6.00488 9H19.9433L20.4433 7H8.00488V5H21.7241C22.2764 5 22.7241 5.44772 22.7241 6C22.7241 6.08176 22.7141 6.16322 22.6942 6.24254L20.1942 16.2425C20.083 16.6877 19.683 17 19.2241 17H5.00488C4.4526 17 4.00488 16.5523 4.00488 16V4H2.00488V2H5.00488C5.55717 2 6.00488 2.44772 6.00488 3V9ZM6.00488 23C4.90031 23 4.00488 22.1046 4.00488 21C4.00488 19.8954 4.90031 19 6.00488 19C7.10945 19 8.00488 19.8954 8.00488 21C8.00488 22.1046 7.10945 23 6.00488 23ZM18.0049 23C16.9003 23 16.0049 22.1046 16.0049 21C16.0049 19.8954 16.9003 19 18.0049 19C19.1095 19 20.0049 19.8954 20.0049 21C20.0049 22.1046 19.1095 23 18.0049 23Z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
