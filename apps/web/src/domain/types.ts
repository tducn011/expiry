/** UI view types; canonical transport mapping lives in api/client.ts. */
export type Unit = "piece" | "g" | "ml"
export type DateCertainty = "exact" | "estimated" | "unknown"
export type DateSource = "package_label" | "user_reentered" | "user_estimate"
export type DateLabelType = "use_by" | "best_before" | "unknown"

export type FoodEntry = {
  attention?: Attention
  as_of_date?: string
  attention_reason?: string
  id: string
  name: string
  storage_location: string | null
  remaining_quantity: number
  unit: Unit
  expiry_date: string | null
  expiry_date_certainty: DateCertainty
  expiry_date_source: DateSource | null
  expiry_date_label_type: DateLabelType | null
  opened_on: string | null
  note: string | null
  version: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

// ---------- ERD: quantity_movements ----------
export type MovementKind = "initial" | "consume" | "discard" | "recount"
export type QuantityMovement = {
  id: string
  entry_id: string
  kind: MovementKind
  quantity_before: number
  quantity_after: number
  reason: string | null
  recorded_at: string
}


export type Attention = "past" | "today" | "soon" | "unknown" | "later"
export type EntryDraft = {
  name: string
  storage_location: string | null
  expiry_date: string | null
  expiry_date_certainty: DateCertainty
  expiry_date_source: DateSource | null
  expiry_date_label_type: DateLabelType | null
  opened_on: string | null
  note: string | null
}
export type CreatePayload = EntryDraft & {
  initial_quantity: number
  unit: Unit
}


export type Preferences = { timezone: string; attention_lead_days: number; version: number }
export type Session = { user: Preferences & { id: string; display_name: string; email: string }; csrf_token: string; expires_at: string }
