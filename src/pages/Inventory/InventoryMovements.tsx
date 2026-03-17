import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { createOptionsFetcher, OptionDto } from "../../api/options";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
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
  return row.product_variant?.name ?? row.product_name ?? "Unknown product";
};

const resolveLocationName = (row: InventoryMovementItem): string => {
  return row.location?.name ?? row.location_name ?? "Unknown location";
};

const resolveReference = (row: InventoryMovementItem): string => {
  if (row.reference_type && row.reference_id) {
    return `${row.reference_type} #${row.reference_id}`;
  }

  return "-";
};

const MOVEMENT_TYPE_OPTIONS = [
  "",
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

export default function InventoryMovements() {
  const [page, setPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [locationId, setLocationId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [movementType, setMovementType] = useState("");

  const debouncedProduct = useDebouncedValue(productSearch.trim(), 400);
  const fetchLocationOptions = createOptionsFetcher<SelectOption>({
    endpoint: "/options/locations",
  });

  const { data, isLoading } = useInventoryMovements({
    page,
    product: debouncedProduct || undefined,
    locationId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    movementType: movementType || undefined,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedProduct, locationId, dateFrom, dateTo, movementType]);

  const handleResetFilters = () => {
    setProductSearch("");
    setLocationId(null);
    setDateFrom("");
    setDateTo("");
    setMovementType("");
    setPage(1);
  };

  return (
    <>
      <PageMeta title="Inventory Movements" description="Inventory movement ledger page" />
      <PageBreadcrumb pageTitle="Inventory Movements" />

      <div className="space-y-6">
        <ComponentCard title="Inventory Movement Ledger">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <Label htmlFor="inventory-movement-product-search">Product</Label>
              <Input
                id="inventory-movement-product-search"
                type="text"
                placeholder="Search by product..."
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
            </div>

            <div>
              <Label>Location</Label>
              <AsyncSearchSelect<SelectOption>
                label=""
                value={locationId}
                onChange={(selectedValue) => {
                  setLocationId(selectedValue != null ? Number(selectedValue) : null);
                }}
                placeholder="Search location..."
                fetchOptions={fetchLocationOptions}
                optionLabel="name"
                optionValue="id"
                debounceMs={400}
                searchMinLength={0}
              />
            </div>

            <div>
              <Label htmlFor="inventory-movement-date-from">Date From</Label>
              <Input
                id="inventory-movement-date-from"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="inventory-movement-date-to">Date To</Label>
              <Input
                id="inventory-movement-date-to"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="inventory-movement-type">Movement Type</Label>
              <select
                id="inventory-movement-type"
                value={movementType}
                onChange={(event) => setMovementType(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {MOVEMENT_TYPE_OPTIONS.map((option) => (
                  <option
                    key={option || "all"}
                    value={option}
                    className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                  >
                    {option === "" ? "All Types" : option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-3">Loading...</p>}

              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Date
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Product
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Location
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Type
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Qty
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Cost
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Reference
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
