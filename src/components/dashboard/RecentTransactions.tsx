import React, { useState } from "react";
import Badge from "../ui/badge/Badge";
import { ChevronDownIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const RecentTransactions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("ALL LOCATIONS");

  const transactions = [
    { id: "#TXN-96241", datetime: "Oct 24, 14:22", location: "Store A - Downtown", items: "3 itms", amount: "IDR 450,000", status: "completed" },
    { id: "#TXN-96240", datetime: "Oct 24, 14:15", location: "Store B - Airport", items: "1 item", amount: "IDR 125,000", status: "completed" },
    { id: "#TXN-96239", datetime: "Oct 24, 13:58", location: "Store A - Downtown", items: "5 itms", amount: "IDR 890,000", status: "pending" },
    { id: "#TXN-96238", datetime: "Oct 24, 13:42", location: "Store A - Downtown", items: "2 itms", amount: "IDR 310,000", status: "completed" },
    { id: "#TXN-96237", datetime: "Oct 24, 13:30", location: "Warehouse B", items: "12 itms (B2B)", amount: "IDR 4,200,000", status: "completed" },
    { id: "#TXN-96236", datetime: "Oct 24, 13:12", location: "Store B - Airport", items: "4 itms", amount: "IDR 560,000", status: "completed" },
  ];

  const locations = ["ALL LOCATIONS", "Store A - Downtown", "Store B - Airport", "Warehouse B"];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Transactions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitoring the latest activity across all channels
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="dropdown-toggle flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-white/90 hover:text-brand-500 transition-colors"
          >
            <span className="text-xs font-medium text-gray-400 uppercase">Filter by</span>
            {selectedLocation}
            <ChevronDownIcon className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          <Dropdown
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            className="w-48 p-2 mt-2"
          >
            {locations.map((loc) => (
              <DropdownItem
                key={loc}
                onItemClick={() => {
                  setSelectedLocation(loc);
                  setIsOpen(false);
                }}
                className={`flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 ${selectedLocation === loc ? "bg-gray-50 text-brand-500 dark:bg-white/5" : ""
                  }`}
              >
                {loc}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Date/Time</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase pl-4">Transaction ID</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase pl-4">Location</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase pl-4">Items</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase pl-4">Total Amount</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {transactions.map((txn, index) => (
              <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-4 text-xs font-medium text-gray-600 dark:text-gray-400">{txn.datetime}</td>
                <td className="py-4 text-xs font-bold text-brand-600 dark:text-brand-400 pl-4">{txn.id}</td>
                <td className="py-4 text-xs font-medium text-gray-600 dark:text-gray-400 pl-4">{txn.location}</td>
                <td className="py-4 text-xs font-medium text-gray-600 dark:text-gray-400 pl-4">{txn.items}</td>
                <td className="py-4 text-xs font-bold text-gray-800 dark:text-white/90 pl-4">{txn.amount}</td>
                <td className="py-4 text-right">
                  <Badge color={txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'warning' : 'error'} variant="solid" size="sm">
                    {txn.status.toUpperCase()}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <button className="text-xs font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider dark:text-brand-400">
          View All Transactions
        </button>
      </div>
    </div>
  );
};

export default RecentTransactions;
