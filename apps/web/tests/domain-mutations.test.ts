import { describe, it, expect } from "vitest"

import {
  errorMessage,
  createDTO,
  draftDTO,
  decimal,
  ApiClient,
  ApiError,
  newCommand,
} from "../src/api/client"

import type { EntryDTO, MutationResultDTO } from "../src/api/client"

import type { CreatePayload, EntryDraft } from "../src/domain/types"

const entryResponse: EntryDTO = {
  id: "00000000-0000-4000-8000-000000000001",

  name: "Milk",

  storage_location: "unspecified",

  remaining_quantity: "1.000",

  unit: "g",

  expiry_date: null,

  date_certainty: "unknown",

  date_source: "unknown",

  date_label_type: "unspecified",

  opened_on: null,

  note: null,

  version: 2,

  deleted_at: null,

  created_at: "2026-10-21T00:00:00.000Z",

  updated_at: "2026-10-21T00:00:00.000Z",

  attention: {
    status: "unknown",

    reason_code: "RECORDED_DATE_UNKNOWN",

    as_of_date: "2026-10-21",
  },
}

const mutationResponse: MutationResultDTO = {
  entry: entryResponse,

  movement: {
    id: "00000000-0000-4000-8000-000000000002",

    entry_id: entryResponse.id,

    kind: "consume",

    quantity_before: "2.000",

    quantity_after: "1.000",

    reason: null,

    recorded_at: "2026-10-21T00:00:00.000Z",
  },

  changed: true,
}

describe("Domain Error Message Translations", () => {
  it("translates VERSION_CONFLICT to Vietnamese data changed advisory", () => {
    const msg = errorMessage(409, "VERSION_CONFLICT")

    expect(msg).toBe(
      "Dữ liệu vừa thay đổi. Xem lại lượng và xác nhận một thao tác mới.",
    )
  })

  it("translates CONCURRENT_MODIFICATION to same Vietnamese advisory", () => {
    const msg = errorMessage(409, "CONCURRENT_MODIFICATION")

    expect(msg).toBe(
      "Dữ liệu vừa thay đổi. Xem lại lượng và xác nhận một thao tác mới.",
    )
  })

  it("translates INSUFFICIENT_QUANTITY to Vietnamese stock insufficiency warning under both 409 and 422", () => {
    expect(errorMessage(409, "INSUFFICIENT_QUANTITY")).toBe(
      "Lượng hiện tại không đủ. Kiểm tra lại trước khi xác nhận.",
    )

    expect(errorMessage(422, "INSUFFICIENT_QUANTITY")).toBe(
      "Lượng hiện tại không đủ. Kiểm tra lại trước khi xác nhận.",
    )
  })
})

