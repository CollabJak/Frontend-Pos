import type { PosCheckoutPayload } from "../../types/types";
import type { PosCheckoutFormValues } from "../../Schemas/pos.schema";

const toMoneyString = (value: number): string => {
  const fixed = value.toFixed(6);
  return fixed.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
};

export const toPosCheckoutPayload = (values: PosCheckoutFormValues): PosCheckoutPayload => ({
  location_id: values.location_id,
  items: values.items.map((item) => ({
    variant_id: item.variant_id,
    qty: item.qty,
  })),
  payment: {
    method: values.payment.method,
    amount_paid: toMoneyString(values.payment.amount_paid),
  },
  device_id: values.device_id,
});
