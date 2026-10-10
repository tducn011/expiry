/**
 * In-memory API boundary for the prototype. Records mirror the ERD exactly
 * (users, food_entries, quantity_movements, api_requests); production replaces
 * this module with /api/v1 calls while screens keep the same command semantics.
 */

// ---------- ERD: users ----------
export type User = {
  id: string
  identity_subject: string
  display_name: string | null
  timezone: string
  attention_lead_days: number
  version: number
  created_at: string
  updated_at: string
}

// ---------- ERD: food_entries ----------
export type Unit = "piece" | "g" | "ml"
export type DateCertainty = "exact" | "estimated" | "unknown"
export type DateSource = "package_label" | "user_reentered" | "user_estimate"
export type DateLabelType = "use_by" | "best_before" | "unknown"

export type FoodEntry = {
  id: string
  user_id: string
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

// ---------- ERD: api_requests ----------
export type ApiRequest = {
  id: string
  user_id: string
  idempotency_key: string
  operation: string
  request_hash: string
  response_status: number
  response_body: string
  created_at: string
}

// ---------- Derived (never stored) ----------
export type Attention = "past" | "today" | "soon" | "unknown" | "later"

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code)
  }
}

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

export const DEMO_DATE = "2026-10-08"
const USER_ID = "usr_demo"
let clock = new Date("2026-10-08T11:20:00+07:00").getTime()
const now = () => {
  clock += 60000
  return new Date(clock).toISOString()
}

/** Applies the date-metadata business rule: unknown clears metadata, estimated fixes source. */
export function normalizeDateMeta<T extends EntryDraft>(draft: T): T {
  if (draft.expiry_date_certainty === "unknown") {
    return {
      ...draft,
      expiry_date: null,
      expiry_date_source: null,
      expiry_date_label_type: null,
    }
  }
  if (draft.expiry_date_certainty === "estimated")
    return { ...draft, expiry_date_source: "user_estimate" }
  return {
    ...draft,
    expiry_date_source:
      draft.expiry_date_source === "user_estimate"
        ? "package_label"
        : (draft.expiry_date_source ?? "package_label"),
  }
}

export function attentionFor(
  entry: Pick<FoodEntry, "expiry_date">,
  leadDays: number,
): Attention {
  if (!entry.expiry_date) return "unknown"
  const days = Math.round(
    (new Date(`${entry.expiry_date}T12:00:00`).getTime() -
      new Date(`${DEMO_DATE}T12:00:00`).getTime()) /
      86400000,
  )
  if (days < 0) return "past"
  if (days === 0) return "today"
  if (days <= leadDays) return "soon"
  return "later"
}

type Seed = [name: string, location: string | null, unit: Unit, history: [MovementKind, number, string, string?][], date: string | null, certainty: DateCertainty, label: DateLabelType | null, opened?: string, deleted?: string]
const seed: Seed[] = [
  [
    "Sữa tươi không đường",
    "Ngăn mát",
    "piece",
    [
      ["initial", 2, "2026-10-04T19:20"],
      ["consume", 1, "2026-10-07T07:45", "Bữa sáng"],
    ],
    "2026-10-07",
    "exact",
    "use_by",
    "2026-10-05",
  ],
  [
    "Rau cải thìa",
    "Ngăn rau",
    "g",
    [
      ["initial", 500, "2026-10-06T18:10"],
      ["consume", 350, "2026-10-07T18:30"],
    ],
    "2026-10-08",
    "estimated",
    "unknown",
  ],
  [
    "Cá hồi phi lê",
    "Ngăn đông",
    "g",
    [
      ["initial", 300.5, "2026-10-05T20:15"],
      ["discard", 250.5, "2026-10-07T12:00", "Cắt bỏ phần da"],
    ],
    "2026-10-09",
    "exact",
    "use_by",
  ],
  [
    "Sữa chua Hy Lạp",
    "Ngăn mát",
    "piece",
    [
      ["initial", 4, "2026-10-02T10:00"],
      ["recount", 3, "2026-10-07T21:12", "Đếm lại trong tủ"],
    ],
    "2026-10-10",
    "exact",
    "best_before",
  ],
  [
    "Đậu hũ non",
    "Ngăn mát",
    "piece",
    [["initial", 2, "2026-10-08T08:00"]],
    null,
    "unknown",
    null,
  ],
  [
    "Gạo lứt",
    "Tủ bếp",
    "g",
    [
      ["initial", 2000, "2026-10-01T09:00"],
      ["consume", 1750, "2026-10-06T17:00"],
    ],
    "2026-11-30",
    "exact",
    "best_before",
  ],
  [
    "Nước cam",
    "Ngăn mát",
    "ml",
    [
      ["initial", 1000.5, "2026-10-08T09:00"],
      ["consume", 750.5, "2026-10-08T09:10"],
    ],
    "2026-10-15",
    "exact",
    "use_by",
    "2026-10-08",
  ],
  [
    "Chuối",
    "Kệ bếp",
    "piece",
    [["initial", 5, "2026-10-07T16:00"]],
    "2026-10-11",
    "estimated",
    "unknown",
  ],
  [
    "Mì Ý",
    "Tủ bếp",
    "g",
    [
      ["initial", 500, "2026-10-02T08:00"],
      ["consume", 0, "2026-10-07T19:00"],
    ],
    "2026-12-20",
    "exact",
    "best_before",
  ],
  [
    "Trứng gà",
    "Ngăn mát",
    "piece",
    [
      ["initial", 10, "2026-10-03T09:00"],
      ["consume", 6, "2026-10-07T08:00"],
    ],
    "2026-10-12",
    "exact",
    "use_by",
  ],
  [
    "Sữa tươi không đường",
    "Ngăn đông",
    "piece",
    [["initial", 2, "2026-10-05T15:00"]],
    "2026-10-22",
    "exact",
    "best_before",
  ],
  [
    "Phô mai lát",
    "Ngăn mát",
    "piece",
    [
      ["initial", 6, "2026-10-01T12:00"],
      ["consume", 4, "2026-10-05T07:00"],
    ],
    "2026-10-06",
    "exact",
    "best_before",
    undefined,
    "2026-10-08T10:30",
  ],
]

