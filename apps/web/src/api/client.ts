import type { Attention, CreatePayload, EntryDraft, FoodEntry, Preferences, QuantityMovement, Session } from "../domain/types.ts"

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
    VERSION_CONFLICT: "Dữ liệu vừa thay đổi. Xem lại lượng và xác nhận một thao tác mới.",
    INSUFFICIENT_QUANTITY: "Lượng hiện tại không đủ. Kiểm tra lại trước khi xác nhận.",
    IDEMPOTENCY_KEY_REUSED: "Nội dung yêu cầu đã thay đổi. Kiểm tra dữ liệu trước khi thao tác lại.",
    ACCOUNT_CHANGED: "Tài khoản đã đổi. Bản nháp và dữ liệu của tài khoản trước đã được xóa.",
    COMMAND_PENDING: "Kết quả thao tác trước chưa rõ. Kiểm tra và thử lại thao tác đó trước.",
    CONTRACT_ERROR: "Phản hồi chưa đúng định dạng. Hãy thử tải lại dữ liệu.",
    NETWORK_ERROR: "Chưa xác nhận được kết quả do kết nối. Thử lại sẽ dùng cùng mã yêu cầu.",
  }
  if (messages[code]) return messages[code]
  if (status === 401) return "Phiên đã hết hạn. Đăng nhập lại bằng cùng tài khoản để giữ bản nháp."
  if (status === 403) return "Phiên xác thực chưa hợp lệ. Đăng nhập lại trước khi tiếp tục."
  if (status === 404) return "Bản ghi không còn khả dụng. Hãy quay lại kho."
  if (status === 422) return "Thông tin chưa hợp lệ. Kiểm tra lượng, ngày và các trường đã nhập."
  if (status === 413) return "Ảnh quá lớn. Chọn ảnh không quá 5 MB."
  if (status === 415) return "Chọn ảnh JPEG, PNG hoặc WebP."
  if (status === 429) return "Quá nhiều yêu cầu. Hãy chờ rồi thử lại."
  return "Không thể hoàn thành yêu cầu. Bạn có thể thử lại hoặc nhập tay."
}

type CanonicalAttention = "past_date" | "due_today" | "soon" | "unknown" | "later" | "inactive"
export type EntryDTO = Omit<FoodEntry, "remaining_quantity" | "expiry_date_certainty" | "expiry_date_source" | "expiry_date_label_type" | "attention"> & {
  remaining_quantity: string
  date_certainty: "known" | "estimated" | "unknown"
  date_source: "printed_label" | "user_entered" | "user_estimate" | "unknown"
  date_label_type: "use_by" | "best_before" | "unspecified"
  attention: { status: CanonicalAttention; reason_code: string; as_of_date: string }
}
export type Page<T> = { items: T[]; pagination: { page: number; limit: number; total: number }; as_of_date?: string }
export type Command = Readonly<{ method: string; path: string; body?: string; key: string; owner: string }>
export type ScanCandidate = { expiry_date?: string | null; parsed_date?: string | null; food_name?: string | null; date_certainty?: string; certainty?: string; date_label_type?: string; raw_text?: string; source_text?: string; ambiguous?: boolean; alternatives?: string[] }
export type ScanResult = { candidates: ScanCandidate[]; raw_text: string; warnings: string[]; requires_confirmation: true }

const attentionMap: Record<CanonicalAttention, Attention | undefined> = { past_date: "past", due_today: "today", soon: "soon", unknown: "unknown", later: "later", inactive: undefined }
const contractError = () => new ApiError(502, "CONTRACT_ERROR")

export function decimal(value: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 999999999.999 || Math.abs(value * 1000 - Math.round(value * 1000)) > 0.001) throw new ApiError(422, "VALIDATION_ERROR")
  return value.toFixed(3).replace(/\.?0+$/, "") || "0"
}

export function fromEntry(dto: EntryDTO): FoodEntry {
  const quantity = Number(dto.remaining_quantity)
  if (typeof dto.id !== "string" || !dto.attention || !(dto.attention.status in attentionMap) || !Number.isFinite(quantity) || quantity < 0 || quantity > 999999999.999 || !["known", "estimated", "unknown"].includes(dto.date_certainty)) throw contractError()
  return {
    id: dto.id, name: dto.name, storage_location: dto.storage_location,
    remaining_quantity: quantity, unit: dto.unit, expiry_date: dto.expiry_date,
    expiry_date_certainty: dto.date_certainty === "known" ? "exact" : dto.date_certainty,
    expiry_date_source: dto.date_source === "printed_label" ? "package_label" : dto.date_source === "user_entered" ? "user_reentered" : dto.date_source === "user_estimate" ? "user_estimate" : null,
    expiry_date_label_type: dto.date_label_type === "unspecified" ? "unknown" : dto.date_label_type,
    opened_on: dto.opened_on, note: dto.note, version: dto.version, deleted_at: dto.deleted_at,
    created_at: dto.created_at, updated_at: dto.updated_at,
    attention: attentionMap[dto.attention.status], as_of_date: dto.attention.as_of_date, attention_reason: dto.attention.reason_code,
  }
}

