import type {
  Attention,
  CreatePayload,
  DateSource,
  EntryDraft,
  FoodEntry,
  Preferences,
  QuantityMovement,
  Session,
  Unit,
} from "../domain/types.ts"

export class ApiError extends Error {
  status: number

  code: string

  uncertain: boolean

  constructor(status: number, code: string, uncertain = false) {
    super(errorMessage(status, code))

    this.status = status

    this.code = code

    this.uncertain = uncertain
  }
}

export function errorMessage(status: number, code: string) {
  const messages: Record<string, string> = {
    INVALID_CREDENTIALS: "Email hoặc mật khẩu chưa đúng.",

    EMAIL_ALREADY_REGISTERED: "Email đã được đăng ký. Hãy đăng nhập.",

    AUTH_RATE_LIMITED: "Đã thử đăng nhập nhiều lần. Hãy chờ rồi thử lại.",

    VERSION_CONFLICT:
      "Dữ liệu vừa thay đổi. Xem lại lượng và xác nhận một thao tác mới.",

    CONCURRENT_MODIFICATION:
      "Dữ liệu vừa thay đổi. Xem lại lượng và xác nhận một thao tác mới.",

    INSUFFICIENT_QUANTITY:
      "Lượng hiện tại không đủ. Kiểm tra lại trước khi xác nhận.",

    IDEMPOTENCY_KEY_REUSED:
      "Nội dung yêu cầu đã thay đổi. Kiểm tra dữ liệu trước khi thao tác lại.",

    ACCOUNT_CHANGED:
      "Tài khoản đã đổi. Bản nháp và dữ liệu của tài khoản trước đã được xóa.",

    COMMAND_PENDING:
      "Kết quả thao tác trước chưa rõ. Kiểm tra và thử lại thao tác đó trước.",

    CONTRACT_ERROR: "Phản hồi chưa đúng định dạng. Hãy thử tải lại dữ liệu.",

    REQUEST_TIMEOUT:
      "Máy chủ chưa phản hồi kịp. Thử lại sẽ dùng cùng mã yêu cầu.",

    NETWORK_ERROR:
      "Chưa xác nhận được kết quả do kết nối. Thử lại sẽ dùng cùng mã yêu cầu.",

    AUTH_REQUIRED:
      "Phiên đã hết hạn. Đăng nhập lại bằng cùng tài khoản để giữ bản nháp.",

    CSRF_FAILED:
      "Phiên xác thực bảo mật chưa hợp lệ. Vui lòng tải lại trang hoặc đăng nhập lại.",

    VALIDATION_ERROR:
      "Thông tin chưa đúng định dạng. Hãy kiểm tra lại email hoặc mật khẩu.",
  }

  if (messages[code]) return messages[code]

  if (status === 401)
    return "Phiên đã hết hạn. Đăng nhập lại bằng cùng tài khoản để giữ bản nháp."

  if (status === 403)
    return "Phiên xác thực chưa hợp lệ. Đăng nhập lại trước khi tiếp tục."

  if (status === 404) return "Bản ghi không còn khả dụng. Hãy quay lại kho."

  if (status === 422)
    return "Thông tin chưa hợp lệ. Kiểm tra lượng, ngày và các trường đã nhập."

  if (status === 413) return "Ảnh quá lớn. Chọn ảnh không quá 5 MB."

  if (status === 415) return "Chọn ảnh JPEG, PNG hoặc WebP."

  if (status === 429) return "Quá nhiều yêu cầu. Hãy chờ rồi thử lại."

  return "Không thể hoàn thành yêu cầu. Bạn có thể thử lại hoặc nhập tay."
}

type CanonicalAttention = "past_date" | "due_today" | "soon" | "unknown" | "later" | "inactive"

export type EntryDTO = Omit<FoodEntry, "remaining_quantity" | "expiry_date_certainty" | "expiry_date_source" | "expiry_date_label_type" | "attention"> & {
  remaining_quantity: string

  date_certainty: "known" | "estimated" | "unknown"

  date_source: DateSource

  date_label_type: "use_by" | "best_before" | "unspecified"

  attention: {
    status: CanonicalAttention

    reason_code: string

    as_of_date: string
  }
}

export type Page<T,> = {
  items: T[]

  pagination: {
    page: number

    limit: number

    total: number
  }

  as_of_date?: string
}

export type EntryPage<T> = Page<T> & { as_of_date: string }

