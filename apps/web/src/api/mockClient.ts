import {
  type ExpiryApiClient,
  type CreateEntryDTO,
  type EditEntryDTO,
  type MovementDTO,
  type RecountDTO,
  type UpdatePreferencesDTO,
  type MutationResult,
  type EntryPage,
  type ScanResult,
  ApiError,
} from "./client"
import { mockApi, localDay, attentionFor } from "../mockApi"
import type {
  FoodEntry,
  QuantityMovement,
  Preferences,
  Session,
  CreatePayload,
  EntryDraft,
} from "../domain/types"

export class MockApiClient implements ExpiryApiClient {
  async session(): Promise<Session> {
    return {
      user: {
        id: "usr_demo",
        email: "demo@expiry.app",
        display_name: mockApi.user.display_name || "Bạn (Demo)",
        timezone: mockApi.user.timezone,
        attention_lead_days: mockApi.user.attention_lead_days,
        version: mockApi.user.version,
      },
      csrf_token: "mock-csrf-token",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    }
  }

  async authenticate(
    _mode: "login" | "register",
    input: {
      email: string
      password: string
      display_name?: string
    },
  ): Promise<Session> {
    if (input.display_name) {
      mockApi.user.display_name = input.display_name
    }
    return this.session()
  }

  async logout(): Promise<void> {
    // In demo mode, logout is a no-op
  }

  async createEntry(
    draft: CreateEntryDTO,
    commandKey?: string,
  ): Promise<FoodEntry> {
    const key = commandKey ?? mockApi.createCommandKey("create")
    const payload: CreatePayload = {
      name: draft.name,
      initial_quantity: Number(draft.quantity),
      unit: draft.unit,
      storage_location:
        draft.storage_location === "unspecified"
          ? null
          : (draft.storage_location ?? null),
      expiry_date: draft.expiry_date ?? null,
      expiry_date_certainty:
        draft.date_certainty === "known" ? "exact" : draft.date_certainty,
      expiry_date_source: draft.date_source,
      expiry_date_label_type:
        draft.date_label_type === "unspecified" ? null : draft.date_label_type,
      opened_on: draft.opened_on ?? null,
      note: draft.note ?? null,
      barcode: draft.barcode ?? null,
      barcode_format: draft.barcode_format ?? null,
    }
    try {
      const result = mockApi.createEntry(key, payload)
      const asOfDate = localDay(new Date(), mockApi.user.timezone)
      return {
        ...result.data,
        attention: attentionFor(
          result.data,
          mockApi.user.attention_lead_days,
          asOfDate,
        ),
        as_of_date: asOfDate,
      }
    } catch (err: any) {
      throw new ApiError(err.status ?? 400, err.code ?? "VALIDATION_ERROR")
    }
  }

  async recordMovement(
    id: string,
    movement: MovementDTO,
    commandKey?: string,
  ): Promise<MutationResult> {
    const key = commandKey ?? mockApi.createCommandKey(movement.kind)
    try {
      const result = mockApi.recordMovement(
        key,
        id,
        movement.expected_version,
        movement.kind,
        Number(movement.amount),
        movement.reason ?? null,
      )
      const movements = mockApi.listMovements(id)
      const asOfDate = localDay(new Date(), mockApi.user.timezone)
      const entry: FoodEntry = {
        ...result.data,
        attention: attentionFor(
          result.data,
          mockApi.user.attention_lead_days,
          asOfDate,
        ),
        as_of_date: asOfDate,
      }
      return {
        entry,
        movement: movements[0] ?? null,
        changed: true,
      }
    } catch (err: any) {
      throw new ApiError(err.status ?? 409, err.code ?? "VERSION_CONFLICT")
    }
  }

  async recount(
    id: string,
    recount: RecountDTO,
    commandKey?: string,
  ): Promise<MutationResult> {
    const key = commandKey ?? mockApi.createCommandKey("recount")
    try {
      const result = mockApi.recount(
        key,
        id,
        recount.expected_version,
        Number(recount.actual_quantity),
        recount.reason,
      )
      const movements = mockApi.listMovements(id)
      const asOfDate = localDay(new Date(), mockApi.user.timezone)
      const entry: FoodEntry = {
        ...result.data,
        attention: attentionFor(
          result.data,
          mockApi.user.attention_lead_days,
          asOfDate,
        ),
        as_of_date: asOfDate,
      }
      return {
        entry,
        movement: movements[0] ?? null,
        changed: true,
      }
    } catch (err: any) {
      throw new ApiError(err.status ?? 409, err.code ?? "VERSION_CONFLICT")
    }
  }

