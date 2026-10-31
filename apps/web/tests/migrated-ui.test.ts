import { describe, it, expect } from "vitest"

import {
  seedFoods,
  seedHistory,
  statusOf,
  daysLeft,
  attention,
  notifications,
  trashDaysLeft,
  formatDate,
  today,
  addDays,
  type State,
  type Food,
} from "../src/store/appStore"

import { getFoodIcon } from "../src/features/FoodCard"

import { validate, emptyDraft, type Draft } from "../src/features/FoodForm"

import {
  CupSoda,
  Milk,
  Egg,
  Beef,
  Drumstick,
  LeafyGreen,
  Carrot,
  Apple,
  Croissant,
  Wheat,
  Package,
} from "../src/components/ui/Icon"

import {
  computeStatusOf,
  computeStatusText,
} from "../src/components/ui/StatusBadge"

describe("Migrated App Store & Domain Rules", () => {
  it("seeds 10 initial demo foods with correct attributes", () => {
    const foods = seedFoods()

    expect(foods).toHaveLength(10)

    expect(foods[0].name).toBe("Sữa tươi")

    expect(foods[0].quantity).toBe(1)

    expect(foods[0].unit).toBe("hộp")

    expect(foods.some((f) => f.name === "Rau cải")).toBe(true)

    expect(foods.some((f) => f.name === "Gạo")).toBe(true)
  })

  it("seeds initial demo history events", () => {
    const history = seedHistory()

    expect(history.length).toBeGreaterThan(0)

    expect(history.some((h) => h.kind === "consume")).toBe(true)

    expect(history.some((h) => h.kind === "discard")).toBe(true)
  })

  it("computes status accurately according to Vietnam calendar date", () => {
    const t = today()

    const expiredFood: Food = {
      id: "f1",

      name: "Món quá hạn",

      quantity: 1,

      unit: "cái",

      expDate: addDays(t, -2),

      createdAt: new Date().toISOString(),
    }

    const soonFood: Food = {
      id: "f2",

      name: "Món sắp hết",

      quantity: 1,

      unit: "cái",

      expDate: addDays(t, 2),

      createdAt: new Date().toISOString(),
    }

    const okFood: Food = {
      id: "f3",

      name: "Món còn lâu",

      quantity: 1,

      unit: "cái",

      expDate: addDays(t, 15),

      createdAt: new Date().toISOString(),
    }

    const unknownFood: Food = {
      id: "f4",

      name: "Món chưa rõ",

      quantity: 1,

      unit: "cái",

      createdAt: new Date().toISOString(),
    }

    expect(statusOf(expiredFood, 3)).toBe("expired")

    expect(statusOf(soonFood, 3)).toBe("soon")

    expect(statusOf(okFood, 3)).toBe("ok")

    expect(statusOf(unknownFood, 3)).toBe("unknown")

    expect(daysLeft(expiredFood)).toBe(-2)

    expect(daysLeft(soonFood)).toBe(2)

    expect(daysLeft(okFood)).toBe(15)

    expect(daysLeft(unknownFood)).toBeNull()
  })

  it("filters and sorts attention items with overdue first", () => {
    const t = today()

    const mockState: State = {
      mode: "demo",

      onboarded: true,

      foods: [
        {
          id: "1",

          name: "An toàn",

          quantity: 1,

          unit: "cái",

          expDate: addDays(t, 20),

          createdAt: "",
        },

        {
          id: "2",

          name: "Sắp hết",

          quantity: 1,

          unit: "cái",

          expDate: addDays(t, 1),

          createdAt: "",
        },

        {
          id: "3",

          name: "Quá hạn",

          quantity: 1,

          unit: "cái",

          expDate: addDays(t, -3),

          createdAt: "",
        },
      ],

      history: [],

      locations: [],

      readNotifs: [],

      snoozed: {},

      settings: { remindDays: 3, inApp: true, push: false },
    }

    const attn = attention(mockState)

    expect(attn).toHaveLength(2)

    expect(attn[0].name).toBe("Quá hạn")

    expect(attn[1].name).toBe("Sắp hết")
  })

  it("computes trash retention countdown correctly within 30 days", () => {
    const freshTrash: Food = {
      id: "t1",

      name: "Mới xóa",

      quantity: 1,

      unit: "cái",

      deletedAt: new Date().toISOString(),

      createdAt: "",
    }

    expect(trashDaysLeft(freshTrash)).toBe(30)

    const oldTrashDate = new Date(Date.now() - 10 * 864e5).toISOString()

    const oldTrash: Food = {
      id: "t2",

      name: "Đã xóa 10 ngày trước",

      quantity: 1,

      unit: "cái",

      deletedAt: oldTrashDate,

      createdAt: "",
    }

    expect(trashDaysLeft(oldTrash)).toBe(20)
  })

  it("formats dates into Vietnamese DD/MM/YYYY format", () => {
    expect(formatDate("2026-10-24")).toBe("24/10/2026")

    expect(formatDate("2026-01-05")).toBe("05/01/2026")

    expect(formatDate("")).toBe("")
  })
})

