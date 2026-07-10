import AsyncStorage from '@react-native-async-storage/async-storage';
import { TriageRecord } from '../../types';


const STORAGE_KEY = 'TRIAGE_RECORDS_V1';

export async function getAllRecords(): Promise<TriageRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TriageRecord[]) : [];
  } catch (e) {
    console.warn('Failed to read triage records from storage', e);
    return [];
  }
}

export async function saveAllRecords(records: TriageRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('Failed to persist triage records to storage', e);
  }
}