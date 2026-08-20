import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { useInventoryMovements } from "../../hooks/useInventoryMovements";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination } from "../../components/tables/Datatable";
import { InventoryMovementItem } from "../../types/types";
import { formatDateToYYYYMMDD } from "../../utils/formatDate";

type SelectOption = OptionDto & Record<string, unknown>;

const formatDateTime = (value?: string): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const formatDecimal = (value?: string | number | null): string => {
  if (value === undefined || value === null) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(6);
};

const resolveProductName = (row: InventoryMovementItem): string => {
  return row.product_variant?.name ?? row.product_name ?? "Produk tidak diketahui";
};

const resolveLocationName = (row: InventoryMovementItem): string => {
  return row.location?.name ?? row.location_name ?? "Lokasi tidak diketahui";
};

const resolveReference = (row: InventoryMovementItem): string => {
  if (row.reference_type && row.reference_id) {
    return `${row.reference_type} #${row.reference_id}`;
  }

  return "-";
};

const MOVEMENT_TYPE_OPTIONS = [
  "IN",
  "OUT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "ADJUSTMENT",
  "RETURN_IN",
  "RETURN_OUT",
  "PRODUCTION_IN",
  "PRODUCTION_OUT",
];

const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return {
    from: formatDateToYYYYMMDD(oneMonthAgo),
    to: formatDateToYYYYMMDD(today),
  };
};

export default function InventoryMovements() {
  const [page, setPage] = useState(1);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [locationId, setLocationId] = useState<number | null>(null);

  const [dateFrom, setDateFrom] = useState(() => getDefaultDateRange().from);
  const [dateTo, setDateTo] = useState(() => getDefaultDateRange().to);
  const [movementType, setMovementType] = useState("");

  const fetchLocationOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/locations",
  });

  const { data, isLoading, isFetching } = useInventoryMovements({
    page,
    product: productSearch.trim() || undefined,
    locationId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    movementType: movementType || undefined,
  });

  const handleSearch = () => {
    setProductSearch(productSearchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    const defaultRange = getDefaultDateRange();
    setProductSearchInput("");
    setProductSearch("");
    setLocationId(null);
    setDateFrom(defaultRange.from);
    setDateTo(defaultRange.to);
    setMovementType("");
    setPage(1);
  };

  const defaultDates = getDefaultDateRange();
  const hasActiveFilters = Boolean(
    productSearch ||
    locationId ||
    movementType ||
    dateFrom !== defaultDates.from ||
    dateTo !== defaultDates.to
  );

  return (
    <>
      <PageMeta title="Riwayat Pergerakan Stok" description="Halaman catatan riwayat pergerakan stok" />
      <PageBreadcrumb pageTitle="Riwayat Pergerakan Stok" />

      <div className="space-y-6">
        <ComponentCard title="Buku Besar Pergerakan Stok">
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02] mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
              <div className="sm:col-span-2 lg:col-span-3">
                <Label htmlFor="inventory-movement-product-search">Pencarian Produk</Label>
                <div className="flex gap-2">
                  <Input
                    id="inventory-movement-product-search"
                    type="text"
                    placeholder="Cari nama produk..."
                    value={productSearchInput}
                    onChange={(event) => setProductSearchInput(event.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleSearch}
                    isLoading={isFetching}
                    disabled={isFetching}
                  >
                    Cari
                  </Button>
                </div>
              </div>

              <div className="sm:col-span-1 lg:col-span-3">
                <AsyncSearchSelect<SelectOption>
                  label="Lokasi"
                  value={locationId}
                  onChange={(selectedValue) => {
                    setLocationId(selectedValue != null ? Number(selectedValue) : null);
                    setPage(1);
                  }}
                  placeholder="Cari lokasi..."
                  fetchOptions={fetchLocationOptions}
                  optionLabel="name"
                  optionValue="id"
                  debounceMs={400}
                  searchMinLength={0}
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <DatePicker
                  id="inventory-movement-date-from"
                  label="Dari Tanggal"
                  placeholder="Pilih tanggal mulai"
                  defaultDate={dateFrom}
                  onChange={([date]) => {
                    setDateFrom(date ? formatDateToYYYYMMDD(date) : "");
                    setPage(1);
                  }}
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <DatePicker
                  id="inventory-movement-date-to"
                  label="Sampai Tanggal"
                  placeholder="Pilih tanggal selesai"
                  defaultDate={dateTo}
                  onChange={([date]) => {
                    setDateTo(date ? formatDateToYYYYMMDD(date) : "");
                    setPage(1);
                  }}
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      label="Tipe Pergerakan"
                      value={movementType}
                      onChange={(val) => {
                        setMovementType(val);
                        setPage(1);
                      }}
                      options={[
                        { value: "", label: "Semua Tipe" },
                        ...MOVEMENT_TYPE_OPTIONS.map((opt) => ({
                          value: opt,
                          label: opt,
                        })),
                      ]}
                    />
                  </div>
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-11"
                      onClick={handleResetFilters}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-3">Memuat...</p>}

              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Tanggal & Waktu
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Produk
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Lokasi
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Tipe
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Jumlah (Qty)
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Harga Pokok (Cost)
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Referensi
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.data.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDateTime(movement.created_at)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {resolveProductName(movement)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {resolveLocationName(movement)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {movement.movement_type}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDecimal(movement.qty)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDecimal(movement.cost)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {resolveReference(movement)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {data?.meta && (
                <Pagination
                  currentPage={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  onPageChange={setPage}
                />
              )}
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
