import { forwardRef, useMemo } from "react";
import type { ReceiptPayload } from "../../types/types";
import { formatLine } from "../../utils/receiptFormatter";

interface ReceiptPrintProps {
  receipt: ReceiptPayload;
  width?: 32 | 48;
  className?: string;
}

const toMoney = (value: number): string => {
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

  return `Rp. ${formatted}`;
};

const centerLine = (text: string, width: number): string => {
  const clean = text.trim();
  if (clean.length >= width) {
    return clean.slice(0, width);
  }

  const leftPad = Math.max(0, Math.floor((width - clean.length) / 2));
  const rightPad = Math.max(0, width - clean.length - leftPad);
  return `${" ".repeat(leftPad)}${clean}${" ".repeat(rightPad)}`;
};

const wrapText = (text: string, width: number): string[] => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [""];
  }

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > width) {
      if (current.length > 0) {
        lines.push(current);
        current = "";
      }

      let start = 0;
      while (start < word.length) {
        lines.push(word.slice(start, start + width));
        start += width;
      }
      continue;
    }

    const candidate = current.length === 0 ? word : `${current} ${word}`;
    if (candidate.length <= width) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
};

const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(function ReceiptPrint(
  { receipt, width = 32, className = "" },
  ref
) {
  const lines = useMemo(() => {
    const ruler = "-".repeat(width);
    const rows: string[] = [
      centerLine(receipt.header.business_name, width),
      centerLine(receipt.header.address, width),
      ruler,
      formatLine("Date", receipt.header.date, width),
      formatLine("Invoice", receipt.header.invoice, width),
      formatLine("Cashier", receipt.header.cashier, width),
      ruler,
    ];

    for (const item of receipt.items) {
      const wrapped = wrapText(item.name, width);
      rows.push(...wrapped);
      rows.push(formatLine(`${item.qty} x ${toMoney(item.price)}`, toMoney(item.total), width));
    }

    rows.push(
      ruler,
      formatLine("Subtotal", toMoney(receipt.summary.subtotal), width),
      formatLine("Total", toMoney(receipt.summary.total), width),
      formatLine("Paid", toMoney(receipt.summary.paid), width),
      formatLine("Change", toMoney(receipt.summary.change), width),
      ruler,
      centerLine(receipt.footer.note, width)
    );

    if (receipt.footer.barcode) {
      rows.push(centerLine(`*${receipt.footer.barcode}*`, width));
    }

    if (receipt.footer.qr_payload) {
      rows.push(centerLine(receipt.footer.qr_payload, width));
    }

    return rows.join("\n");
  }, [receipt, width]);

  return (
    <div
      ref={ref}
      className={`bg-white p-3 text-black font-mono text-[12px] leading-5 ${className}`}
      style={{ width: `${width}ch` }}
    >
      <pre className="m-0 whitespace-pre-wrap break-words">{lines}</pre>
    </div>
  );
});

export default ReceiptPrint;