const iso = (local: string) => new Date(`${local}:00+07:00`).toISOString()

class MockApiAdapter {
  private sequence = 0
  private ids = 100
  user: User = {
    id: USER_ID,
    identity_subject: "demo|hoang-an",
    display_name: "Phạm Hoàng An",
    timezone: "Asia/Ho_Chi_Minh",
    attention_lead_days: 2,
    version: 1,
    created_at: iso("2026-10-01T08:00"),
    updated_at: iso("2026-10-01T08:00"),
  }
  private entries: FoodEntry[] = []
  private movements: QuantityMovement[] = []
  private requests: ApiRequest[] = []

  constructor() {
    seed.forEach(
      (
        [
          name,
          location,
          unit,
          history,
          date,
          certainty,
          label,
          opened,
          deleted,
        ],
        index,
      ) => {
        const id = `ent_${index + 1}`
        let before = 0
        history.forEach(([kind, after, at, reason]) => {
          this.movements.push({
            id: `mov_${this.ids++}`,
            entry_id: id,
            kind,
            quantity_before: before,
            quantity_after: after,
            reason: reason ?? null,
            recorded_at: iso(at),
          })
          before = after
        })
        const created = iso(history[0][2])
        this.entries.push({
          id,
          user_id: USER_ID,
          name,
          storage_location: location,
          remaining_quantity: before,
          unit,
          expiry_date: date,
          expiry_date_certainty: certainty,
          expiry_date_source:
            certainty === "unknown"
              ? null
              : certainty === "estimated"
                ? "user_estimate"
                : "package_label",
          expiry_date_label_type: label,
          opened_on: opened ?? null,
          note: null,
          version: history.length,
          deleted_at: deleted ? iso(deleted) : null,
          created_at: created,
          updated_at: iso(history[history.length - 1][2]),
        })
      },
    )
  }

  createCommandKey(operation: string) {
    this.sequence += 1
    return `demo-${operation}-${this.sequence}`
  }

  /** Idempotent command execution backed by the api_requests table. */
  private execute<T,>(
    key: string,
    operation: string,
    payload: unknown,
    apply: () => T,
  ): {
    data: T
    replayed: boolean
  } {
    const request_hash = JSON.stringify(payload)
    const stored = this.requests.find(
      (r) => r.idempotency_key === key && r.user_id === this.user.id,
    )
    if (stored) {
      if (
        stored.request_hash !== request_hash ||
        stored.operation !== operation
      )
        throw new ApiError(422, "IDEMPOTENCY_PAYLOAD_MISMATCH")
      return { data: JSON.parse(stored.response_body) as T, replayed: true }
    }
    const data = apply()
    this.requests.push({
      id: `req_${this.ids++}`,
      user_id: this.user.id,
      idempotency_key: key,
      operation,
      request_hash,
      response_status: 200,
      response_body: JSON.stringify(data),
      created_at: now(),
    })
    return { data, replayed: false }
  }

  private find(id: string, expectedVersion?: number) {
    const entry = this.entries.find(
      (e) => e.id === id && e.user_id === this.user.id,
    )
    if (!entry) throw new ApiError(404, "NOT_FOUND")
    if (expectedVersion !== undefined && entry.version !== expectedVersion)
      throw new ApiError(409, "VERSION_CONFLICT")
    return entry
  }

