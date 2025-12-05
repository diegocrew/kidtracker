import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { DailyLog, Medication, TemperatureReading } from '../types';

interface LogSheetProps {
  date: string;
  existingLog?: DailyLog;
  onSave: (log: DailyLog) => void;
  onClose: () => void;
  onDelete: (date: string) => void;
  visible: boolean;
}

const COMMON_SYMPTOMS = [
  'Fever',
  'Cough',
  'Runny Nose',
  'Vomiting',
  'Headache',
  'Stomach Ache',
  'Fatigue',
  'Rash',
];

const LogSheet: React.FC<LogSheetProps> = ({
  date,
  existingLog,
  onSave,
  onClose,
  onDelete,
  visible,
}) => {
  const [symptoms, setSymptoms] = useState<string[]>(
    existingLog?.symptoms || []
  );
  const [notes, setNotes] = useState(existingLog?.notes || '');
  const [meds, setMeds] = useState<Medication[]>(existingLog?.medications || []);
  const [temps, setTemps] = useState<TemperatureReading[]>(
    existingLog?.temperatures || []
  );

  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');

  const [newTempVal, setNewTempVal] = useState('37.0');
  const [newTempTime, setNewTempTime] = useState('');

  const [customSymptom, setCustomSymptom] = useState('');

  // Reset when date changes
  useEffect(() => {
    if (visible) {
      setSymptoms(existingLog?.symptoms || []);
      setNotes(existingLog?.notes || '');
      setMeds(existingLog?.medications || []);
      setTemps(existingLog?.temperatures || []);
      setNewTempVal('37.0');

      // Default time for new temp to now
      const now = new Date();
      setNewTempTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}`
      );
    }
  }, [date, existingLog, visible]);

  const toggleSymptom = (sym: string) => {
    if (symptoms.includes(sym)) {
      setSymptoms(symptoms.filter((s) => s !== sym));
    } else {
      setSymptoms([...symptoms, sym]);
    }
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim()) {
      const val = customSymptom.trim();
      if (!symptoms.includes(val)) {
        setSymptoms([...symptoms, val]);
      }
      setCustomSymptom('');
    }
  };

  const addMed = () => {
    if (newMedName && newMedDose) {
      setMeds([...meds, { name: newMedName, dosage: newMedDose }]);
      setNewMedName('');
      setNewMedDose('');
    }
  };

  const removeMed = (index: number) => {
    setMeds(meds.filter((_, i) => i !== index));
  };

  const addTemp = () => {
    if (newTempVal && newTempTime) {
      setTemps(
        [...temps, { value: parseFloat(newTempVal), time: newTempTime }].sort(
          (a, b) => a.time.localeCompare(b.time)
        )
      );
      setNewTempVal('37.0');
    }
  };

  const adjustTemp = (delta: number) => {
    const current = parseFloat(newTempVal) || 37.0;
    setNewTempVal((current + delta).toFixed(1));
  };

  const removeTemp = (index: number) => {
    setTemps(temps.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (
      symptoms.length === 0 &&
      meds.length === 0 &&
      temps.length === 0 &&
      !notes.trim()
    ) {
      onDelete(date);
    } else {
      onSave({
        date,
        symptoms,
        medications: meds,
        temperatures: temps,
        notes,
      });
    }
    onClose();
  };

  // Format date for display
  const formatDateTitle = (dateStr: string): string => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const displayDate = formatDateTitle(date);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{displayDate}</Text>
              <TouchableOpacity
                onPress={() => onDelete(date)}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear Day</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {/* Symptoms Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Symptoms</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {symptoms.length} selected
                    </Text>
                  </View>
                </View>

                <View style={styles.symptomGrid}>
                  {COMMON_SYMPTOMS.map((sym) => (
                    <TouchableOpacity
                      key={sym}
                      onPress={() => toggleSymptom(sym)}
                      style={[
                        styles.symptomButton,
                        symptoms.includes(sym) && styles.symptomButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.symptomButtonText,
                          symptoms.includes(sym) &&
                            styles.symptomButtonTextActive,
                        ]}
                      >
                        {sym}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {/* Custom Symptoms */}
                  {symptoms
                    .filter((s) => !COMMON_SYMPTOMS.includes(s))
                    .map((sym) => (
                      <TouchableOpacity
                        key={sym}
                        onPress={() => toggleSymptom(sym)}
                        style={[
                          styles.symptomButton,
                          styles.symptomButtonActive,
                        ]}
                      >
                        <Text style={styles.symptomButtonTextActive}>
                          {sym}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>

                {/* Add Custom Symptom */}
                <View style={styles.addCustomContainer}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Add other symptom..."
                    placeholderTextColor="#94A3B8"
                    value={customSymptom}
                    onChangeText={setCustomSymptom}
                  />
                  <TouchableOpacity
                    onPress={addCustomSymptom}
                    style={styles.addButton}
                  >
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Temperature Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Temperature</Text>

                {temps.length > 0 && (
                  <View style={styles.temperatureList}>
                    {temps.map((t, idx) => (
                      <View key={idx} style={styles.tempCard}>
                        <View>
                          <Text style={styles.tempValue}>
                            {t.value.toFixed(1)}°
                          </Text>
                          <Text style={styles.tempTime}>{t.time}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeTemp(idx)}>
                          <Text style={styles.tempRemove}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.tempInputContainer}>
                  <TouchableOpacity
                    onPress={() => adjustTemp(-0.1)}
                    style={styles.tempButton}
                  >
                    <Text style={styles.tempButtonText}>−</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.tempInput}
                    value={newTempVal}
                    onChangeText={setNewTempVal}
                    keyboardType="decimal-pad"
                  />

                  <TouchableOpacity
                    onPress={() => adjustTemp(0.1)}
                    style={styles.tempButton}
                  >
                    <Text style={styles.tempButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="HH:MM"
                    placeholderTextColor="#94A3B8"
                    value={newTempTime}
                    onChangeText={setNewTempTime}
                  />
                  <TouchableOpacity
                    onPress={addTemp}
                    style={styles.addTempButton}
                  >
                    <Text style={styles.addTempButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Medications Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Medications</Text>

                {meds.length > 0 && (
                  <View style={styles.medList}>
                    {meds.map((m, idx) => (
                      <View key={idx} style={styles.medCard}>
                        <View>
                          <Text style={styles.medName}>{m.name}</Text>
                          <Text style={styles.medDose}>{m.dosage}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeMed(idx)}>
                          <Text style={styles.medRemove}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.medInputContainer}>
                  <TextInput
                    style={[styles.medInput, styles.flex]}
                    placeholder="Medicine"
                    placeholderTextColor="#94A3B8"
                    value={newMedName}
                    onChangeText={setNewMedName}
                  />
                  <TextInput
                    style={[styles.medInput, { width: 80 }]}
                    placeholder="Dose"
                    placeholderTextColor="#94A3B8"
                    value={newMedDose}
                    onChangeText={setNewMedDose}
                  />
                  <TouchableOpacity
                    onPress={addMed}
                    style={styles.addMedButton}
                  >
                    <Text style={styles.addMedButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notes Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Any specific observations..."
                  placeholderTextColor="#94A3B8"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Save Log</Text>
              </TouchableOpacity>

              <View style={styles.bottomPadding} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  symptomButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  symptomButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  symptomButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  symptomButtonTextActive: {
    color: '#FFFFFF',
  },
  addCustomContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  temperatureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tempCard: {
    width: '48%',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECB81',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B91C1C',
  },
  tempTime: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
  },
  tempRemove: {
    fontSize: 20,
    color: '#FECACA',
  },
  tempInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  tempButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748B',
  },
  tempInput: {
    flex: 1,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    textAlign: 'center',
  },
  addTempButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTempButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  medList: {
    gap: 8,
    marginBottom: 12,
  },
  medCard: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A8A',
  },
  medDose: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  medRemove: {
    fontSize: 20,
    color: '#BFDBFE',
  },
  medInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  medInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  addMedButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMedButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomPadding: {
    height: 20,
  },
});

export default LogSheet;
