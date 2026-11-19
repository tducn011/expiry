import type { Category, Food, Unit } from "../store/appStore"

export interface Draft {
  id?: string
  name: string
  quantity: string
  unit: Unit | ""
  category: Category | ""
  mfgDate: string
  opened_on?: string
  expDate: string
  location: string
  barcode?: string
  note?: string
  reviewAt?: string
}

export const emptyDraft = (): Draft => ({
  name: "",
  quantity: "1",
  // Manual/OCR drafts have no reliable unit evidence; require an explicit choice.
  unit: "",
  category: "other",
  mfgDate: "",
  opened_on: "",
  expDate: "",
  location: "",
  note: "",
  reviewAt: "",
})

export const draftFrom = (f: Food, keepQty = true): Draft => ({
  id: f.id,
  name: f.name,
  quantity: keepQty ? String(f.quantity) : "",
  unit: f.unit,
  category: f.category ?? "other",
  mfgDate: f.mfgDate ?? "",
  opened_on: f.opened_on ?? "",
  expDate: f.expDate ?? "",
  location: f.location ?? "",
  barcode: f.barcode ?? undefined,
  note: f.note ?? "",
  reviewAt: f.reviewAt ?? "",
})