export type Command = Readonly<{
  method: string

  path: string

  body?: string

  key: string

  owner: string
}>

export type EntryDraftDTO = {
  name: string

  storage_location?: string

  expiry_date: string | null

  date_certainty: "known" | "estimated" | "unknown"

  date_source: DateSource

  date_label_type: "use_by" | "best_before" | "unspecified"

  opened_on: string | null

  note: string | null

  barcode?: string | null

  barcode_format?: string | null
}

export type CreateEntryDTO = EntryDraftDTO & {
  quantity: string

  unit: Unit
}

export type MovementDTO = {
  expected_version: number

  kind: "consume" | "discard"

  amount: string

  reason?: string | null
}

export type RecountDTO = {
  expected_version: number

  actual_quantity: string

  reason: string
}

export type EditEntryDTO = Partial<EntryDraftDTO> & {
  expected_version: number
}

export type UpdatePreferencesDTO = Pick<Preferences, "timezone" | "attention_lead_days"> & {
  expected_version: number
}

export type MovementResponseDTO = Omit<QuantityMovement, "kind" | "quantity_before" | "quantity_after"> & {
  kind: "initial" | "consume" | "discard" | "adjustment"

  quantity_before: string

  quantity_after: string
}

export type MutationResultDTO = {
  entry: EntryDTO

  movement: MovementResponseDTO | null

  changed: boolean
}

export type MutationResult = {
  entry: FoodEntry

  movement: QuantityMovement | null

  changed: boolean
}

export type ScanDateCandidate = {
  value: string | null

  date_certainty: "exact" | "inferred" | null

  date_label_type: "expiry" | "best_before" | "use_by" | "manufactured" | "unknown"

  source_text: string

  alternatives: string[]

  ambiguous: boolean

  requires_confirmation: true
}

export type ScanCandidates = {
  food_name: string | null

  expiry_date: ScanDateCandidate

  manufactured_date: {
    value: string | null

    source_text: string
  }
}

export type ScanResult = {
  candidates: ScanCandidates

  raw_text: string

  warnings: string[]

  errors: string[]

  requires_confirmation: true
}

/** Projects a reviewed scan choice into editable entry metadata only. */

export function scanToEntryDraft(
  result: ScanResult,

  selectedDate: string | null,
): Pick<EntryDraft, "name" | "expiry_date" | "expiry_date_certainty" | "expiry_date_source" | "expiry_date_label_type"> {
  const candidate = result.candidates.expiry_date

  const expiryDate =
    candidate.date_label_type === "manufactured" ? null : selectedDate

  const ambiguousChoice =
    candidate.ambiguous ||
    (expiryDate !== null && expiryDate !== candidate.value)

  const exact =
    Boolean(expiryDate) &&
    candidate.date_certainty === "exact" &&
    !ambiguousChoice

  const certainty = !expiryDate ? "unknown" : exact ? "exact" : "estimated"

  const label =
    candidate.date_label_type === "use_by" ||
    candidate.date_label_type === "best_before"
      ? candidate.date_label_type
      : null

  return {
    name: result.candidates.food_name?.trim() || "",

    expiry_date: expiryDate,

    expiry_date_certainty: certainty,

    expiry_date_source: !expiryDate
      ? null
      : exact
        ? "printed_label"
        : "user_estimate",

    expiry_date_label_type: expiryDate ? label : null,
  }
}

const attentionMap: Record<CanonicalAttention, Attention | undefined> = {
  past_date: "past",

  due_today: "today",

  soon: "soon",

  unknown: "unknown",

  later: "later",

  inactive: undefined,
}

const contractError = () => new ApiError(502, "CONTRACT_ERROR")

const isCalendarDate = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value

export function decimal(value: number): string {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 999999999.999 ||
    Math.abs(value * 1000 - Math.round(value * 1000)) > 0.001
  )
    throw new ApiError(422, "VALIDATION_ERROR")

  return value.toFixed(3).replace(/\.?0+$/, "") || "0"
}

