import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTriage } from '../context/TriageContext';
import { Priority, Status } from '../types';
import PriorityBadge from '../components/PriorityBadge';

const PRIORITIES: Priority[] = [1, 2, 3, 4, 5];
const STATUSES: Status[] = ['Pending', 'In-Transit'];

export default function Index() {
  const { addTriage, records, isOnline, pendingCount, isSyncing } = useTriage();

  const [patientName, setPatientName] = useState('');
  const [conditionDescription, setConditionDescription] = useState('');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  function handleSubmit() {
    if (!patientName.trim()) {
      setError('Patient name is required.');
      return;
    }
    if (!conditionDescription.trim()) {
      setError('Condition description is required.');
      return;
    }
    if (!priority) {
      setError('Priority level must be selected.');
      return;
    }
    if (!status) {
      setError('Status must be selected.');
      return;
    }

    setError('');
    addTriage(patientName.trim(), conditionDescription.trim(), priority, status);

    setPatientName('');
    setConditionDescription('');
    setPriority(null);
    setStatus(null);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View
            style={[
              styles.banner,
              { backgroundColor: isOnline ? '#2E7D32' : '#B71C1C' },
            ]}
          >
            <Text style={styles.bannerText}>
              {isOnline ? 'Online' : 'Offline'}
              {isSyncing ? ' · Syncing…' : ''} · {pendingCount} pending sync
            </Text>
          </View>

          {justSaved && (
            <View style={styles.savedBanner}>
              <Text style={styles.savedBannerText}>
                Saved locally{isOnline ? ' — syncing now' : ' — will sync when back online'}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Patient Name</Text>
          <TextInput
            style={styles.input}
            value={patientName}
            onChangeText={setPatientName}
            placeholder="e.g. John Doe"
            returnKeyType="next"
          />

          <Text style={styles.label}>Condition Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={conditionDescription}
            onChangeText={setConditionDescription}
            placeholder="e.g. Severe chest trauma, unconscious"
            multiline
          />

          <Text style={styles.label}>Priority Level (1 = most critical)</Text>
          <View style={styles.row}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity key={p} onPress={() => setPriority(p)}>
                <PriorityBadge priority={p} selected={priority === p} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Status</Text>
          <View style={styles.row}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusChip,
                  status === s && styles.statusChipSelected,
                ]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={[
                    styles.statusText,
                    status === s && styles.statusTextSelected,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Triage Record</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Recent Records ({records.length})</Text>
          {records
            .slice()
            .reverse()
            .map((r) => (
              <View key={r.id} style={styles.recordRow}>
                <PriorityBadge priority={r.priority} selected small />
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>{r.patientName}</Text>
                  <Text style={styles.recordDesc} numberOfLines={1}>
                    {r.conditionDescription}
                  </Text>
                </View>
                <Text style={r.synced ? styles.synced : styles.notSynced}>
                  {r.synced ? 'Synced' : 'Pending'}
                </Text>
              </View>
            ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { padding: 16, paddingBottom: 40 },
  banner: { padding: 10, borderRadius: 8, marginBottom: 12 },
  bannerText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  savedBanner: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  savedBannerText: { color: '#1565C0', textAlign: 'center', fontWeight: '600' },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  statusChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#888',
    marginRight: 8,
    marginBottom: 8,
  },
  statusChipSelected: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  statusText: { color: '#333' },
  statusTextSelected: { color: '#fff', fontWeight: '600' },
  error: { color: '#B71C1C', marginTop: 8, fontWeight: '600' },
  submitButton: {
    backgroundColor: '#1565C0',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  submitText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginTop: 24, marginBottom: 8 },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordInfo: { flex: 1, marginLeft: 8 },
  recordName: { fontWeight: '600' },
  recordDesc: { color: '#666', fontSize: 12 },
  synced: { color: '#2E7D32', fontWeight: '600', fontSize: 12 },
  notSynced: { color: '#E65100', fontWeight: '600', fontSize: 12 },
});