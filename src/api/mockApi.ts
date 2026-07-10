import { TriageRecord } from '../../types';


const ARTIFICIAL_DELAY_MS = 2000;
const RANDOM_FAILURE_RATE = 0.3;

export function submitTriageRecord(
  record: TriageRecord
): Promise<{ success: true }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const shouldFail = Math.random() < RANDOM_FAILURE_RATE;
      if (shouldFail) {
        reject(new Error(`Simulated network failure for record ${record.id}`));
      } else {
        resolve({ success: true });
      }
    }, ARTIFICIAL_DELAY_MS);
  });
}