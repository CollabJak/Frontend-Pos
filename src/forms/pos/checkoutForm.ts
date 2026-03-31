import type { PosCheckoutPayload } from "../../types/types";
import type { PosCheckoutFormValues } from "../../Schemas/pos.schema";

export const toPosCheckoutPayload = (values: PosCheckoutFormValues): PosCheckoutPayload => ({
  location_id: values.location_id,
  items: values.items.map((item) => ({
    variant_id: item.variant_id,
    qty: item.qty,
  })),
  device_id: values.device_id,
});
