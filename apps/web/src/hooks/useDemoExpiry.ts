/**
 * Demo-mode drop-in for useExpiry.
 *
 * Returns the same surface shape as useExpiry so App.tsx can use a single
 * unified `api` object regardless of runtime mode. All mutations are
 * synchronous in-memory operations backed by mockApi; they are wrapped in
 * a tiny async shell and return `{ ok, body?, error? }` — identical to the
 * real hook's contract.
 */

import { useMemo, useRef, useState } from "react"

import { attentionFor, localDay, mockApi } from "../mockApi"

import type {
  CreatePayload,
  EntryDraft,
  FoodEntry,
  Preferences,
  QuantityMovement,
} from "../domain/types"

import { ApiError } from "../mockApi"

// ---- tiny result wrapper identical to the real hook's return shapes --------

type OkResult<T = unknown,> = {
  ok: true

  body?: T
}

type ErrResult = {
  ok: false

  error: {
    status: number

    code: string

    message: string
  }
}

type MutResult<T = unknown> = OkResult<T> | ErrResult

function wrapOk<T>(body?: T): OkResult<T> {
  return { ok: true, body }
}

function wrapErr(err: unknown): ErrResult {
  if (err instanceof ApiError) {
    return {
      ok: false,

      error: { status: err.status, code: err.code, message: err.code },
    }
  }

  return {
    ok: false,

    error: { status: 0, code: "UNKNOWN", message: "Unknown error" },
  }
}

// ---- Demo session fixture --------------------------------------------------

const DEMO_SESSION = {
  user: {
    id: mockApi.user.id,

    display_name: mockApi.user.display_name ?? "Demo",

    email: "demo@expiry.app",

    timezone: mockApi.user.timezone,

    attention_lead_days: mockApi.user.attention_lead_days,

    version: mockApi.user.version,
  },

  csrf_token: "demo",

  expires_at: new Date(Date.now() + 86400_000).toISOString(),
}

// ---- hook ------------------------------------------------------------------

export function useDemoExpiry(selectedId: string | null) {
  const [revision, setRevision] = useState(0)

  const internalSelectedId = useRef(selectedId)

  internalSelectedId.current = selectedId

  const bump = () => setRevision((r) => r + 1)

  const entries: FoodEntry[] = useMemo(
    () => mockApi.listEntries(),

    // eslint-disable-next-line react-hooks/exhaustive-deps

    [revision],
  )

  const trash: FoodEntry[] = useMemo(
    () => mockApi.listTrash(),

    // eslint-disable-next-line react-hooks/exhaustive-deps

    [revision],
  )

  const prefs: Preferences = useMemo(
    () => mockApi.getPreferences(),

    // eslint-disable-next-line react-hooks/exhaustive-deps

    [revision],
  )

  const selected: FoodEntry | null = useMemo(() => {
    if (!internalSelectedId.current) return null

    try {
      return mockApi.getEntry(internalSelectedId.current)
    } catch {
      return null
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, revision])

  const history: QuantityMovement[] = useMemo(
    () =>
      internalSelectedId.current
        ? mockApi.listMovements(internalSelectedId.current)
        : [],

    // eslint-disable-next-line react-hooks/exhaustive-deps

    [selectedId, revision],
  )

  const asOfDate = localDay(new Date(), prefs.timezone)

  // ---- mutations (all sync under the hood, wrapped in async for uniform API)

  async function createFood(
    payload: CreatePayload,
  ): Promise<MutResult<{ id: string }>> {
    try {
      const result = mockApi.createEntry(
        mockApi.createCommandKey("create"),

        payload,
      )

      bump()

      return wrapOk({ id: result.data.id })
    } catch (err) {
      return wrapErr(err)
    }
  }

  async function updateFood(
    id: string,

    expectedVersion: number,

    patch: EntryDraft,
  ): Promise<MutResult> {
    try {
      mockApi.updateEntry(
        mockApi.createCommandKey("update"),

        id,

        expectedVersion,

        patch,
      )

      bump()

      return wrapOk()
    } catch (err) {
      return wrapErr(err)
    }
  }

  async function recordMovement(
    id: string,

    expectedVersion: number,

    kind: "consume" | "discard",

    amount: number,

    reason?: string | null,
  ): Promise<MutResult> {
    try {
      mockApi.recordMovement(
        mockApi.createCommandKey(kind),

        id,

        expectedVersion,

        kind,

        amount,

        reason || null,
      )

      bump()

      return wrapOk()
    } catch (err) {
      return wrapErr(err)
    }
  }

  async function recountFood(
    id: string,

    expectedVersion: number,

    actualQuantity: number,

    reason: string,
  ): Promise<MutResult> {
    try {
      mockApi.recount(
        mockApi.createCommandKey("recount"),

        id,

        expectedVersion,

        actualQuantity,

        reason,
      )

      bump()

      return wrapOk()
    } catch (err) {
      return wrapErr(err)
    }
  }

  async function deleteFood(
    id: string,

    expectedVersion: number,
  ): Promise<MutResult> {
    try {
      mockApi.deleteEntry(
        mockApi.createCommandKey("delete"),

        id,

        expectedVersion,
      )

      bump()

      return wrapOk()
    } catch (err) {
      return wrapErr(err)
    }
  }

  async function restoreFood(
    id: string,

    _expectedVersion: number,
  ): Promise<MutResult> {
    try {
      mockApi.restoreEntry(mockApi.createCommandKey("restore"), id)

      bump()

      return wrapOk()
    } catch (err) {
      return wrapErr(err)
    }
  }

  async function updatePreferences(
    expectedVersion: number,

    patch: Pick<Preferences, "timezone" | "attention_lead_days">,
  ): Promise<MutResult> {
    try {
      mockApi.updatePreferences(
        mockApi.createCommandKey("preferences"),

        expectedVersion,

        patch,
      )

      bump()

      return wrapOk()
    } catch (err) {
      return wrapErr(err)
    }
  }

  function getMovements(id: string) {
    return mockApi.listMovements(id)
  }

  function getEntry(id: string) {
    try {
      return mockApi.getEntry(id)
    } catch {
      return null
    }
  }

  // Stubs for features unavailable in demo mode

  const authenticate = async () => ({ ok: false as const, changed: false })

  const logout = async () => false

  const scan = async (_file: File, _barcode?: string) => {
    throw new Error("Scan not available in demo mode")
  }

  const retry = async () => ({ ok: false as const })

  const refresh = () => {}

  const setSelectedId = (_id: string | null) => {}

  return {
    // data

    allFoods: entries,

    trash,

    prefs,

    selected,

    history,

    asOfDate,

    session: DEMO_SESSION,

    // status flags — demo is always ready

    checking: false,

    loading: false,

    busy: false,

    error: null as null,

    canRetry: false,

    // auth / lifecycle (no-ops)

    authenticate,

    logout,

    scan,

    retry,

    refresh,

    setSelectedId,

    // mutations

    createFood,

    updateFood,

    recordMovement,

    recountFood,

    deleteFood,

    restoreFood,

    updatePreferences,

    // demo extras

    getMovements,

    getEntry,

    attentionFor: (entry: FoodEntry) =>
      attentionFor(entry, prefs.attention_lead_days, asOfDate),
  }
}