export function draftDTO(draft: EntryDraft) {
  const unknown = draft.expiry_date_certainty === "unknown"
  return {
    name: draft.name, storage_location: draft.storage_location,
    expiry_date: unknown ? null : draft.expiry_date,
    date_certainty: draft.expiry_date_certainty === "exact" ? "known" : draft.expiry_date_certainty,
    date_source: unknown ? "unknown" : draft.expiry_date_certainty === "estimated" ? "user_estimate" : draft.expiry_date_source === "user_reentered" ? "user_entered" : "printed_label",
    date_label_type: unknown || !draft.expiry_date_label_type || draft.expiry_date_label_type === "unknown" ? "unspecified" : draft.expiry_date_label_type,
    opened_on: draft.opened_on, note: draft.note,
  }
}
export const createDTO = (draft: CreatePayload) => ({ ...draftDTO(draft), quantity: decimal(draft.initial_quantity), unit: draft.unit })

type MovementDTO = Omit<QuantityMovement, "kind" | "quantity_before" | "quantity_after"> & { kind: "initial" | "consume" | "discard" | "adjustment"; quantity_before: string; quantity_after: string }
export const fromMovement = (dto: MovementDTO): QuantityMovement => ({ ...dto, kind: dto.kind === "adjustment" ? "recount" : dto.kind, quantity_before: Number(dto.quantity_before), quantity_after: Number(dto.quantity_after) })

/** Each immutable command has one key and serialized body, including every retry. */
export function newCommand(owner: string, method: string, path: string, body?: unknown): Command {
  return Object.freeze({ owner, method, path, body: body === undefined ? undefined : JSON.stringify(body), key: crypto.randomUUID() })
}

export class ApiClient {
  csrf = ""
  transport: typeof fetch
  base: string
  constructor(transport: typeof fetch = fetch, base = "/api/v1") { this.transport = transport; this.base = base }
  async request<T>(path: string, init: RequestInit = {}, key?: string): Promise<T> {
    const headers = new Headers(init.headers)
    if (typeof init.body === "string") headers.set("Content-Type", "application/json")
    if (key) headers.set("Idempotency-Key", key)
    if (init.method && !["GET", "HEAD"].includes(init.method) && this.csrf) headers.set("X-CSRF-Token", this.csrf)
    let response: Response
    try { response = await this.transport(this.base + path, { ...init, headers, credentials: "include", cache: "no-store" }) }
    catch { throw new ApiError(0, "NETWORK_ERROR", true) }
    if (response.status === 204) return undefined as T
    let body: any
    try { body = await response.json() } catch { throw new ApiError(response.status, "CONTRACT_ERROR", response.ok || response.status >= 500) }
    if (!response.ok) {
      if (response.status === 401) this.csrf = ""
      throw new ApiError(response.status, body.code || "REQUEST_FAILED", response.status >= 500)
    }
    return body as T
  }
  async session() {
    const session = await this.request<Session>("/auth/session")
    if (!session.user?.id || !session.csrf_token) throw contractError()
    this.csrf = session.csrf_token
    return session
  }
  async authenticate(mode: "login" | "register", input: { email: string; password: string; display_name?: string }) {
    await this.request(`/auth/${mode}`, { method: "POST", body: JSON.stringify(input) })
    // Only the authenticated session read establishes the UI principal.
    return this.session()
  }
  async logout() { await this.request("/auth/logout", { method: "POST" }); this.csrf = "" }
  async execute<T>(command: Command): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try { return await this.request<T>(command.path, { method: command.method, body: command.body }, command.key) }
      catch (error) { if (!(error instanceof ApiError) || !error.uncertain || attempt >= 1) throw error }
    }
  }
  async entries(query: Record<string, string | number> = {}, trash = false) {
    const search = new URLSearchParams(Object.entries(query).map(([key, value]) => [key, String(value)]))
    const page = await this.request<Page<EntryDTO>>(`${trash ? "/trash/food-entries" : "/food-entries"}?${search}`)
    if (!Array.isArray(page.items) || !page.pagination) throw contractError()
    return { ...page, items: page.items.map(fromEntry) }
  }
  async allEntries(trash = false) {
    const items: FoodEntry[] = []
    let page = 1
    while (true) {
      const next = await this.entries(trash ? { page, limit: 100 } : { page, limit: 100, lifecycle: "all" }, trash)
      items.push(...next.items)
      if (page * next.pagination.limit >= next.pagination.total) return { items, as_of_date: next.as_of_date || next.items[0]?.as_of_date }
      if (!next.items.length || page >= 1000) throw contractError()
      page++
    }
  }
  async entry(id: string) { return fromEntry(await this.request<EntryDTO>(`/food-entries/${encodeURIComponent(id)}`)) }
  async history(id: string) {
    const items: QuantityMovement[] = []
    for (let page = 1; page <= 1000; page++) {
      const next = await this.request<Page<MovementDTO>>(`/food-entries/${encodeURIComponent(id)}/movements?page=${page}&limit=100`)
      if (!Array.isArray(next.items) || !next.pagination) throw contractError()
      items.push(...next.items.map(fromMovement))
      if (page * next.pagination.limit >= next.pagination.total) return items
      if (!next.items.length) throw contractError()
    }
    throw contractError()
  }
  preferences() { return this.request<Preferences>("/me/preferences") }
  async scan(file: File) {
    const body = new FormData(); body.append("image", file)
    const result = await this.request<ScanResult>("/scans", { method: "POST", body })
    if (result.requires_confirmation !== true || !Array.isArray(result.candidates)) throw contractError()
    return result
  }
}
