import { attention, localDay, milli, decimal, DomainError } from './domain.mjs';

// MySQL DATETIME(6) is stored under the UTC connection convention. Preserve its
// fractional precision rather than interpreting a zone-less value in host time.
export function utcInstant(value) {
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z?$/.test(value)) {
    throw new DomainError(500, 'INVALID_PERSISTENCE_VALUE');
  }
  return value.replace(' ', 'T').replace(/Z?$/, 'Z');
}

export const inactiveAttention = as_of_date => ({
  status: 'inactive', reason_code: 'ENTRY_NOT_ACTIVE', as_of_date
});

export function publicAttention(entry, preferences, instant) {
  return attention(entry, preferences, instant) ?? inactiveAttention(localDay(instant, preferences.timezone));
}

export function entryDTO(entry, projection) {
  return {
    id: entry.id,
    name: entry.name,
    storage_location: entry.storage_location,
    remaining_quantity: entry.remaining_quantity,
    unit: entry.unit,
    expiry_date: entry.expiry_date,
    date_certainty: entry.date_certainty,
    date_source: entry.date_source,
    date_label_type: entry.date_label_type,
    opened_on: entry.opened_on,
    note: entry.note,
    version: entry.version,
    lifecycle: milli(entry.remaining_quantity, entry.unit) === 0n ? 'depleted' : 'active',
    attention: projection,
    deleted_at: utcInstant(entry.deleted_at),
    created_at: utcInstant(entry.created_at),
    updated_at: utcInstant(entry.updated_at)
  };
}

export function movementDTO(movement) {
  const delta = milli(movement.quantity_after, 'g') - milli(movement.quantity_before, 'g');
  return {
    id: movement.id, entry_id: movement.entry_id, kind: movement.kind,
    quantity_before: movement.quantity_before, quantity_after: movement.quantity_after,
    delta: `${delta < 0n ? '-' : ''}${decimal(delta < 0n ? -delta : delta)}`,
    reason: movement.reason, recorded_at: utcInstant(movement.recorded_at)
  };
}

export function preferencesDTO(preferences) {
  return { timezone: preferences.timezone, attention_lead_days: preferences.attention_lead_days, version: preferences.version };
}

export function commandDTO(result, preferences, instant) {
  if (result.body === null) return result;
  const project = entry => entryDTO(entry, publicAttention(entry, preferences, instant));
  return {
    ...result,
    body: result.body.entry ? {
      entry: project(result.body.entry),
      movement: result.body.movement === null ? null : movementDTO(result.body.movement),
      changed: result.body.changed
    } : project(result.body)
  };
}

export function queryInteger(value, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new DomainError(422, 'VALIDATION_ERROR');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) throw new DomainError(422, 'VALIDATION_ERROR');
  return parsed;
}

export const paginationQuery = query => ({
  page: queryInteger(query.page, 1), limit: queryInteger(query.limit, 20, 100)
});
