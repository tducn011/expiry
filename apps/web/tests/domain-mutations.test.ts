import { describe, it, expect } from "vitest"
import {
  errorMessage,
  newCommand,
  createDTO,
  draftDTO,
  decimal,
  ApiClient,
  ApiError,
} from "../src/api/client"
import type { CreatePayload, EntryDraft } from "../src/domain/types"

describe("Domain Error Message Translations", () => {
  it("translates VERSION_CONFLICT to Vietnamese data changed advisory", () => {
    const msg = errorMessage(409, "VERSION_CONFLICT")
    expect(msg).toBe("Dữ liệu vừa thay đổi. Xem lại lượng và xác nhận một thao tác mới.")
  })

  it("translates CONCURRENT_MODIFICATION to same Vietnamese advisory", () => {
    const msg = errorMessage(409, "CONCURRENT_MODIFICATION")
    expect(msg).toBe("Dữ liệu vừa thay đổi. Xem lại lượng và xác nhận một thao tác mới.")
  })

  it("translates INSUFFICIENT_QUANTITY to Vietnamese stock insufficiency warning under both 409 and 422", () => {
    expect(errorMessage(409, "INSUFFICIENT_QUANTITY")).toBe("Lượng hiện tại không đủ. Kiểm tra lại trước khi xác nhận.")
    expect(errorMessage(422, "INSUFFICIENT_QUANTITY")).toBe("Lượng hiện tại không đủ. Kiểm tra lại trước khi xác nhận.")
  })
})

describe("Domain Mutation DTO and Command Construction", () => {
  it("generates immutable commands with unique UUID idempotency key", () => {
    const cmd1 = newCommand("owner-123", "POST", "/food-entries", { name: "Milk" })
    const cmd2 = newCommand("owner-123", "POST", "/food-entries", { name: "Milk" })

    expect(cmd1.owner).toBe("owner-123")
    expect(cmd1.method).toBe("POST")
    expect(cmd1.path).toBe("/food-entries")
    expect(JSON.parse(cmd1.body!)).toEqual({ name: "Milk" })
    expect(cmd1.key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
    expect(cmd1.key).not.toBe(cmd2.key)
    expect(Object.isFrozen(cmd1)).toBe(true)
  })

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

  it("delivers Idempotency-Key header on mutation requests via ApiClient", async () => {
    let capturedHeaders: Headers | undefined
    const client = new ApiClient(
      async (_url, init) => {
        capturedHeaders = new Headers(init?.headers)
        return new Response(JSON.stringify({ ok: true, version: 2 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      },
      "/api/v1",
      1000,
    )

    const cmd = newCommand("user-1", "POST", "/food-entries/123/movements", {
      expected_version: 1,
      kind: "consume",
      amount: "200",
      reason: "Nấu ăn",
    })

    const res = await client.execute<{ ok: boolean; version: number }>(cmd)
    expect(res.ok).toBe(true)
    expect(res.version).toBe(2)
    expect(capturedHeaders?.get("Idempotency-Key")).toBe(cmd.key)
    expect(capturedHeaders?.get("Content-Type")).toBe("application/json")
  })

  it("formats soft-delete command with expected_version query parameter", () => {
    const owner = "owner-trash-test"
    const id = "food-entry-uuid-999"
    const expectedVersion = 3

    const cmd = newCommand(
      owner,
      "DELETE",
      `/food-entries/${id}?expected_version=${expectedVersion}`,
    )

    expect(cmd.owner).toBe(owner)
    expect(cmd.method).toBe("DELETE")
    expect(cmd.path).toBe(`/food-entries/${id}?expected_version=3`)
    expect(cmd.body).toBeUndefined()
    expect(cmd.key).toBeDefined()
  })

  it("formats restore command with expected_version JSON payload", () => {
    const owner = "owner-restore-test"
    const id = "food-entry-uuid-888"
    const expectedVersion = 4

    const cmd = newCommand(owner, "POST", `/food-entries/${id}/restore`, {
      expected_version: expectedVersion,
    })

    expect(cmd.owner).toBe(owner)
    expect(cmd.method).toBe("POST")
    expect(cmd.path).toBe(`/food-entries/${id}/restore`)
    expect(JSON.parse(cmd.body!)).toEqual({ expected_version: 4 })
    expect(cmd.key).toBeDefined()
  })

  it("formats recount command with expected_version, actual_quantity, and reason", () => {
    const owner = "owner-recount-test"
    const id = "food-entry-uuid-777"
    const expectedVersion = 2
    const actualQuantity = 350
    const reason = "Cân lại thực tế trong tủ"

    const cmd = newCommand(owner, "POST", `/food-entries/${id}/recounts`, {
      expected_version: expectedVersion,
      actual_quantity: decimal(actualQuantity),
      reason: reason.trim(),
    })

    expect(cmd.owner).toBe(owner)
    expect(cmd.method).toBe("POST")
    expect(cmd.path).toBe(`/food-entries/${id}/recounts`)
    expect(JSON.parse(cmd.body!)).toEqual({
      expected_version: 2,
      actual_quantity: "350",
      reason: "Cân lại thực tế trong tủ",
    })
    expect(cmd.key).toBeDefined()
  })

  it("formats consume and discard movement commands with ledger consistency parameters", () => {
    const owner = "owner-movement-test"
    const id = "food-entry-uuid-555"
    const expectedVersion = 3
    const amount = 250
    const reason = "Nấu bữa tối"

    const consumeCmd = newCommand(owner, "POST", `/food-entries/${id}/movements`, {
      expected_version: expectedVersion,
      kind: "consume",
      amount: decimal(amount),
      reason,
    })

    expect(consumeCmd.owner).toBe(owner)
    expect(consumeCmd.method).toBe("POST")
    expect(consumeCmd.path).toBe(`/food-entries/${id}/movements`)
    expect(JSON.parse(consumeCmd.body!)).toEqual({
      expected_version: 3,
      kind: "consume",
      amount: "250",
      reason: "Nấu bữa tối",
    })

    const discardCmd = newCommand(owner, "POST", `/food-entries/${id}/movements`, {
      expected_version: expectedVersion + 1,
      kind: "discard",
      amount: decimal(100),
      reason: "Hỏng mốc",
    })

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
