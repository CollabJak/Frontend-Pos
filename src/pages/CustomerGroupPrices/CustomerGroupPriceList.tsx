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
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Button from "../../components/ui/button/Button";
import { PencilIcon } from "../../icons";
import { useModal } from "../../hooks/useModal";
import {
  useDeleteCustomerGroupPrice,
  useFetchCustomerGroupPrices,
} from "../../hooks/useCustomerGroupPrices";

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

export default function CustomerGroupPriceList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFetchCustomerGroupPrices({ page });
  const { mutate: deleteCustomerGroupPrice } = useDeleteCustomerGroupPrice();
  const { isOpen, openModal, closeModal } = useModal();
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);

  const handleDeleteClick = (id: number, name: string) => () => {
    setPendingDelete({ id, name });
    openModal();
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    deleteCustomerGroupPrice(pendingDelete.id);
    setPendingDelete(null);
    closeModal();
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
    closeModal();
  };

  return (
    <>
      <PageMeta title="Customer Group Prices" description="Customer group pricing list page" />
      <PageBreadcrumb pageTitle="Customer Group Prices" />

      <div className="space-y-6">
        <ComponentCard
          title="Customer Group Prices List"
          linkLabel="Add Customer Group Price"
          linkTo="/customer-group-prices/create"
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading && <p className="p-3">Loading...</p>}

              {!isLoading && (
                <Table className="table-auto">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Variant
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Customer Group
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Price
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Location
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Start Date
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        End Date
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Active
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data?.data?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.product_variant?.name || "-"}
                          {item.product_variant?.sku ? ` (${item.product_variant.sku})` : ""}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.customer_group?.name || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {Number(item.price).toLocaleString()}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.location?.name || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDate(item.start_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDate(item.end_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.is_active ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/customer-group-prices/edit/${item.id}`}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-500 px-3 py-2.5 text-sm text-blue-500 transition-colors hover:border-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:text-gray-300 link-focus-info"
                            >
                              <PencilIcon className="size-5" />
                              Edit
                            </Link>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={handleDeleteClick(item.id, item.product_variant?.name || `#${item.id}`)}
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
        title="Delete customer group price?"
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
