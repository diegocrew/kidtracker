import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { AppState, DailyLog, Profile } from './types';
import { loadState, saveState, generateDemoData } from './services/storageService';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import LogSheet from './components/LogSheet';
import ProfileEditor from './components/ProfileEditor';
import { CalendarIcon, ChartBarIcon, SparklesIcon, PlusIcon, PencilIcon } from './components/Icons';
import { getHealthInsights } from './services/geminiService';

enum Tab {
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  AI = 'AI'
}

function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CALENDAR);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentProfile = state.profiles.find(p => p.id === state.currentProfileId) || state.profiles[0];
  const currentLogs = state.logs[currentProfile.id] || ({} as Record<string, DailyLog>);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowLogSheet(true);
  };

  const handleSaveLog = (log: DailyLog) => {
    setState(prev => ({
      ...prev,
      logs: {
        ...prev.logs,
        [currentProfile.id]: {
          ...prev.logs[currentProfile.id],
          [log.date]: log
        }
      }
    }));
  };

  const handleDeleteLog = (date: string) => {
    setState(prev => {
      const newLogs = { ...prev.logs[currentProfile.id] };
      delete newLogs[date];
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [currentProfile.id]: newLogs
        }
      };
    });
    setShowLogSheet(false);
  };

  const handleGenerateData = () => {
    const data = generateDemoData();
    setState(data);
    Alert.alert('Demo Data Loaded', 'Check the calendar and stats.');
  };

  const handleAddProfile = () => {
    if (state.profiles.length >= 4) {
      Alert.alert('Max Profiles', 'Max profiles reached for this version.');
      return;
    }
    const newId = `p${state.profiles.length + 1}`;
    const colors = ['#3B82F6', '#EC4899', '#10B981', '#FBBF24'];
    const newProfile: Profile = {
      id: newId,
      name: `Child ${state.profiles.length + 1}`,
      avatarColor: colors[state.profiles.length]
    };
    setState(prev => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      currentProfileId: newId
    }));
  };

  const handleUpdateProfile = (updated: Profile) => {
    setState(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === updated.id ? updated : p)
    }));
  };

  const handleFetchInsights = async () => {
    setLoadingAi(true);
    try {
      const logs = Object.values(currentLogs) as DailyLog[];
      const text = await getHealthInsights(currentProfile, logs);
      setAiInsight(text);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate insights');
    }
    setLoadingAi(false);
  };

  useEffect(() => {
    setAiInsight('');
  }, [state.currentProfileId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Bar */}
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#1E293B' }}>KidCare</Text>
            <TouchableOpacity onPress={() => setShowProfileEditor(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '700' }}>{currentProfile.name}</Text>
              <PencilIcon size={12} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Profile Switcher */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {state.profiles.map((p, idx) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setState(s => ({ ...s, currentProfileId: p.id }))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: p.avatarColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: state.currentProfileId === p.id ? '#4F46E5' : '#FFFFFF',
                  opacity: state.currentProfileId === p.id ? 1 : 0.7,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>{p.name[0]}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={handleAddProfile}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#E2E8F0',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8
              }}
            >
              <PlusIcon size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        {Object.keys(currentLogs).length === 0 && (
          <View style={{ backgroundColor: '#E0E7FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <Text style={{ color: '#1E1B4B', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
              Start by tapping a date on the calendar, or load example data.
            </Text>
            <TouchableOpacity
              onPress={handleGenerateData}
              style={{
                backgroundColor: '#A5F3FC',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 8,
                alignSelf: 'center'
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E1B4B' }}>Load Demo Data</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === Tab.CALENDAR && <CalendarView logs={currentLogs} onDateSelect={handleDateSelect} selectedDate={selectedDate} />}
        {activeTab === Tab.STATS && <StatsView logs={currentLogs} />}
        {activeTab === Tab.AI && (
          <View style={{ backgroundColor: '#4F46E5', borderRadius: 16, padding: 24, marginBottom: 100 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 }}>Dr. AI Insights</Text>
                <Text style={{ fontSize: 12, color: '#C7D2FE' }}>Analysis based on {currentProfile.name}'s logs.</Text>
              </View>
              <SparklesIcon size={32} color="#FCD34D" />
            </View>

            <View style={{ marginTop: 24, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, minHeight: 150 }}>
              {loadingAi ? (
                <View style={{ justifyContent: 'center', alignItems: 'center', height: 150 }}>
                  <Text style={{ color: '#C7D2FE', fontSize: 14 }}>Analyzing patterns...</Text>
                </View>
              ) : aiInsight ? (
                <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 21 }}>{aiInsight}</Text>
              ) : (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#C7D2FE', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
                    Get a summary of recent illnesses, frequency analysis, and general wellness patterns.
                  </Text>
                  <TouchableOpacity
                    onPress={handleFetchInsights}
                    style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 }}
                  >
                    <Text style={{ color: '#4F46E5', fontWeight: '700', fontSize: 14 }}>Generate Report</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={{ fontSize: 10, color: 'rgba(199, 210, 254, 0.7)', marginTop: 16, textAlign: 'center' }}>
              AI generated content. Not medical advice. Always consult a doctor.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', height: 64 }}>
        {[
          { id: Tab.CALENDAR, icon: CalendarIcon, label: 'Calendar' },
          { id: Tab.STATS, icon: ChartBarIcon, label: 'Stats' },
          { id: Tab.AI, icon: SparklesIcon, label: 'AI Helper' }
        ].map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setActiveTab(item.id)}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <item.icon size={24} color={activeTab === item.id ? '#4F46E5' : '#94A3B8'} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: activeTab === item.id ? '#4F46E5' : '#94A3B8', marginTop: 4 }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modals */}
      <Modal visible={showLogSheet} animationType="slide" transparent>
        {showLogSheet && selectedDate && (
          <LogSheet
            date={selectedDate}
            existingLog={currentLogs[selectedDate]}
            onSave={handleSaveLog}
            onClose={() => setShowLogSheet(false)}
            onDelete={handleDeleteLog}
          />
        )}
      </Modal>

      <Modal visible={showProfileEditor} animationType="fade" transparent>
        {showProfileEditor && (
          <ProfileEditor
            profile={currentProfile}
            onSave={handleUpdateProfile}
            onClose={() => setShowProfileEditor(false)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

export default App;
