export const schedulingKeys = {
  calendar: ["scheduling", "calendar"] as const,
  batches: ["schedule-batches"] as const,
  batch: (id: number) => ["schedule-batches", id] as const,
  generationStatus: (id: number) => ["schedule-generation", id] as const,
  batchSchedules: (id: number) => ["schedule-batches", id, "schedules"] as const,
  schedule: (id?: number | null) => ["schedule", id] as const,
  scheduleAudit: (id?: number | null) => ["schedule-audit", id] as const,
  batchAudit: (id: number) => ["schedule-batches", id, "audit-logs"] as const,
  publishedLookup: (userId: number | null, date: string | null) =>
    ["scheduling", "published-schedule-lookup", userId, date] as const,
};
