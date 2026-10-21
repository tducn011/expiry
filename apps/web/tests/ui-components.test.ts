import { describe, it, expect } from "vitest"

import {
  unitLabel,
  certaintyLabel,
  sourceLabel,
  labelTypeLabel,
  movementLabel,
  attentionLabel,
  attentionGuidance,
  fmtQty,
  fmtDate,
  fmtTime,
} from "../src/lib/format"

describe("UI Domain Formatting & Helpers", () => {
  it("formats Vietnamese unit labels accurately", () => {
    expect(unitLabel.piece).toBe("cái")

    expect(unitLabel.g).toBe("g")

    expect(unitLabel.ml).toBe("ml")
  })

  it("formats date certainty labels accurately", () => {
    expect(certaintyLabel.exact).toBe("Chính xác")

    expect(certaintyLabel.estimated).toBe("Ước tính")

    expect(certaintyLabel.unknown).toBe("Chưa rõ")
  })

  it("formats every canonical date source label", () => {
    expect(sourceLabel.printed_label).toBe("Bao bì")

    expect(sourceLabel.user_entered).toBe("Nhập lại")

    expect(sourceLabel.user_estimate).toBe("Ước tính")

    expect(sourceLabel.unknown).toBe("Chưa rõ")
  })

  it("formats movement audit labels accurately", () => {
    expect(movementLabel.initial).toBe("Ban đầu")

    expect(movementLabel.consume).toBe("Đã dùng")

    expect(movementLabel.discard).toBe("Đã bỏ")

    expect(movementLabel.recount).toBe("Kiểm lại")
  })

  it("formats urgency attention labels accurately", () => {
    expect(attentionLabel.today).toBe("Đến ngày hôm nay")

    expect(attentionLabel.soon).toBe("Sắp đến ngày")

    expect(attentionLabel.past).toBe("Đã qua ngày")

    expect(attentionGuidance.today.title).toBe("Đến ngày bạn ghi")
  })

  it("formats decimal quantities with vi-VN conventions", () => {
    expect(fmtQty(1.5)).toBe("1,5")

    expect(fmtQty(2)).toBe("2")

    expect(fmtQty(0.25)).toBe("0,25")
  })

  it("formats ISO date into Vietnamese DD/MM/YYYY", () => {
    expect(fmtDate(null)).toBe("")

    expect(fmtDate("2026-10-15")).toBe("15/10/2026")

    expect(fmtDate("2026-10-20T00:00:00.000Z")).toBe("20/10/2026")
  })

  it("formats timestamps into localized datetime strings", () => {
    const formatted = fmtTime("2026-10-12T07:00:00Z", "UTC")

    expect(formatted).toContain("12/10/2026")
  })

  it("normalizes SQL timestamps with microseconds before formatting", () => {
    const formatted = fmtTime("2026-10-20 15:30:00.123456", "UTC")

    expect(formatted).toContain("20/10/2026")

    expect(formatted).toContain("15:30")
  })

  it("returns an empty string for invalid timestamps", () => {
    expect(() => fmtTime("not-a-timestamp")).not.toThrow()

    expect(fmtTime("not-a-timestamp")).toBe("")
  })
})

describe("Scanner UI Adapter (scanToEntryDraft)", () => {
  const baseResult: import("../src/api/client").ScanResult = {
    raw_text: "YOGURT\nEXP 2026-12-31",

    candidates: {
      food_name: "Yogurt",

      expiry_date: {
        value: "2026-12-31",

        date_certainty: "exact",

        date_label_type: "use_by",

        source_text: "2026-12-31",

        alternatives: [],

        ambiguous: false,

        requires_confirmation: true,
      },

      manufactured_date: {
        value: null,

        source_text: "",
      },
    },

    warnings: [],

    errors: [],

    requires_confirmation: true,
  }

  it("projects exact un-ambiguous expiry date into printed_label metadata", async () => {
    const { scanToEntryDraft } = await import("../src/api/client")

    const draft = scanToEntryDraft(baseResult, "2026-12-31")

    expect(draft.name).toBe("Yogurt")

    expect(draft.expiry_date).toBe("2026-12-31")

    expect(draft.expiry_date_certainty).toBe("exact")

    expect(draft.expiry_date_source).toBe("printed_label")

    expect(draft.expiry_date_label_type).toBe("use_by")
  })

  it("projects ambiguous date into user_estimate metadata when confirmed", async () => {
    const { scanToEntryDraft } = await import("../src/api/client")

    const ambiguousResult: typeof baseResult = {
      ...baseResult,

      candidates: {
        ...baseResult.candidates,

        expiry_date: {
          ...baseResult.candidates.expiry_date,

          value: null,

          ambiguous: true,

          alternatives: ["2026-06-05", "2026-05-06"],
        },
      },
    }

    const draft = scanToEntryDraft(ambiguousResult, "2026-06-05")

    expect(draft.expiry_date).toBe("2026-06-05")

    expect(draft.expiry_date_certainty).toBe("estimated")

    expect(draft.expiry_date_source).toBe("user_estimate")
  })

  it("never allows manufactured date to become expiry date", async () => {
    const { scanToEntryDraft } = await import("../src/api/client")

    const mfgResult: typeof baseResult = {
      ...baseResult,

      candidates: {
        ...baseResult.candidates,

        expiry_date: {
          ...baseResult.candidates.expiry_date,

          value: "2026-03-01",

          date_label_type: "manufactured",
        },
      },
    }

    const draft = scanToEntryDraft(mfgResult, "2026-03-01")

    expect(draft.expiry_date).toBeNull()

    expect(draft.expiry_date_certainty).toBe("unknown")

    expect(draft.expiry_date_source).toBeNull()
  })
})

