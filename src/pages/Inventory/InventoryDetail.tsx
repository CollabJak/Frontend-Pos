import { useState } from "react";
import { useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Pagination } from "../../components/tables/Datatable";
import { useInventoryBatches } from "../../hooks/useInventoryBatches";
import { useInventoryDetail } from "../../hooks/useInventoryDetail";
import { InventoryBatch, InventoryLocationBalance } from "../../types/types";

const toNumber = (value: string | number | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDecimal = (value: string | number | undefined): string => {
  if (value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(6);
};

const resolveAvailable = (balance: InventoryLocationBalance): string => {
  if (balance.available !== undefined) {
    return formatDecimal(balance.available);
  }

  const qtyOnHand = toNumber(balance.qty_on_hand);
  const qtyReserved = toNumber(balance.qty_reserved);

  return `${qtyOnHand - qtyReserved}`;
};

const resolveLocationName = (balance: InventoryLocationBalance): string => {
  return balance.location?.name ?? balance.location_name ?? "Lokasi tidak diketahui";
};

const resolveBatchNumber = (batch: InventoryBatch): string => {
  return batch.batch_number ?? batch.batch_code ?? "-";
};

export default function InventoryDetail() {
  const params = useParams();
  const variantId = Number(params.variantId);

  const [showBatches, setShowBatches] = useState(false);
  const [batchPage, setBatchPage] = useState(1);

  const { data, isLoading } = useInventoryDetail(variantId);
  const { data: batchData, isLoading: isBatchLoading } = useInventoryBatches({
    variantId,
    page: batchPage,
    enabled: showBatches,
  });

  if (!variantId) {
    return (
      <>
        <PageMeta title="Detail Inventaris" description="Halaman detail stok inventaris" />
        <PageBreadcrumb pageTitle="Detail Inventaris" />
        <p className="text-red-500">ID varian produk tidak valid.</p>
      </>
    );
  }

  const balances = data?.balances ?? [];
  const productName = data?.product_variant?.name ?? data?.product_name ?? `Varian #${variantId}`;
  const productSku = data?.product_variant?.sku ?? data?.sku ?? "-";

  const handleToggleBatches = () => {
    setShowBatches((prev) => !prev);
    setBatchPage(1);
  };

  return (
    <>
      <PageMeta title="Detail Inventaris" description="Halaman detail stok inventaris" />
      <PageBreadcrumb pageTitle="Detail Inventaris" />

      <div className="space-y-6">
        <ComponentCard title="Informasi Produk">
          {isLoading ? (
            <p>Memuat...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Produk</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{productName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">SKU</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{productSku}</p>
              </div>
            </div>
          )}
        </ComponentCard>

        <ComponentCard title="Stok Per Lokasi">
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
                        Lokasi
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Stok Fisik (Qty On Hand)
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
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {balances.map((balance, index) => (
                      <TableRow key={`${balance.location_id ?? "loc"}-${index}`}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {resolveLocationName(balance)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDecimal(balance.qty_on_hand)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDecimal(balance.qty_reserved)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {resolveAvailable(balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={handleToggleBatches}>
              {showBatches ? "Sembunyikan Batch" : "Lihat Batch"}
            </Button>
          </div>
        </ComponentCard>

        {showBatches && (
          <ComponentCard title="Detail Batch (Batch Viewer)">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                {isBatchLoading && <p className="p-3">Memuat...</p>}

                {!isBatchLoading && (
                  <Table className="table-auto">
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Nomor Batch
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Sisa Stok
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
                          Harga Pokok (Cost)
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Tanggal Kadaluarsa
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {batchData?.data.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {resolveBatchNumber(batch)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {formatDecimal(batch.remaining_qty)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {formatDecimal(batch.reserved_qty)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {formatDecimal(batch.cost)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {batch.expiry_date ?? "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {batchData?.meta && (
                  <Pagination
                    currentPage={batchData.meta.current_page}
                    lastPage={batchData.meta.last_page}
                    onPageChange={setBatchPage}
                  />
                )}
              </div>
            </div>
          </ComponentCard>
        )}
      </div>
    </>
  );
}
