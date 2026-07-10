import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { Priority, Status, TriageRecord } from '../types';
import { getAllRecords, saveAllRecords } from '../storage/storage';
import { submitTriageRecord } from '../api/mockApi';




export interface TriageState {
  records: TriageRecord[];
  isOnline: boolean;
  isSyncing: boolean;
}

export type TriageAction =
  | { type: 'LOAD_RECORDS'; records: TriageRecord[] }
  | { type: 'ADD_RECORD'; record: TriageRecord }
  | { type: 'MARK_SYNCED'; id: string }
  | { type: 'SET_ONLINE'; isOnline: boolean }
  | { type: 'SET_SYNCING'; isSyncing: boolean };

export const initialTriageState: TriageState = {
  records: [],
  isOnline: true,
  isSyncing: false,
};

export function triageReducer(
  state: TriageState,
  action: TriageAction
): TriageState {
  switch (action.type) {
    case 'LOAD_RECORDS':
      return { ...state, records: action.records };
    case 'ADD_RECORD':
      return { ...state, records: [...state.records, action.record] };
    case 'MARK_SYNCED':
      return {
        ...state,
        records: state.records.map((r) =>
          r.id === action.id ? { ...r, synced: true } : r
        ),
      };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.isOnline };
    case 'SET_SYNCING':
      return { ...state, isSyncing: action.isSyncing };
    default:
      return state;
  }
}

// --Context --

interface TriageContextValue extends TriageState {
  addTriage: (
    patientName: string,
    conditionDescription: string,
    priority: Priority,
    status: Status
  ) => void;
  pendingCount: number;
}

const TriageContext = createContext<TriageContextValue | undefined>(
  undefined
);

export function TriageProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(triageReducer, initialTriageState);

 
  const recordsRef = useRef(state.records);
  const isOnlineRef = useRef(state.isOnline);
  const syncingRef = useRef(false);
  recordsRef.current = state.records;
  isOnlineRef.current = state.isOnline;


  useEffect(() => {
    (async () => {
      const records = await getAllRecords();
      dispatch({ type: 'LOAD_RECORDS', records });
    })();
  }, []);


  useEffect(() => {
    saveAllRecords(state.records);
  }, [state.records]);

  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      const online = !!netState.isConnected && netState.isInternetReachable !== false;
      dispatch({ type: 'SET_ONLINE', isOnline: online });
    });
    return () => unsubscribe();
  }, []);

  
  useEffect(() => {
    const onChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && isOnlineRef.current) {
        syncPendingRecords();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
   
  }, []);

  
  useEffect(() => {
    if (state.isOnline) {
      syncPendingRecords();
    }
    
  }, [state.isOnline]);

  async function syncPendingRecords() {
    if (syncingRef.current) return; // never run two sync passes concurrently
    const pending = recordsRef.current.filter((r) => !r.synced);
    if (pending.length === 0) return;

    syncingRef.current = true;
    dispatch({ type: 'SET_SYNCING', isSyncing: true });

    
    for (const record of pending) {
      if (!isOnlineRef.current) break; // connection dropped mid-batch, stop and wait for next reconnect
      try {
        await submitTriageRecord(record);
        dispatch({ type: 'MARK_SYNCED', id: record.id });
      } catch (e) {
       
      }
    }

    dispatch({ type: 'SET_SYNCING', isSyncing: false });
    syncingRef.current = false;
  }

  function addTriage(
    patientName: string,
    conditionDescription: string,
    priority: Priority,
    status: Status
  ) {
    const record: TriageRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      patientName,
      conditionDescription,
      priority,
      status,
      createdAt: Date.now(),
      synced: false,
    };

    
    dispatch({ type: 'ADD_RECORD', record });

   
    if (isOnlineRef.current) {
      submitTriageRecord(record)
        .then(() => dispatch({ type: 'MARK_SYNCED', id: record.id }))
        .catch(() => {
          
        });
    }
  }

  const pendingCount = state.records.filter((r) => !r.synced).length;

  return (
    <TriageContext.Provider value={{ ...state, addTriage, pendingCount }}>
      {children}
    </TriageContext.Provider>
  );
}

export function useTriage(): TriageContextValue {
  const ctx = useContext(TriageContext);
  if (!ctx) {
    throw new Error('useTriage must be used within a TriageProvider');
  }
  return ctx;
}