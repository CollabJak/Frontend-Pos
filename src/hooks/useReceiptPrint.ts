import { RefObject, useCallback, useState } from "react";
import { useReactToPrint } from "react-to-print";

interface UseReceiptPrintOptions {
  contentRef: RefObject<HTMLDivElement | null>;
}

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Failed to print receipt.";
};

export const useReceiptPrint = ({
  contentRef,
}: UseReceiptPrintOptions) => {
  const [printError, setPrintError] = useState<string | null>(null);

  const print = useReactToPrint({
    contentRef,
    suppressErrors: true,
    onPrintError: (location, error) => {
      void location;
      setPrintError(toErrorMessage(error));
    },
  });

  const printReceipt = useCallback(
    async (): Promise<boolean> => {
      if (!contentRef.current) {
        setPrintError("Receipt element is not ready to print.");
        return false;
      }

      try {
        setPrintError(null);
        await print();
        return true;
      } catch (error) {
        setPrintError(toErrorMessage(error));
        return false;
      }
    },
    [contentRef, print]
  );

  const clearPrintError = useCallback(() => {
    setPrintError(null);
  }, []);

  return {
    printReceipt,
    printError,
    clearPrintError,
  };
};