export function fromEntry(dto: EntryDTO): FoodEntry {
  const quantity = Number(dto.remaining_quantity)

  if (
    typeof dto.id !== "string" ||
    !dto.attention ||
    !(dto.attention.status in attentionMap) ||
    !Number.isFinite(quantity) ||
    quantity < 0 ||
    quantity > 999999999.999 ||
    !["known", "estimated", "unknown"].includes(dto.date_certainty)
  )
    throw contractError()

  return {
    id: dto.id,

    name: dto.name,

    storage_location:
      dto.storage_location === "unspecified" ? null : dto.storage_location,

    remaining_quantity: quantity,

    unit: dto.unit,

    expiry_date: dto.expiry_date,

    expiry_date_certainty:
      dto.date_certainty === "known" ? "exact" : dto.date_certainty,

    expiry_date_source: dto.date_source,

    expiry_date_label_type:
      dto.date_label_type === "unspecified" ? "unknown" : dto.date_label_type,

    opened_on: dto.opened_on,

    note: dto.note,

    barcode: (dto as Record<string, unknown>).barcode as string | null ?? null,

    barcode_format:
      (dto as Record<string, unknown>).barcode_format as string | null ?? null,

    version: dto.version,

    deleted_at: dto.deleted_at,

    created_at: dto.created_at,

    updated_at: dto.updated_at,

    attention: attentionMap[dto.attention.status],

    as_of_date: dto.attention.as_of_date,

    attention_reason: dto.attention.reason_code,
  }
}

export function draftDTO(draft: EntryDraft): EntryDraftDTO {
  const unknown = draft.expiry_date_certainty === "unknown"

  const dto: EntryDraftDTO = {
    name: draft.name,

    expiry_date: unknown ? null : draft.expiry_date,

    date_certainty:
      draft.expiry_date_certainty === "exact"
        ? "known"
        : draft.expiry_date_certainty,

    date_source: unknown
      ? "unknown"
      : draft.expiry_date_certainty === "estimated"
        ? "user_estimate"
        : draft.expiry_date_source === "user_entered"
          ? "user_entered"
          : "printed_label",

    date_label_type:
      unknown ||
      !draft.expiry_date_label_type ||
      draft.expiry_date_label_type === "unknown"
        ? "unspecified"
        : draft.expiry_date_label_type,

    opened_on: draft.opened_on,

    note: draft.note,
  }

  if (draft.barcode) {
    dto.barcode = draft.barcode

    dto.barcode_format = draft.barcode_format ?? "other"
  }

  if (Object.prototype.hasOwnProperty.call(draft, "storage_location")) {
    dto.storage_location =
      typeof draft.storage_location === "string" &&
      draft.storage_location.trim()
        ? draft.storage_location.trim()
        : "unspecified"
  }

  return dto
}

export const createDTO = (draft: CreatePayload): CreateEntryDTO => ({
  ...draftDTO(draft),

  quantity: decimal(draft.initial_quantity),

  unit: draft.unit,
})

export const fromMovement = (dto: MovementResponseDTO): QuantityMovement => ({
  ...dto,

  kind: dto.kind === "adjustment" ? "recount" : dto.kind,

  quantity_before: Number(dto.quantity_before),

  quantity_after: Number(dto.quantity_after),
})

export function newCommand(
  owner: string,

  method: string,

  path: string,

  body?: unknown,

  key?: string,
): Command {
  return Object.freeze({
    owner,

    method,

    path,

    body: body === undefined ? undefined : JSON.stringify(body),

    key: key ?? `idemp_${crypto.randomUUID()}`,
  })
}

const fromMutationResult = (dto: MutationResultDTO): MutationResult => {
  if (
    !dto ||
    typeof dto !== "object" ||
    !dto.entry ||
    typeof dto.entry !== "object" ||
    (dto.movement !== null &&
      (!dto.movement || typeof dto.movement !== "object")) ||
    typeof dto.changed !== "boolean"
  )
    throw contractError()

  return {
    entry: fromEntry(dto.entry),

    movement: dto.movement ? fromMovement(dto.movement) : null,

    changed: dto.changed,
  }
}

export class ApiClient {
  csrf = ""

  transport: typeof fetch

  base: string

  requestTimeoutMs: number

  constructor(
    transport: typeof fetch = (...args) => globalThis.fetch(...args),

    base = "/api/v1",

    requestTimeoutMs = 15_000,
  ) {
    // Fetch implementations may depend on their global receiver. Calling a stored

    // transport as `this.transport(...)` would otherwise bind ApiClient as `this`.

    this.transport = (input, init) =>
      Reflect.apply(transport, globalThis, [input, init])

    this.base = base

    this.requestTimeoutMs =
      Number.isFinite(requestTimeoutMs) && requestTimeoutMs > 0
        ? requestTimeoutMs
        : 15_000
  }