  private write(entry: FoodEntry, patch: Partial<FoodEntry>) {
    Object.assign(entry, patch, {
      version: entry.version + 1,
      updated_at: now(),
    })
    return { ...entry }
  }

  // GET /food-entries
  listEntries() {
    return this.entries.filter((e) => !e.deleted_at).map((e) => ({ ...e }))
  }
  // GET /trash/food-entries
  listTrash() {
    return this.entries.filter((e) => e.deleted_at).map((e) => ({ ...e }))
  }
  // GET /food-entries/{id}
  getEntry(id: string) {
    return { ...this.find(id) }
  }
  // GET /food-entries/{id}/movements
  listMovements(id: string) {
    return this.movements
      .filter((m) => m.entry_id === id)
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
  }

  // POST /food-entries
  createEntry(key: string, payload: CreatePayload) {
    return this.execute(key, "create_food_entry", payload, () => {
      const { initial_quantity, ...rest } = normalizeDateMeta(payload)
      const at = now()
      const entry: FoodEntry = {
        ...rest,
        id: `ent_${this.ids++}`,
        user_id: this.user.id,
        remaining_quantity: initial_quantity,
        version: 1,
        deleted_at: null,
        created_at: at,
        updated_at: at,
      }
      this.entries.unshift(entry)
      this.movements.push({
        id: `mov_${this.ids++}`,
        entry_id: entry.id,
        kind: "initial",
        quantity_before: 0,
        quantity_after: initial_quantity,
        reason: null,
        recorded_at: at,
      })
      return { ...entry }
    })
  }

  // PATCH /food-entries/{id}
  updateEntry(
    key: string,
    id: string,
    expected_version: number,
    patch: EntryDraft,
  ) {
    return this.execute(
      key,
      "update_food_entry",
      { id, expected_version, patch },
      () =>
        this.write(this.find(id, expected_version), normalizeDateMeta(patch)),
    )
  }

  // POST /food-entries/{id}/movements  (consume | discard)
  recordMovement(
    key: string,
    id: string,
    expected_version: number,
    kind: "consume" | "discard",
    quantity: number,
    reason: string | null,
  ) {
    return this.execute(
      key,
      "record_movement",
      { id, expected_version, kind, quantity, reason },
      () => {
        const entry = this.find(id, expected_version)
        if (quantity <= 0 || quantity > entry.remaining_quantity)
          throw new ApiError(409, "INSUFFICIENT_QUANTITY")
        const after = +(entry.remaining_quantity - quantity).toFixed(3)
        this.movements.push({
          id: `mov_${this.ids++}`,
          entry_id: id,
          kind,
          quantity_before: entry.remaining_quantity,
          quantity_after: after,
          reason,
          recorded_at: now(),
        })
        return this.write(entry, { remaining_quantity: after })
      },
    )
  }

  // POST /food-entries/{id}/recounts
  recount(
    key: string,
    id: string,
    expected_version: number,
    actual_quantity: number,
    reason: string,
  ) {
    return this.execute(
      key,
      "recount",
      { id, expected_version, actual_quantity, reason },
      () => {
        const entry = this.find(id, expected_version)
        if (actual_quantity === entry.remaining_quantity) return { ...entry }
        this.movements.push({
          id: `mov_${this.ids++}`,
          entry_id: id,
          kind: "recount",
          quantity_before: entry.remaining_quantity,
          quantity_after: actual_quantity,
          reason,
          recorded_at: now(),
        })
        return this.write(entry, { remaining_quantity: actual_quantity })
      },
    )
  }

  // DELETE /food-entries/{id}
  deleteEntry(key: string, id: string, expected_version: number) {
    return this.execute(
      key,
      "delete_food_entry",
      { id, expected_version },
      () => this.write(this.find(id, expected_version), { deleted_at: now() }),
    )
  }

  // POST /food-entries/{id}/restore
  restoreEntry(key: string, id: string) {
    return this.execute(key, "restore_food_entry", { id }, () =>
      this.write(this.find(id), { deleted_at: null }),
    )
  }

  // GET /me/preferences
  getPreferences() {
    return {
      timezone: this.user.timezone,
      attention_lead_days: this.user.attention_lead_days,
      version: this.user.version,
    }
  }

  // PATCH /me/preferences
  updatePreferences(
    key: string,
    expected_version: number,
    patch: Pick<User, "timezone" | "attention_lead_days">,
  ) {
    return this.execute(
      key,
      "update_preferences",
      { expected_version, patch },
      () => {
        if (this.user.version !== expected_version)
          throw new ApiError(409, "VERSION_CONFLICT")
        Object.assign(this.user, patch, {
          version: this.user.version + 1,
          updated_at: now(),
        })
        return this.getPreferences()
      },
    )
  }
}

export const mockApi = new MockApiAdapter()
