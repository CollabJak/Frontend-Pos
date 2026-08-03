import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination } from "../../components/tables/Datatable";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useInventoryOrphanedStocks } from "../../hooks/useInventoryOrphanedStocks";
import { InventoryListItem } from "../../types/types";

type SelectOption = OptionDto & Record<string, unknown>;

const toNumber = (value: string | number | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDecimal = (value: string | number): string => {
  if (typeof value === "string") {
    return value;
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(6);
};

const resolveVariantId = (row: InventoryListItem): number | null => {
  if (row.product_variant_id && row.product_variant_id > 0) {
    return row.product_variant_id;
  }

  if (row.product_variant?.id && row.product_variant.id > 0) {
    return row.product_variant.id;
  }

  return null;
};

const resolveProductName = (row: InventoryListItem): string => {
  return row.product_variant?.name ?? row.product_name ?? "Produk tidak diketahui";
};

const resolveLocationName = (row: InventoryListItem): string => {
  return row.location?.name ?? row.location_name ?? "Lokasi tidak diketahui";
};

const resolveAvailable = (row: InventoryListItem): string => {
  if (row.available !== undefined) {
    return formatDecimal(row.available);
  }

  const qtyOnHand = toNumber(row.qty_on_hand);
  const qtyReserved = toNumber(row.qty_reserved);
  return `${qtyOnHand - qtyReserved}`;
};

export default function InventoryOrphanedList() {
  const [page, setPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [locationId, setLocationId] = useState<number | null>(null);

  const debouncedSearch = useDebouncedValue(productSearch.trim(), 400);

  const { data, isLoading } = useInventoryOrphanedStocks({
    page,
    search: debouncedSearch || undefined,
    locationId,
  });

  const fetchLocationOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/locations",
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, locationId]);

  const handleResetFilters = () => {
    setProductSearch("");
    setLocationId(null);
    setPage(1);
  };

  return (
    <>
      <PageMeta title="Stok Tanpa Pemetaan Lokasi" description="Halaman laporan stok tanpa pemetaan lokasi" />
      <PageBreadcrumb pageTitle="Stok Tanpa Pemetaan" />

      <div className="space-y-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <h4 className="mb-1 font-semibold text-amber-900 dark:text-amber-300">Tentang Stok Tanpa Pemetaan Lokasi</h4>
          <p className="text-sm">
            Stok tanpa pemetaan adalah stok fisik aktif yang tersimpan di gudang atau toko namun belum/tidak lagi memiliki pemetaan lokasi yang valid pada varian produk. 
            Hal ini terjadi jika pemetaan lokasi khusus atau tipe lokasi pada varian produk belum diatur atau dinonaktifkan.
            Silakan atur konfigurasi lokasi pada varian produk agar operasional stok dapat berjalan lancar.
          </p>
        </div>

        <ComponentCard title="Laporan Stok Tanpa Pemetaan">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <div>
              <Label htmlFor="inventory-product-search">Cari Produk</Label>
              <Input
                id="inventory-product-search"
                type="text"
                placeholder="Cari berdasarkan nama produk..."
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
            </div>

            <div>
              <Label>Filter Lokasi</Label>
              <AsyncSearchSelect<SelectOption>
                label=""
                value={locationId}
                onChange={(selectedValue) => {
                  setLocationId(selectedValue != null ? Number(selectedValue) : null);
                }}
                placeholder="Cari lokasi..."
                fetchOptions={fetchLocationOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={0}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filter
              </Button>
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
                        Produk
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        SKU
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
                        Stok Fisik
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Stok Direservasi
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Stok Tersedia
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Aksi
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {(!data || data.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                          Tidak ditemukan stok tanpa pemetaan. Semua lokasi stok produk Anda telah terkonfigurasi dengan baik!
                        </TableCell>
                      </TableRow>
                    )}
                    {data?.data.map((row) => {
                      const variantId = resolveVariantId(row);
                      return (
                        <TableRow key={`${variantId ?? "na"}-${row.location_id ?? "na"}`}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {resolveProductName(row)}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {row.product_variant?.sku ?? "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {resolveLocationName(row)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {formatDecimal(row.qty_on_hand)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {formatDecimal(row.qty_reserved)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {resolveAvailable(row)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Lokasi Belum Dipetakan
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {variantId ? (
                              <div className="flex gap-2">
                                <Link
                                  to={`/inventory/${variantId}`}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-500 px-3 py-1.5 text-xs text-blue-500 transition-colors hover:border-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:text-gray-300 link-focus-info"
                                >
                                  Lihat Detail Stok
                                </Link>
                                <Link
                                  to={`/product-variants/edit/${variantId}`}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-500 px-3 py-1.5 text-xs text-emerald-500 transition-colors hover:border-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:border-emerald-400 dark:hover:text-gray-300 link-focus-info"
                                >
                                  Konfigurasi Lokasi
                                </Link>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {data?.meta && data.meta.last_page > 1 && (
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