describe("Food Item Detail Provenance & History Navigation (CAP-03)", () => {
  it("computes signed deltas and before/after balances across 3 sequential stock movements", () => {
    const movements: import("../src/domain/types").QuantityMovement[] = [
      {
        id: "mov-1",

        entry_id: "food-1",

        kind: "initial",

        quantity_before: 0,

        quantity_after: 1000,

        reason: null,

        recorded_at: "2026-10-01T10:00:00Z",
      },

      {
        id: "mov-2",

        entry_id: "food-1",

        kind: "consume",

        quantity_before: 1000,

        quantity_after: 600,

        reason: "Nấu bữa trưa",

        recorded_at: "2026-10-02T12:00:00Z",
      },

      {
        id: "mov-3",

        entry_id: "food-1",

        kind: "recount",

        quantity_before: 600,

        quantity_after: 550,

        reason: "Cân lại thực tế",

        recorded_at: "2026-10-03T09:00:00Z",
      },
    ]

    const processed = movements.map((m) => {
      const delta = +(m.quantity_after - m.quantity_before).toFixed(3)

      const deltaStr = `${delta > 0 ? "+" : ""}${fmtQty(delta)} g`

      const transitionStr = `${fmtQty(m.quantity_before)} → ${fmtQty(m.quantity_after)} g`

      return {
        id: m.id,

        kindLabel: movementLabel[m.kind],

        delta,

        deltaStr,

        transitionStr,
      }
    })

    expect(processed).toHaveLength(3)

    // Event 1: Initial capture (+1000 g)

    expect(processed[0].kindLabel).toBe("Ban đầu")

    expect(processed[0].delta).toBe(1000)

    expect(processed[0].deltaStr).toBe("+1.000 g")

    expect(processed[0].transitionStr).toBe("0 → 1.000 g")

    // Event 2: Consumption (-400 g)

    expect(processed[1].kindLabel).toBe("Đã dùng")

    expect(processed[1].delta).toBe(-400)

    expect(processed[1].deltaStr).toBe("-400 g")

    expect(processed[1].transitionStr).toBe("1.000 → 600 g")

    // Event 3: Recount adjustment (-50 g)

    expect(processed[2].kindLabel).toBe("Kiểm lại")

    expect(processed[2].delta).toBe(-50)

    expect(processed[2].deltaStr).toBe("-50 g")

    expect(processed[2].transitionStr).toBe("600 → 550 g")
  })

  it("assembles complete provenance facts including barcode and date classifications", () => {
    const food: import("../src/domain/types").FoodEntry = {
      id: "food-99",

      name: "Sữa chua Hy Lạp",

      storage_location: "Ngăn mát",

      remaining_quantity: 450,

      unit: "g",

      expiry_date: "2026-11-15",

      expiry_date_certainty: "exact",

      expiry_date_source: "printed_label",

      expiry_date_label_type: "use_by",

      opened_on: "2026-10-20",

      note: "Hộp 500g đã dùng 50g",

      barcode: "8934567890123",

      version: 2,

      deleted_at: null,

      created_at: "2026-10-20T08:00:00Z",

      updated_at: "2026-10-20T08:30:00Z",
    }

    const facts: [string, string, string?][] = [
      ["Vị trí lưu trữ", food.storage_location || "Chưa chọn vị trí"],

      ...(food.opened_on
        ? [["Ngày mở bao bì", fmtDate(food.opened_on)] as [string, string]]
        : []),

      ...(food.expiry_date_label_type &&
      food.expiry_date_label_type !== "unknown"
        ? [
            [
              "Loại nhãn ngày",
              labelTypeLabel[food.expiry_date_label_type],
            ] as [string, string],
          ]
        : []),

      ...(food.expiry_date_source
        ? [
            [
              "Nguồn ngày",
              sourceLabel[food.expiry_date_source],
            ] as [string, string],
          ]
        : []),

      ...(food.barcode ? [["Mã vạch", food.barcode] as [string, string]] : []),

      ...(food.note ? [["Ghi chú", food.note] as [string, string]] : []),
    ]

    expect(facts).toEqual([
      ["Vị trí lưu trữ", "Ngăn mát"],

      ["Ngày mở bao bì", "20/10/2026"],

      ["Loại nhãn ngày", "Hạn dùng"],

      ["Nguồn ngày", "Bao bì"],

      ["Mã vạch", "8934567890123"],

      ["Ghi chú", "Hộp 500g đã dùng 50g"],
    ])
  })
})
