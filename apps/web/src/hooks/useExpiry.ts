import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  ApiClient,
  ApiError,
  type Page,
  createDTO,
  draftDTO,
  decimal,
} from "../api/client"

import type {
  CreatePayload,
  EntryDraft,
  FoodEntry,
  Preferences,
  QuantityMovement,
  Session,
} from "../domain/types"

import type { InventoryFilters } from "../features/Inventory"

const emptyPage: Page<FoodEntry> = {
  items: [],

  pagination: { page: 1, limit: 20, total: 0 },

  as_of_date: "",
}

const attentionQuery = {
  past: "past_date",

  today: "due_today",

  soon: "soon",

  unknown: "unknown",

  later: "later",

  all: "",
}

type PendingMutation<T = unknown,> = {
  owner: string

  execute: () => Promise<T>
}

/** Owner changes invalidate data and in-flight responses. Drafts remain App-owned. */

export function useExpiry(
  view: string,

  filters: InventoryFilters,

  page: number,

  enabled: boolean = true,
) {
  const api = useMemo(() => new ApiClient(), [])

  const [session, setSession] = useState<Session | null>(null)

  const sessionRef = useRef<Session | null>(null)

  const lastOwner = useRef<string | null>(null)

  const epoch = useRef(0)

  const [checking, setChecking] = useState(true)

  const [loading, setLoading] = useState(false)

  const [busy, setBusy] = useState(false)

  const [error, setError] = useState<ApiError | null>(null)

  const [revision, setRevision] = useState(0)

  const [allFoods, setAllFoods] = useState<FoodEntry[]>([])

  const [list, setList] = useState<Page<FoodEntry>>(emptyPage)

  const [trash, setTrash] = useState<FoodEntry[]>([])

  const [prefs, setPrefs] = useState<Preferences | null>(null)

  const [asOfDate, setAsOfDate] = useState("")

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [selected, setSelected] = useState<FoodEntry | null>(null)

  const [history, setHistory] = useState<QuantityMovement[]>([])

  const pending = useRef<PendingMutation | null>(null)

  const [canRetry, setCanRetry] = useState(false)

  const clearData = useCallback(() => {
    setAllFoods([])

    setList(emptyPage)

    setTrash([])

    setPrefs(null)

    setSelected(null)

    setHistory([])

    setAsOfDate("")
  }, [])

  const fail = useCallback(
    (failure: unknown) => {
      const problem =
        failure instanceof ApiError
          ? failure
          : new ApiError(0, "NETWORK_ERROR", true)

      setError(problem)

      if (problem.status === 401 || problem.status === 403) {
        epoch.current++

        sessionRef.current = null

        setSession(null)

        clearData()
      }

      return problem
    },

    [clearData],
  )

  const acceptSession = useCallback(
    (value: Session) => {
      const changed =
        lastOwner.current !== null && lastOwner.current !== value.user.id

      epoch.current++

      clearData()

      if (changed) {
        pending.current = null

        setCanRetry(false)

        setSelectedId(null)
      }

      lastOwner.current = value.user.id

      sessionRef.current = value

      setSession(value)

      setError((current) => (pending.current && !changed ? current : null))

      return changed
    },

    [clearData],
  )

  useEffect(() => {
    if (!enabled) {
      setChecking(false)

      return
    }

    let active = true

    api

      .session()

      .then((value) => {
        if (active) acceptSession(value)
      })

      .catch((error) => {
        if (active && !(error instanceof ApiError && error.status === 401))
          fail(error)
      })

      .finally(() => {
        if (active) setChecking(false)
      })

    return () => {
      active = false
    }
  }, [api, acceptSession, fail, enabled])

  const query = useMemo(() => {
    const values: Record<string, string | number> = {
      page,

      limit: 20,

      view: view === "attention" ? "attention" : "inventory",

      lifecycle:
        view === "attention"
          ? "active"
          : filters.lifecycle === "Đã hết"
            ? "depleted"
            : filters.lifecycle === "Tất cả"
              ? "all"
              : "active",
    }

    if (filters.query) values.q = filters.query

    if (filters.location !== "Tất cả vị trí") values.location = filters.location

    if (attentionQuery[filters.attentionFilter])
      values.attention = attentionQuery[filters.attentionFilter]

    return values
  }, [
    page,

    view,

    filters.query,

    filters.location,

    filters.lifecycle,

    filters.attentionFilter,
  ])

  useEffect(() => {
    if (!enabled || !session) return

    let active = true

    const ownerEpoch = epoch.current

    setLoading(true)

    Promise.all([
      api.entries(query),

      api.preferences(),

      view === "trash"
        ? api.allEntries(true)
        : Promise.resolve({ items: [] as FoodEntry[] }),
    ])

      .then(([entries, preferences, deleted]) => {
        if (!active || ownerEpoch !== epoch.current) return

        setAllFoods(entries.items)

        setList(entries)

        setPrefs(preferences)

        setTrash(deleted.items)

        setAsOfDate(entries.as_of_date)
      })

      .catch((error) => {
        if (active && ownerEpoch === epoch.current) fail(error)
      })

      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [api, session, query, view, revision, fail, enabled])

  useEffect(() => {
    setSelected(null)

    setHistory([])

    if (!enabled || !selectedId || !session) return

    let active = true

    const ownerEpoch = epoch.current

    Promise.all([api.entry(selectedId), api.history(selectedId)])

      .then(([entry, movements]) => {
        if (active && ownerEpoch === epoch.current) {
          setSelected(entry)

          setHistory(movements)
        }
      })

      .catch((error) => {
        if (active && ownerEpoch === epoch.current) fail(error)
      })

    return () => {
      active = false
    }
  }, [api, selectedId, session, revision, fail])

  const authenticate = async (
    mode: "login" | "register",

    input: {
      email: string

      password: string

      display_name?: string
    },
  ) => {
    setBusy(true)

    try {
      const value = await api.authenticate(mode, input)

      return { ok: true, changed: acceptSession(value), owner: value.user.id }
    } catch (error) {
      fail(error)

      return { ok: false, changed: false }
    } finally {
      setBusy(false)
    }
  }
  const scan = async (file: File, barcode?: string, locale?: string) => {
    try {
      return await api.scan(file, barcode, locale)
    } catch (error) {
      fail(error)

      throw error
    }
  }

  const logout = async () => {
    setBusy(true)

    try {
      await api.logout()
    } catch (error) {
      fail(error)

      if (!(error instanceof ApiError && error.status === 401)) return false
    } finally {
      setBusy(false)
    }

    epoch.current++

    sessionRef.current = null

    lastOwner.current = null

    pending.current = null

    setSession(null)

    setSelectedId(null)

    setCanRetry(false)

    setError(null)

    clearData()

    return true
  }

  const run = useCallback(
    async <T>(command: PendingMutation<T>) => {
      const owner = sessionRef.current?.user.id

      if (!owner || owner !== command.owner) {
        const problem = fail(new ApiError(401, "AUTH_REQUIRED"))

        return { ok: false, error: problem }
      }

      if (pending.current && pending.current !== command) {
        const problem = fail(new ApiError(409, "COMMAND_PENDING"))

        return { ok: false, error: problem }
      }

      pending.current = command

      const ownerEpoch = epoch.current

      setBusy(true)

      setError(null)

      setCanRetry(false)

      try {
        const body = await command.execute()

        if (
          ownerEpoch !== epoch.current ||
          sessionRef.current?.user.id !== command.owner
        )
          return { ok: false }

        pending.current = null

        setCanRetry(false)

        setRevision((value) => value + 1)

        return { ok: true, body }
      } catch (error) {
        if (ownerEpoch !== epoch.current) return { ok: false }

        const problem = fail(error)

        if (
          problem.uncertain ||
          problem.status === 401 ||
          problem.status === 403
        )
          setCanRetry(true)
        else {
          pending.current = null

          setCanRetry(false)

          setRevision((value) => value + 1)
        }

        return { ok: false, error: problem }
      } finally {
        setBusy(false)
      }
    },

    [fail],
  )

  const runMutation = useCallback(
    <T>(owner: string, execute: (key: string) => Promise<T>) => {
      const key = `idemp_${crypto.randomUUID()}`

      return run({ owner, execute: () => execute(key) })
    },

    [run],
  )

  const createFood = useCallback(
    async (payload: CreatePayload) => {
      const owner = sessionRef.current?.user.id

      if (!owner) {
        const problem = fail(new ApiError(401, "AUTH_REQUIRED"))

        return { ok: false, error: problem }
      }

      return runMutation(owner, (key) =>
        api.createEntry(createDTO(payload), key),
      )
    },

    [api, fail, runMutation],
  )

  const recordMovement = useCallback(
    async (
      id: string,

      expectedVersion: number,

      kind: "consume" | "discard",

      amount: number,

      reason?: string | null,
    ) => {
      const owner = sessionRef.current?.user.id

      if (!owner) {
        const problem = fail(new ApiError(401, "AUTH_REQUIRED"))

        return { ok: false, error: problem }
      }

      return runMutation(owner, (key) =>
        api.recordMovement(
          id,

          {
            expected_version: expectedVersion,

            kind,

            amount: decimal(amount),

            reason: reason || null,
          },

          key,
        ),
      )
    },

    [api, fail, runMutation],
  )

  const recountFood = useCallback(
    async (
      id: string,

      expectedVersion: number,

      actualQuantity: number,

      reason: string,
    ) => {
      const owner = sessionRef.current?.user.id

      if (!owner) {
        const problem = fail(new ApiError(401, "AUTH_REQUIRED"))

        return { ok: false, error: problem }
      }

      return runMutation(owner, (key) =>
        api.recount(
          id,

          {
            expected_version: expectedVersion,

            actual_quantity: decimal(actualQuantity),

            reason: reason.trim(),
          },

          key,
        ),
      )
    },

    [api, fail, runMutation],
  )

  const updateFood = useCallback(
    async (id: string, expectedVersion: number, patch: EntryDraft) => {
      const owner = sessionRef.current?.user.id

      if (!owner) {
        const problem = fail(new ApiError(401, "AUTH_REQUIRED"))

        return { ok: false, error: problem }
      }

      return runMutation(owner, (key) =>
        api.updateEntry(
          id,

          {
            expected_version: expectedVersion,

            ...draftDTO(patch),
          },

          key,
        ),
      )
    },

    [api, fail, runMutation],
  )

  const deleteFood = useCallback(
    async (id: string, expectedVersion: number) => {
      const owner = sessionRef.current?.user.id

      if (!owner) {
        const problem = fail(new ApiError(401, "AUTH_REQUIRED"))

        return { ok: false, error: problem }
      }

      return runMutation(owner, (key) =>
        api.deleteEntry(id, expectedVersion, key),
      )
    },

    [api, fail, runMutation],
  )

  const restoreFood = useCallback(
    async (id: string, expectedVersion: number) => {
      const owner = sessionRef.current?.user.id

      if (!owner) {
        const problem = fail(new ApiError(401, "AUTH_REQUIRED"))

        return { ok: false, error: problem }
      }

      return runMutation(owner, (key) =>
        api.restoreEntry(id, expectedVersion, key),
      )
    },

    [api, fail, runMutation],
  )

  const updatePreferences = useCallback(
    async (
      expectedVersion: number,

      patch: Pick<Preferences, "timezone" | "attention_lead_days">,
    ) => {
      const owner = sessionRef.current?.user.id

      if (!owner) {
        const problem = fail(new ApiError(401, "AUTH_REQUIRED"))

        return { ok: false, error: problem }
      }

      return runMutation(owner, (key) =>
        api.updatePreferences(
          { expected_version: expectedVersion, ...patch },

          key,
        ),
      )
    },

    [api, fail, runMutation],
  )

  const retry = () =>
    pending.current ? run(pending.current) : Promise.resolve({ ok: false })

  const refresh = () => {
    setError(null)

    setRevision((value) => value + 1)
  }

  return {
    api,

    session,

    checking,

    loading,

    busy,

    error,

    setError,

    authenticate,

    scan,

    logout,

    retry,

    canRetry,

    refresh,

    createFood,

    recordMovement,

    recountFood,

    updateFood,

    deleteFood,

    restoreFood,

    updatePreferences,

    allFoods,

    list,

    trash,

    prefs,

    asOfDate,

    selectedId,

    setSelectedId,

    selected,

    history,
  }
}
