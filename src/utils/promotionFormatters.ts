const CONDITION_TYPE_LABELS: Record<string, string> = {
  customer_group: "Grup Pelanggan",
  location: "Lokasi / Outlet",
  weekday: "Hari Berlaku",
  total_transaction: "Total Transaksi",
  payment_method: "Metode Pembayaran",
  time_range: "Rentang Waktu",
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  discount_percent: "Diskon Persentase",
  discount_amount: "Potongan Harga",
  cashback: "Cashback",
};

const WEEKDAY_ID_LABELS: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

const CONDITION_OPERATOR_LABELS: Record<string, string> = {
  "=": "Sama Dengan",
  ">": "Besar Dari",
  "<": "Kecil Dari",
  ">=": "Nilai Minimum",
  "<=": "Nilai Maksimum",
  IN: "In",
  BETWEEN: "Nilai Antara",
};

export const getConditionOperatorLabel = (operator?: string): string => {
  if (!operator) return "Sama Dengan";
  return CONDITION_OPERATOR_LABELS[operator] || operator;
};

const formatRupiah = (val: number | string): string => {
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return "Rp " + num.toLocaleString("id-ID");
};

/**
 * Format condition value object into a clean human-readable string.
 * Example inputs:
 *   { value: 1 } -> "1"
 *   { value: "monday" } -> "Senin"
 *   { min: 50000, max: 100000 } -> "Rp 50.000 s/d Rp 100.000"
 *   { start_time: "08:00", end_time: "17:00" } -> "08:00 - 17:00"
 *   { weekdays: ["monday", "tuesday"] } -> "Senin, Selasa"
 *   { values: ["online", "offline"] } -> "online, offline"
 */
export const formatConditionValue = (
  type?: string,
  operator?: string,
  valueObj?: Record<string, unknown> | unknown
): string => {
  if (!valueObj) return "-";

  if (typeof valueObj !== "object") {
    return String(valueObj);
  }

  const raw = valueObj as Record<string, unknown>;

  // 1. Time Range
  if (type === "time_range") {
    const start = raw.start_time ?? raw.start ?? "";
    const end = raw.end_time ?? raw.end ?? "";
    if (start || end) {
      return `${start || "-"} s/d ${end || "-"}`;
    }
  }

  // 2. BETWEEN Operator
  if (operator === "BETWEEN") {
    const min = raw.min ?? raw.from ?? "";
    const max = raw.max ?? raw.to ?? "";
    if (min !== "" || max !== "") {
      if (type === "total_transaction") {
        return `${formatRupiah(String(min))} s/d ${formatRupiah(String(max))}`;
      }
      return `${min} s/d ${max}`;
    }
  }

  // 3. IN Operator
  if (operator === "IN") {
    const list =
      raw.weekdays ??
      raw.values ??
      raw.customer_group_ids ??
      raw.location_ids ??
      raw.payment_methods ??
      (Array.isArray(raw.value) ? raw.value : null);

    if (Array.isArray(list) && list.length > 0) {
      if (type === "weekday") {
        return list
          .map((d) => WEEKDAY_ID_LABELS[String(d).toLowerCase()] || String(d))
          .join(", ");
      }
      if (type === "total_transaction") {
        return list.map((item) => formatRupiah(String(item))).join(", ");
      }
      return list.map(String).join(", ");
    }
  }

  // 4. Single Value
  const val =
    raw.value ??
    raw.customer_group_id ??
    raw.location_id ??
    raw.payment_method ??
    raw.id;

  if (val !== undefined && val !== null && val !== "") {
    if (type === "weekday") {
      return WEEKDAY_ID_LABELS[String(val).toLowerCase()] || String(val);
    }
    if (type === "total_transaction") {
      return formatRupiah(String(val));
    }
    return String(val);
  }

  return "-";
};

export const getConditionTypeLabel = (type?: string): string => {
  if (!type) return "-";
  return CONDITION_TYPE_LABELS[type] || type;
};

export const formatConditionSummary = (
  type?: string,
  operator?: string,
  valueObj?: Record<string, unknown> | unknown
): string => {
  const typeLabel = getConditionTypeLabel(type);
  const valFormatted = formatConditionValue(type, operator, valueObj);

  if (type === "time_range") {
    return `${typeLabel}: ${valFormatted}`;
  }

  return `${typeLabel} (${getConditionOperatorLabel(operator)}): ${valFormatted}`;
};

/**
 * Format action value object into a clean human-readable string.
 * Example inputs:
 *   { value: 10 } (discount_percent) -> "10%"
 *   { value: 15000 } (discount_amount) -> "Rp 15.000"
 *   { value: 5000 } (cashback) -> "Rp 5.000"
 */
export const formatActionValue = (
  actionType?: string,
  actionValue?: Record<string, unknown> | unknown
): string => {
  if (!actionValue) return "-";

  if (typeof actionValue !== "object") {
    return String(actionValue);
  }

  const raw = actionValue as Record<string, unknown>;

  const val = raw.value ?? raw.amount ?? raw.price ?? raw.percent;

  if (val !== undefined && val !== null && val !== "") {
    if (actionType === "discount_percent") {
      return `${val}%`;
    }
    if (actionType === "discount_amount" || actionType === "cashback") {
      return formatRupiah(String(val));
    }
    return String(val);
  }

  return "-";
};

export const getActionTypeLabel = (type?: string): string => {
  if (!type) return "-";
  return ACTION_TYPE_LABELS[type] || type;
};

export const formatActionSummary = (
  type?: string,
  valueObj?: Record<string, unknown> | unknown
): string => {
  const typeLabel = getActionTypeLabel(type);
  const valFormatted = formatActionValue(type, valueObj);
  return `${typeLabel}: ${valFormatted}`;
};
