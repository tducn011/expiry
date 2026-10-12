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
  })

  it("formats timestamps into localized datetime strings", () => {
    const formatted = fmtTime("2026-10-12T07:00:00Z", "UTC")
    expect(formatted).toContain("12/10/2026")
  })
})