describe("Domain Mutation DTO and ApiClient Methods", () => {
  it("formats createDTO with decimal quantity and metadata", () => {
    const payload: CreatePayload = {
      name: "Trứng gà",

      storage_location: "Ngăn mát",

      initial_quantity: 10,

      unit: "piece",

      expiry_date: "2026-11-01",

      expiry_date_certainty: "exact",

      expiry_date_source: "printed_label",

      expiry_date_label_type: "use_by",

      opened_on: null,

      note: "Hộp 10 quả",
    }

    const dto = createDTO(payload)

    expect(dto.name).toBe("Trứng gà")

    expect(dto.quantity).toBe("10")

    expect(dto.unit).toBe("piece")

    expect(dto.storage_location).toBe("Ngăn mát")

    expect(dto.date_certainty).toBe("known")

    expect(dto.date_source).toBe("printed_label")

    expect(dto.date_label_type).toBe("use_by")
  })

  it("formats draftDTO correctly for PATCH edit mutation", () => {
    const patch: EntryDraft = {
      name: "Sữa chua nếp cẩm",

      storage_location: "Tủ lạnh",

      expiry_date: "2026-10-30",

      expiry_date_certainty: "estimated",

      expiry_date_source: "user_estimate",

      expiry_date_label_type: "best_before",

      opened_on: "2026-10-20",

      note: "Đã mở 1 hộp",
    }

    const dto = draftDTO(patch)

    expect(dto.name).toBe("Sữa chua nếp cẩm")

    expect(dto.storage_location).toBe("Tủ lạnh")

    expect(dto.date_certainty).toBe("estimated")

    expect(dto.date_source).toBe("user_estimate")

    expect(dto.date_label_type).toBe("best_before")

    expect(dto.opened_on).toBe("2026-10-20")

    expect(dto.note).toBe("Đã mở 1 hộp")
  })

  it("preserves canonical user_entered source in draftDTO", () => {
    const draft: EntryDraft = {
      name: "Sữa",

      storage_location: null,

      expiry_date: "2026-10-30",

      expiry_date_certainty: "exact",

      expiry_date_source: "user_entered",

      expiry_date_label_type: "use_by",

      opened_on: null,

      note: null,
    }

    expect(draftDTO(draft).date_source).toBe("user_entered")
  })

  it("serializes decimal quantities according to API validation constraints", () => {
    expect(decimal(1)).toBe("1")

    expect(decimal(1.5)).toBe("1.5")

    expect(decimal(0.125)).toBe("0.125")

    expect(decimal(100.2)).toBe("100.2")

    expect(() => decimal(-1)).toThrow(ApiError)

    expect(() => decimal(1.0001)).toThrow(ApiError)
  })

  it("routes typed mutations, serializes DTOs, and sends CSRF and idempotency headers", async () => {
    const responses: Array<{
      body?: unknown

      status: number
    }> = [
      { body: entryResponse, status: 201 },

      { body: mutationResponse, status: 201 },

      { body: mutationResponse, status: 201 },

      { body: entryResponse, status: 200 },

      { status: 204 },

      { body: entryResponse, status: 200 },

      {
        body: {
          timezone: "Asia/Ho_Chi_Minh",

          attention_lead_days: 2,

          version: 3,
        },

        status: 200,
      },
    ]

    const calls: Array<{
      url: string

      init: RequestInit
    }> = []

    let responseIndex = 0

    const client = new ApiClient(
      async (input, init = {}) => {
        calls.push({ url: String(input), init })

        const response = responses[responseIndex++]

        if (response.status === 204) return new Response(null, { status: 204 })

        return new Response(JSON.stringify(response.body), {
          status: response.status,

          headers: { "Content-Type": "application/json" },
        })
      },

      "/api/v1",

      1000,
    )

    client.csrf = "csrf-token"

    const payload: CreatePayload = {
      name: "Trứng gà",

      storage_location: "Ngăn mát",

      initial_quantity: 10,

      unit: "piece",

      expiry_date: "2026-11-01",

      expiry_date_certainty: "exact",

      expiry_date_source: "printed_label",

      expiry_date_label_type: "use_by",

      opened_on: null,

      note: "Hộp 10 quả",
    }

    const createBody = createDTO(payload)

    const created = await client.createEntry(createBody)

    const movementBody = {
      expected_version: 2,

      kind: "consume" as const,

      amount: "1",

      reason: "Ăn một quả",
    }

    const movement = await client.recordMovement("entry/1", movementBody)

    const recountBody = {
      expected_version: 2,

      actual_quantity: "3",

      reason: "Kiểm kê",
    }

    await client.recount("entry/1", recountBody)

    const draft: EntryDraft = {
      name: "Sữa",

      storage_location: "Tủ lạnh",

      expiry_date: null,

      expiry_date_certainty: "unknown",

      expiry_date_source: null,

      expiry_date_label_type: null,

      opened_on: null,

      note: null,
    }

    const editBody = { expected_version: 2, ...draftDTO(draft) }

    await client.updateEntry("entry/1", editBody)

    await client.deleteEntry("entry/1", 3)

    await client.restoreEntry("entry/1", 4)

    const preferencesBody = {
      expected_version: 2,

      timezone: "Asia/Ho_Chi_Minh",

      attention_lead_days: 2,
    }

    const preferences = await client.updatePreferences(preferencesBody)

    expect(created.remaining_quantity).toBe(1)

    expect(movement.entry.id).toBe(entryResponse.id)

    expect(movement.movement?.quantity_after).toBe(1)

    expect(preferences.version).toBe(3)

    expect(calls.map((call) => call.url)).toEqual([
      "/api/v1/food-entries",

      "/api/v1/food-entries/entry%2F1/movements",

      "/api/v1/food-entries/entry%2F1/recounts",

      "/api/v1/food-entries/entry%2F1",

      "/api/v1/food-entries/entry%2F1?expected_version=3",

      "/api/v1/food-entries/entry%2F1/restore",

      "/api/v1/me/preferences",
    ])

    expect(calls.map((call) => call.init.method)).toEqual([
      "POST",

      "POST",

      "POST",

      "PATCH",

      "DELETE",

      "POST",

      "PATCH",
    ])

    expect(JSON.parse(calls[0].init.body as string)).toEqual(createBody)

    expect(JSON.parse(calls[1].init.body as string)).toEqual(movementBody)

    expect(JSON.parse(calls[2].init.body as string)).toEqual(recountBody)

    expect(JSON.parse(calls[3].init.body as string)).toEqual(editBody)

    expect(calls[4].init.body).toBeUndefined()

    expect(JSON.parse(calls[5].init.body as string)).toEqual({
      expected_version: 4,
    })

    expect(JSON.parse(calls[6].init.body as string)).toEqual(preferencesBody)

    for (const call of calls) {
      const headers = new Headers(call.init.headers)

      expect(headers.get("Idempotency-Key")).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )

      expect(headers.get("X-CSRF-Token")).toBe("csrf-token")
    }

    expect(new Headers(calls[0].init.headers).get("Content-Type")).toBe(
      "application/json",
    )

    expect(new Headers(calls[4].init.headers).get("Content-Type")).toBeNull()
  })

  it("retries uncertain mutations with the same caller-provided key", async () => {
    const keys: string[] = []

    let calls = 0

    const client = new ApiClient(
      async (_url, init) => {
        keys.push(new Headers(init?.headers).get("Idempotency-Key") ?? "")

        calls++

        if (calls === 1) throw new TypeError("network unavailable")

        return new Response(JSON.stringify(entryResponse), {
          status: 201,

          headers: { "Content-Type": "application/json" },
        })
      },

      "/api/v1",

      1000,
    )

    await client.createEntry(
      createDTO({
        name: "Milk",

        storage_location: null,

        initial_quantity: 1,

        unit: "g",

        expiry_date: null,

        expiry_date_certainty: "unknown",

        expiry_date_source: null,

        expiry_date_label_type: null,

        opened_on: null,

        note: null,
      }),

      "stable-command-key",
    )

    expect(keys).toEqual(["stable-command-key", "stable-command-key"])
  })

  it("formats consume and discard movement commands with ledger consistency parameters", () => {
    const owner = "owner-movement-test"

    const id = "food-entry-uuid-555"

    const expectedVersion = 3

    const amount = 250

    const reason = "Nấu bữa tối"

    const consumeCmd = newCommand(
      owner,
      "POST",
      `/food-entries/${id}/movements`,
      {
        expected_version: expectedVersion,

        kind: "consume",

        amount: decimal(amount),

        reason,
      },
    )

    expect(consumeCmd.owner).toBe(owner)

    expect(consumeCmd.method).toBe("POST")

    expect(consumeCmd.path).toBe(`/food-entries/${id}/movements`)

    expect(JSON.parse(consumeCmd.body!)).toEqual({
      expected_version: 3,

      kind: "consume",

      amount: "250",

      reason: "Nấu bữa tối",
    })

    const discardCmd = newCommand(
      owner,
      "POST",
      `/food-entries/${id}/movements`,
      {
        expected_version: expectedVersion + 1,

        kind: "discard",

        amount: decimal(100),

        reason: "Hỏng mốc",
      },
    )

    expect(discardCmd.method).toBe("POST")

    expect(JSON.parse(discardCmd.body!)).toEqual({
      expected_version: 4,

      kind: "discard",

      amount: "100",

      reason: "Hỏng mốc",
    })
  })

  it("calculates quick half choice and preview balance after deducting quantity delta", () => {
    // Decimal unit (e.g., grams)

    const initialGrams = 750

    const halfGrams = +(initialGrams / 2).toFixed(3)

    expect(halfGrams).toBe(375)

    const afterConsumeGrams = +(initialGrams - halfGrams).toFixed(3)

    expect(afterConsumeGrams).toBe(375)

    // Discrete unit (piece)

    const initialPieces = 7

    const halfPieces = Math.floor(initialPieces / 2)

    expect(halfPieces).toBe(3)

    const afterConsumePieces = initialPieces - halfPieces

    expect(afterConsumePieces).toBe(4)

    // Complete depletion

    const afterDepleted = +(initialGrams - initialGrams).toFixed(3)

    expect(afterDepleted).toBe(0)
  })
})
