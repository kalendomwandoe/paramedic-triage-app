import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllRecords, saveAllRecords } from '../src/storage/storage';
import { TriageRecord } from '../src/types';

const sample: TriageRecord = {
  id: '1',
  patientName: 'John Smith',
  conditionDescription: 'Chest pain',
  priority: 1,
  status: 'In-Transit',
  createdAt: 1234,
  synced: false,
};

describe('storage layer', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns an empty array when nothing has been saved yet', async () => {
    const records = await getAllRecords();
    expect(records).toEqual([]);
  });

  it('persists and retrieves records', async () => {
    await saveAllRecords([sample]);
    const records = await getAllRecords();
    expect(records).toEqual([sample]);
  });

  it('overwrites previous state on each save (last-write-wins for the whole list)', async () => {
    await saveAllRecords([sample]);
    const updated = { ...sample, synced: true };
    await saveAllRecords([updated]);
    const records = await getAllRecords();
    expect(records).toEqual([updated]);
  });
});