  async request<T,>(
    path: string,

    init: RequestInit = {},

    key?: string,
  ): Promise<T> {
    const headers = new Headers(init.headers)

    if (typeof init.body === "string")
      headers.set("Content-Type", "application/json")

    if (key) headers.set("Idempotency-Key", key)

    if (init.method && !["GET", "HEAD"].includes(init.method) && this.csrf)
      headers.set("X-CSRF-Token", this.csrf)

    const controller = new AbortController()

    const callerSignal = init.signal

    let callerAborted = false

    const abortFromCaller = () => {
      callerAborted = true

      controller.abort(callerSignal?.reason)
    }

    if (callerSignal?.aborted) abortFromCaller()
    else
      callerSignal?.addEventListener("abort", abortFromCaller, { once: true })

    let timedOut = false

    let timer: ReturnType<typeof setTimeout> | undefined

    const timeoutError = () => new ApiError(0, "REQUEST_TIMEOUT", true)

    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        timedOut = true

        reject(timeoutError())

        controller.abort()
      }, this.requestTimeoutMs)
    })

    const operation = (async () => {
      let response: Response

      try {
        response = await this.transport(this.base + path, {
          ...init,

          headers,

          signal: controller.signal,

          credentials: "include",

          cache: "no-store",
        })
      } catch (failure) {
        if (timedOut) throw timeoutError()

        if (callerAborted) throw failure

        throw new ApiError(0, "NETWORK_ERROR", true)
      }

      if (response.status === 204) return undefined as T

      let body: any

      try {
        body = await response.json()
      } catch (failure) {
        if (timedOut) throw timeoutError()

        if (callerAborted) throw failure

        throw new ApiError(
          response.status,

          "CONTRACT_ERROR",

          response.ok || response.status >= 500,
        )
      }

      if (!response.ok) {
        if (response.status === 401) this.csrf = ""

        const code = body?.code || body?.title || "REQUEST_FAILED"

        throw new ApiError(response.status, code, response.status >= 500)
      }

      return body as T
    })()

    try {
      return await Promise.race([operation, timeout])
    } catch (failure) {
      if (timedOut) throw timeoutError()

      throw failure
    } finally {
      if (timer !== undefined) clearTimeout(timer)

      callerSignal?.removeEventListener("abort", abortFromCaller)
    }
  }

  async session() {
    const session = await this.request<Session>("/auth/session")

    if (!session.user?.id || !session.csrf_token) throw contractError()

    this.csrf = session.csrf_token

    return session
  }

  async authenticate(
    mode: "login" | "register",
    input: {
      email: string
      password: string
      display_name?: string
      timezone?: string
    },
  ) {
    const payload =
      mode === "register"
        ? {
            email: input.email,
            password: input.password,
            display_name: input.display_name,
            timezone:
              input.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone ||
              "UTC",
          }
        : {
            email: input.email,
            password: input.password,
          }

    await this.request(`/auth/${mode}`, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    // Only the authenticated session read establishes the UI principal.
    return this.session()
  }

  async logout() {
    await this.request("/auth/logout", { method: "POST" })

    this.csrf = ""
  }

  private async mutation<T,>(
    method: string,

    path: string,

    body?: unknown,

    commandKey?: string,
  ): Promise<T> {
    const key = commandKey ?? crypto.randomUUID()

    const serializedBody = body === undefined ? undefined : JSON.stringify(body)

    for (let attempt = 0; ; attempt++) {
      try {
        return await this.request<T>(
          path,

          { method, body: serializedBody },

          key,
        )
      } catch (error) {
        if (!(error instanceof ApiError) || !error.uncertain || attempt >= 1)
          throw error
      }
    }
  }

  async createEntry(draft: CreateEntryDTO, commandKey?: string) {
    const entry = await this.mutation<EntryDTO>(
      "POST",

      "/food-entries",

      draft,

      commandKey,
    )

    return fromEntry(entry)
  }

  async recordMovement(
    id: string,

    movement: MovementDTO,

    commandKey?: string,
  ): Promise<MutationResult> {
    return fromMutationResult(
      await this.mutation<MutationResultDTO>(
        "POST",

        `/food-entries/${encodeURIComponent(id)}/movements`,

        movement,

        commandKey,
      ),
    )
  }

  async recount(
    id: string,

    recount: RecountDTO,

    commandKey?: string,
  ): Promise<MutationResult> {
    return fromMutationResult(
      await this.mutation<MutationResultDTO>(
        "POST",

        `/food-entries/${encodeURIComponent(id)}/recounts`,

        recount,

        commandKey,
      ),
    )
  }

  async updateEntry(
    id: string,

    patch: EditEntryDTO,

    commandKey?: string,
  ): Promise<FoodEntry> {
    return fromEntry(
      await this.mutation<EntryDTO>(
        "PATCH",

        `/food-entries/${encodeURIComponent(id)}`,

        patch,

        commandKey,
      ),
    )
  }

  async deleteEntry(
    id: string,

    expectedVersion: number,

    commandKey?: string,
  ): Promise<void> {
    const query = new URLSearchParams({
      expected_version: String(expectedVersion),
    })

    await this.mutation<void>(
      "DELETE",

      `/food-entries/${encodeURIComponent(id)}?${query}`,

      undefined,

      commandKey,
    )
  }

  async restoreEntry(
    id: string,

    expectedVersion: number,

    commandKey?: string,
  ): Promise<FoodEntry> {
    return fromEntry(
      await this.mutation<EntryDTO>(
        "POST",

        `/food-entries/${encodeURIComponent(id)}/restore`,

        { expected_version: expectedVersion },

        commandKey,
      ),
    )
  }

  updatePreferences(prefs: UpdatePreferencesDTO, commandKey?: string) {
    return this.mutation<Preferences>(
      "PATCH",

      "/me/preferences",

      prefs,

      commandKey,
    )
  }

  async entries(query: Record<string, string | number> = {}, trash = false) {
    const search = new URLSearchParams(
      Object.entries(query).map(([key, value]) => [key, String(value)]),
    )

    const page = await this.request<EntryPage<EntryDTO>>(
      `${trash ? "/trash/food-entries" : "/food-entries"}?${search}`,
    )

    if (
      !Array.isArray(page.items) ||
      !page.pagination ||
      !isCalendarDate(page.as_of_date)
    )
      throw contractError()

    return { ...page, items: page.items.map(fromEntry) }
  }

  async entry(id: string) {
    return fromEntry(
      await this.request<EntryDTO>(`/food-entries/${encodeURIComponent(id)}`),
    )
  }

  async history(id: string) {
    const next = await this.request<Page<MovementResponseDTO>>(
      `/food-entries/${encodeURIComponent(id)}/movements?page=1&limit=50`,
    )

    if (!Array.isArray(next.items) || !next.pagination) throw contractError()

    return next.items.map(fromMovement)
  }

  preferences() {
    return this.request<Preferences>("/me/preferences")
  }

  async scan(file: File, barcode?: string, locale?: string) {
    const body = new FormData()

    body.append("image", file)

    const params = new URLSearchParams()

    if (barcode) params.set("barcode", barcode)

    if (locale) params.set("locale", locale)

    const qs = params.toString() ? `?${params.toString()}` : ""

    const result = await this.request<ScanResult>(`/scans${qs}`, {
      method: "POST",

      body,
    })

    const candidates = result.candidates

    const candidate = candidates?.expiry_date

    const manufactured = candidates?.manufactured_date

    if (
      result.requires_confirmation !== true ||
      typeof result.raw_text !== "string" ||
      !Array.isArray(result.warnings) ||
      !result.warnings.every((item) => typeof item === "string") ||
      !Array.isArray(result.errors) ||
      !result.errors.every((item) => typeof item === "string") ||
      !candidates ||
      (candidates.food_name !== null &&
        typeof candidates.food_name !== "string") ||
      !candidate ||
      candidate.requires_confirmation !== true ||
      ![null, "exact", "inferred"].includes(candidate.date_certainty) ||
      !["expiry", "best_before", "use_by", "manufactured", "unknown"].includes(
        candidate.date_label_type,
      ) ||
      (candidate.value !== null && !isCalendarDate(candidate.value)) ||
      typeof candidate.source_text !== "string" ||
      typeof candidate.ambiguous !== "boolean" ||
      !Array.isArray(candidate.alternatives) ||
      !candidate.alternatives.every(isCalendarDate) ||
      !manufactured ||
      (manufactured.value !== null && !isCalendarDate(manufactured.value)) ||
      typeof manufactured.source_text !== "string"
    )
      throw contractError()

    return result
  }
}

export const api = new ApiClient()
