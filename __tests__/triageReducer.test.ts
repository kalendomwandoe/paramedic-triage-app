import {
  triageReducer,
  initialTriageState,
  TriageState,
} from '../src/context/TriageContext';
import { TriageRecord } from '../src/types';

function makeRecord(overrides: Partial<TriageRecord> = {}): TriageRecord {
  return {
    id: '1',
    patientName: 'Jane Doe',
    conditionDescription: 'Fractured leg',
    priority: 2,
    status: 'Pending',
    createdAt: Date.now(),
    synced: false,
    ...overrides,
  };
}

describe('triageReducer', () => {
  it('adds a new record to state', () => {
    const record = makeRecord();
    const next = triageReducer(initialTriageState, {
      type: 'ADD_RECORD',
      record,
    });
    expect(next.records).toHaveLength(1);
    expect(next.records[0]).toEqual(record);
  });

  it('marks a record as synced by id without touching others', () => {
    const recordA = makeRecord({ id: 'a' });
    const recordB = makeRecord({ id: 'b' });
    const start: TriageState = {
      ...initialTriageState,
      records: [recordA, recordB],
    };

    const next = triageReducer(start, { type: 'MARK_SYNCED', id: 'a' });

    expect(next.records.find((r) => r.id === 'a')?.synced).toBe(true);
    expect(next.records.find((r) => r.id === 'b')?.synced).toBe(false);
  });

  it('loads records from persisted storage, replacing current state', () => {
    const persisted = [makeRecord({ id: 'x' }), makeRecord({ id: 'y' })];
    const next = triageReducer(initialTriageState, {
      type: 'LOAD_RECORDS',
      records: persisted,
    });
    expect(next.records).toHaveLength(2);
    expect(next.records.map((r) => r.id)).toEqual(['x', 'y']);
  });

  it('toggles online status', () => {
    const next = triageReducer(initialTriageState, {
      type: 'SET_ONLINE',
      isOnline: false,
    });
    expect(next.isOnline).toBe(false);
  });

  it('toggles syncing status', () => {
    const next = triageReducer(initialTriageState, {
      type: 'SET_SYNCING',
      isSyncing: true,
    });
    expect(next.isSyncing).toBe(true);
  });
});