  async updateEntry(
    id: string,
    patch: EditEntryDTO,
    commandKey?: string,
  ): Promise<FoodEntry> {
    const key = commandKey ?? mockApi.createCommandKey("update")
    const current = mockApi.getEntry(id)
    const draftPatch: EntryDraft = {
      name: patch.name ?? current.name,
      storage_location:
        patch.storage_location === "unspecified"
          ? null
          : (patch.storage_location ?? current.storage_location),
      expiry_date:
        patch.expiry_date !== undefined
          ? patch.expiry_date
          : current.expiry_date,
      expiry_date_certainty:
        patch.date_certainty === "known"
          ? "exact"
          : (patch.date_certainty ?? current.expiry_date_certainty),
      expiry_date_source: patch.date_source ?? current.expiry_date_source,
      expiry_date_label_type:
        patch.date_label_type === "unspecified"
          ? null
          : (patch.date_label_type ?? current.expiry_date_label_type),
      opened_on:
        patch.opened_on !== undefined ? patch.opened_on : current.opened_on,
      note: patch.note !== undefined ? patch.note : current.note,
      barcode: patch.barcode !== undefined ? patch.barcode : current.barcode,
      barcode_format:
        patch.barcode_format !== undefined
          ? patch.barcode_format
          : current.barcode_format,
    }
    try {
      const result = mockApi.updateEntry(
        key,
        id,
        patch.expected_version,
        draftPatch,
      )
      const asOfDate = localDay(new Date(), mockApi.user.timezone)
      return {
        ...result.data,
        attention: attentionFor(
          result.data,
          mockApi.user.attention_lead_days,
          asOfDate,
        ),
        as_of_date: asOfDate,
      }
    } catch (err: any) {
      throw new ApiError(err.status ?? 409, err.code ?? "VERSION_CONFLICT")
    }
  }

  async deleteEntry(
    id: string,
    expectedVersion: number,
    commandKey?: string,
  ): Promise<void> {
    const key = commandKey ?? mockApi.createCommandKey("delete")
    try {
      mockApi.deleteEntry(key, id, expectedVersion)
    } catch (err: any) {
      throw new ApiError(err.status ?? 409, err.code ?? "VERSION_CONFLICT")
    }
  }

  async restoreEntry(
    id: string,
    _expectedVersion: number,
    commandKey?: string,
  ): Promise<FoodEntry> {
    const key = commandKey ?? mockApi.createCommandKey("restore")
    try {
      const result = mockApi.restoreEntry(key, id)
      const asOfDate = localDay(new Date(), mockApi.user.timezone)
      return {
        ...result.data,
        attention: attentionFor(
          result.data,
          mockApi.user.attention_lead_days,
          asOfDate,
        ),
        as_of_date: asOfDate,
      }
    } catch (err: any) {
      throw new ApiError(err.status ?? 409, err.code ?? "VERSION_CONFLICT")
    }
  }

  async updatePreferences(
    prefs: UpdatePreferencesDTO,
    commandKey?: string,
  ): Promise<Preferences> {
    const key = commandKey ?? mockApi.createCommandKey("preferences")
    try {
      const res = mockApi.updatePreferences(key, prefs.expected_version, {
        timezone: prefs.timezone,
        attention_lead_days: prefs.attention_lead_days,
      })
      return res.data
    } catch (err: any) {
      throw new ApiError(err.status ?? 409, err.code ?? "VERSION_CONFLICT")
    }
  }

  async preferences(): Promise<Preferences> {
    return mockApi.getPreferences()
  }

  async entry(id: string): Promise<FoodEntry> {
    const e = mockApi.getEntry(id)
    const asOfDate = localDay(new Date(), mockApi.user.timezone)
    return {
      ...e,
      attention: attentionFor(e, mockApi.user.attention_lead_days, asOfDate),
      as_of_date: asOfDate,
    }
  }

  async history(id: string): Promise<QuantityMovement[]> {
    return mockApi.listMovements(id)
  }

  async allEntries(trash = false): Promise<{
    items: FoodEntry[]
    as_of_date?: string
  }> {
    const raw = trash ? mockApi.listTrash() : mockApi.listEntries()
    const asOfDate = localDay(new Date(), mockApi.user.timezone)
    return {
      items: raw.map((e) => ({
        ...e,
        attention: attentionFor(e, mockApi.user.attention_lead_days, asOfDate),
        as_of_date: asOfDate,
      })),
      as_of_date: asOfDate,
    }
  }

  async entries(
    _query: Record<string, string | number> = {},
    trash = false,
  ): Promise<EntryPage<FoodEntry>> {
    const raw = trash ? mockApi.listTrash() : mockApi.listEntries()
    const asOfDate = localDay(new Date(), mockApi.user.timezone)
    const items = raw.map((e) => ({
      ...e,
      attention: attentionFor(e, mockApi.user.attention_lead_days, asOfDate),
      as_of_date: asOfDate,
    }))
    return {
      items,
      pagination: {
        page: 1,
        limit: 100,
        total: items.length,
      },
      as_of_date: asOfDate,
    }
  }

  async scan(
    _file: File,
    _barcode?: string,
    _locale?: string,
  ): Promise<ScanResult> {
    return {
      candidates: {
        food_name: "Thực phẩm mẫu",
        expiry_date: {
          value: null,
          date_certainty: null,
          date_label_type: "unknown",
          source_text: "",
          alternatives: [],
          ambiguous: false,
          requires_confirmation: true,
        },
        manufactured_date: {
          value: null,
          source_text: "",
        },
      },
      raw_text: "",
      warnings: [],
      errors: [],
      requires_confirmation: true,
    }
  }
}
