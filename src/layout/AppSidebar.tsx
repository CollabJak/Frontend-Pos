import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PlugInIcon,
  BoxIcon,
  DollarLineIcon,
  TaskIcon,
  CalendarIcon,
  PageIcon,
  PieChartIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/useAuth";
import { hasAccess } from "../utils/rbac";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  permissions?: string[];
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; roles?: string[]; permissions?: string[] }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
    permissions: ["dashboard.view"],
  },
  {
    icon: <BoxIcon />,
    name: "Produk",
    permissions: ["product.view", "product_variant.view", "product_price.view"],
    subItems: [
      { name: "Manajemen Produk", path: "/products", pro: false, permissions: ["product.view", "product_variant.view", "product_price.view", "price_tier.view", "category.view", "supplier.view", "brand.view", "atribute.view"] },
      { name: "Manajemen Satuan", path: "/units", pro: false, permissions: ["unit.view", "unit_conversion.view"] },
      { name: "Grup Pelanggan", path: "/customer-groups", pro: false, permissions: ["customer_group.view", "customer_group_price.view"] },
      { name: "Promosi", path: "/promotions", pro: false, permissions: ["promotion.view", "promotion_condition.view", "promotion_action.view", "promotion_product.view"] },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Lokasi",
    path: "/locations",
    permissions: ["location.view"],
  },

  {
    icon: <ListIcon />,
    name: "Inventory",
    permissions: ["inventory.view"],
    subItems: [
      { name: "Daftar Inventaris", path: "/inventory", pro: false, permissions: ["inventory.view"] },
      // { name: "Stok Tanpa Varian", path: "/inventory/orphaned", pro: false, permissions: ["inventory.view"] },
      { name: "Pergerakan Stok", path: "/inventory/movements", pro: false, permissions: ["inventory.movements"] },
      { name: "Penyesuaian Stok", path: "/inventory/adjustment", pro: false, permissions: ["inventory.adjustment"] },
    ],
  },
  {
    icon: <DollarLineIcon />,
    name: "Kasir",
    permissions: ["pos.view", "transaction.view"],
    subItems: [
      { name: "POS", path: "/pos", pro: false, permissions: ["pos.view"] },
      { name: "Riwayat Transaksi", path: "/transactions", pro: false, permissions: ["transaction.view"] },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Laporan",
    permissions: ["report.sales_by_location.view", "report.attendance.view"],
    subItems: [
      {
        name: "Penjualan per Lokasi",
        path: "/reports/sales-by-location",
        pro: false,
        permissions: ["report.sales_by_location.view"],
      },
      {
        name: "Absensi Karyawan",
        path: "/reports/attendance",
        pro: false,
        permissions: ["report.attendance.view"],
      },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Absensi",
    permissions: ["absensi.view", "absensi.checkin", "absensi.checkout", "absensi.enroll"],
    subItems: [
      { name: "Pendaftaran Wajah", path: "/absensi/register", pro: false, permissions: ["absensi.enroll"] },
      { name: "Scanner Kehadiran", path: "/absensi/scanner", pro: false, permissions: ["absensi.checkin", "absensi.checkout"] },
      { name: "Riwayat Kehadiran", path: "/absensi/history", pro: false, permissions: ["absensi.view"] },
    ],
  },
  {
    icon: <CalendarIcon />,
    name: "Jadwal Kerja",
    permissions: ["jadwal.view", "jadwal.create", "shift.view", "holiday.view", "rotation.view"],
    subItems: [
      { name: "Kalender Kerja", path: "/scheduling", pro: false, permissions: ["jadwal.view"] },
      { name: "Pengaturan Jadwal", path: "/scheduling/settings", pro: false, permissions: ["shift.view", "rotation.view", "holiday.view"] },
    ],
  },
  {
    icon: <DollarLineIcon />,
    name: "Metode Pembayaran",
    path: "/payment-methods",
    permissions: ["payment_method.view"],
  },
  {
    icon: <BoxIcon />,
    name: "Bisnis",
    path: "/businesses",
    permissions: ["business.view"],
  },
  {
    name: "Langganan",
    icon: <DollarLineIcon />,
    permissions: ["view_subscription_plans"],
    subItems: [
      { name: "Master Paket", path: "/subscriptions-plans", pro: false, permissions: ["subscription_plan.view"] },
      { name: "Paket Langganan", path: "/pricing", pro: false, permissions: ["view_subscription_plans"] },
      { name: "Riwayat Tagihan", path: "/billing", pro: false, permissions: ["business.view"] },
      { name: "Verifikasi Pembayaran", path: "/subscriptions/verification", pro: false, roles: ["admin"] },
    ],
  },
  {
    name: "Pengaturan",
    icon: <PlugInIcon />,
    permissions: ["settings.view"],
    subItems: [
      { name: "Pengguna", path: "/users", pro: false, permissions: ["user.view"] },
      { name: "Role / Peran", path: "/roles", pro: false, permissions: ["role.view"] },
      { name: "Izin Akses", path: "/permissions", pro: false, permissions: ["permission.view"] },
      { name: "Pengaturan Pajak", path: "/taxes", pro: false, permissions: ["tax.view", "view_taxes"] },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const userRoles = user?.roles || [];
  const userPermissions = user?.permissions || [];

  const filteredNavItems = useMemo(() => navItems
    .filter((item) => hasAccess(userRoles, userPermissions, item.roles, item.permissions))
    .map((item) => ({
      ...item,
      subItems: item.subItems?.filter((sub) => hasAccess(userRoles, userPermissions, sub.roles, sub.permissions)),
    })), [userRoles, userPermissions]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    filteredNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, filteredNavItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === "main" &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: "main", index };
    });
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems && nav.subItems.length > 0 ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${openSubmenu?.type === "main" && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === "main" && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === "main" &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && nav.subItems.length > 0 && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === "main" && openSubmenu?.index === index
                    ? `${subMenuHeight[`main-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/main-logo.jpg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.jpg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
