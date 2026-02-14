import { useState } from "react";
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
import {
  useDeleteProductPrice,
  useFetchProductPrices,
} from "../../hooks/useProductPrices";
import Button from "../../components/ui/button/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useModal } from "../../hooks/useModal";
import { PencilIcon } from "../../icons";
import { ProductPriceType } from "../../types/types";

const PRICE_TYPE_LABELS: Record<ProductPriceType, string> = {
  sell: "Sell",
  purchase: "Purchase",
  wholesale: "Wholesale",
  cost: "Cost",
  member: "Member",
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const pad = (num: number) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default function ProductPriceList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFetchProductPrices({ page });
  const { mutate: deleteProductPrice } = useDeleteProductPrice();
  const { isOpen, openModal, closeModal } = useModal();
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleDeleteClick = (id: number, name: string) => () => {
    setPendingDelete({ id, name });
    openModal();
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    deleteProductPrice(pendingDelete.id);
    setPendingDelete(null);
    closeModal();
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
    closeModal();
  };

  return (
    <>
      <PageMeta title="Product Prices" description="Product pricing list page" />
      <PageBreadcrumb pageTitle="Product Prices" />

      <div className="space-y-6">
        <ComponentCard
          title="Product Prices List"
          linkLabel="Add Product Price"
          linkTo="/product-prices/create"
        >
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
                        Variant
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Price Type
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Price
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
                        Start Date
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        End Date
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.data?.map((productPrice) => (
                      <TableRow key={productPrice.id}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {productPrice.product_variant?.name || "-"}
                          {productPrice.product_variant?.sku
                            ? ` (${productPrice.product_variant.sku})`
                            : ""}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {PRICE_TYPE_LABELS[productPrice.price_type]}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {Number(productPrice.price).toLocaleString()}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {productPrice.location?.name || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDate(productPrice.start_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDate(productPrice.end_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/product-prices/edit/${productPrice.id}`}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-500 px-3 py-2.5 text-sm text-blue-500 transition-colors hover:border-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:text-gray-300 link-focus-info"
                            >
                              <PencilIcon className="size-5" />
                              Edit
                            </Link>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={handleDeleteClick(
                                productPrice.id,
                                productPrice.product_variant?.name || `#${productPrice.id}`
                              )}
                            >
                              Delete
                            </Button>
                          </div>
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

      <ConfirmDialog
        isOpen={isOpen}
        title="Delete product price?"
        description={
          pendingDelete
            ? `This action cannot be undone. "${pendingDelete.name}" pricing will be removed.`
            : "This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