describe("Food Category Icon Detection", () => {
  it("resolves food categories to specific contextual icons", () => {
    expect(getFoodIcon("Sữa chua nha đam")).toBe(CupSoda)

    expect(getFoodIcon("Sữa tươi tiệt trùng")).toBe(Milk)

    expect(getFoodIcon("Phô mai lát")).toBe(Milk)

    expect(getFoodIcon("Trứng gà công nghiệp")).toBe(Egg)

    expect(getFoodIcon("Thịt bò xào")).toBe(Beef)

    expect(getFoodIcon("Thịt gà luộc")).toBe(Drumstick)

    expect(getFoodIcon("Rau cải ngọt")).toBe(LeafyGreen)

    expect(getFoodIcon("Cà rốt Đà Lạt")).toBe(Carrot)

    expect(getFoodIcon("Táo đỏ")).toBe(Apple)

    expect(getFoodIcon("Bánh mì gối")).toBe(Croissant)

    expect(getFoodIcon("Gạo thơm Lài")).toBe(Wheat)

    expect(getFoodIcon("Gói bột nêm Knorr")).toBe(Wheat)

    expect(getFoodIcon("Muối tinh")).toBe(Package)
  })
})

describe("Food Form Validation", () => {
  it("creates empty draft with valid defaults", () => {
    const draft = emptyDraft()

    expect(draft.name).toBe("")

    expect(draft.quantity).toBe("1")

    expect(draft.unit).toBe("cái")

    expect(draft.mfgDate).toBe("")

    expect(draft.expDate).toBe("")
  })

  it("validates required fields and numerical constraints", () => {
    const invalidDraft: Draft = {
      name: "",

      quantity: "",

      unit: "",

      mfgDate: "",

      expDate: "",

      location: "",
    }

    const errors = validate(invalidDraft)

    expect(errors.name).toBe("Vui lòng nhập tên thực phẩm.")

    expect(errors.quantity).toBe("Vui lòng nhập số lượng.")

    expect(errors.unit).toBe("Vui lòng chọn đơn vị.")
  })

  it("rejects non-positive quantities and non-numeric input", () => {
    const draftZero: Draft = {
      name: "Táo",

      quantity: "0",

      unit: "quả",

      mfgDate: "",

      expDate: "",

      location: "",
    }

    expect(validate(draftZero).quantity).toBe("Số lượng phải lớn hơn 0.")

    const draftNegative: Draft = {
      name: "Táo",

      quantity: "-5",

      unit: "quả",

      mfgDate: "",

      expDate: "",

      location: "",
    }

    expect(validate(draftNegative).quantity).toBe(
      "Chỉ nhập số, ví dụ 2 hoặc 0.5.",
    )

    const draftText: Draft = {
      name: "Táo",

      quantity: "hai",

      unit: "quả",

      mfgDate: "",

      expDate: "",

      location: "",
    }

    expect(validate(draftText).quantity).toBe("Chỉ nhập số, ví dụ 2 hoặc 0.5.")
  })

  it("rejects expiry date that occurs before manufacturing date", () => {
    const draftChronologyError: Draft = {
      name: "Sữa",

      quantity: "2",

      unit: "hộp",

      mfgDate: "2026-10-20",

      expDate: "2026-10-10",

      location: "Ngăn mát",
    }

    const errors = validate(draftChronologyError)

    expect(errors.expDate).toBe("Hạn sử dụng không thể trước ngày sản xuất.")
  })

  it("passes validation on well-formed draft", () => {
    const validDraft: Draft = {
      name: "Cá hồi phi lê",

      quantity: "500",

      unit: "g",

      mfgDate: "2026-10-20",

      expDate: "2026-10-26",

      location: "Ngăn đông",
    }

    const errors = validate(validDraft)

    expect(Object.keys(errors)).toHaveLength(0)
  })
})

describe("Status Badge Computations", () => {
  it("formats status text with days remaining or overdue", () => {
    const t = today()

    expect(computeStatusOf(addDays(t, -5), 3)).toBe("expired")

    expect(computeStatusText(addDays(t, -5), 3)).toBe("Quá HSD 5 ngày")

    expect(computeStatusOf(t, 3)).toBe("soon")

    expect(computeStatusText(t, 3)).toBe("Hết HSD hôm nay")

    expect(computeStatusOf(addDays(t, 2), 3)).toBe("soon")

    expect(computeStatusText(addDays(t, 2), 3)).toBe("Sắp HSD · còn 2 ngày")

    expect(computeStatusOf(addDays(t, 10), 3)).toBe("ok")

    expect(computeStatusText(addDays(t, 10), 3)).toBe("Còn hạn")

    expect(computeStatusOf(null, 3)).toBe("unknown")

    expect(computeStatusText(null, 3)).toBe("Chưa rõ HSD")
  })
})
