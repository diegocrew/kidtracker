import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { DailyLog } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { toLocalISOString } from '../utils';

interface CalendarViewProps {
  logs: Record<string, DailyLog>;
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs, onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSickDay = (dateStr: string) => {
    const log = logs[dateStr];
    if (!log) return false;
    return (log.symptoms && log.symptoms.length > 0) || (log.temperatures && log.temperatures.length > 0);
  };

  const days = useMemo(() => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const daysArray = [];

    for (let i = 0; i < startDay; i++) {
      daysArray.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      daysArray.push(i);
    }
    return daysArray;
  }, [currentDate]);

  const getStatusColor = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    if (!isSickDay(dateStr)) return { bg: '#FFFFFF', text: '#475569' };

    const prevDateObj = new Date(year, currentDate.getMonth(), day - 1);
    const prevDateStr = toLocalISOString(prevDateObj);
    const wasSickYesterday = isSickDay(prevDateStr);

    if (wasSickYesterday) {
      return { bg: '#FB923C', text: '#FFFFFF' };
    } else {
      return { bg: '#EF4444', text: '#FFFFFF' };
    }
  };

  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 24 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B' }}>
          {monthName} <Text style={{ color: '#94A3B8', fontWeight: '400' }}>{year}</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 8 }}>
            <ChevronLeftIcon size={20} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth} style={{ padding: 8 }}>
            <ChevronRightIcon size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days Header */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {days.map((day, index) => {
          if (day === null) return <View key={`empty-${index}`} style={{ width: '14.28%', height: 40 }} />;
          
          const m = String(currentDate.getMonth() + 1).padStart(2, '0');
          const d = String(day).padStart(2, '0');
          const dateStr = `${currentDate.getFullYear()}-${m}-${d}`;
          
          const isSelected = selectedDate === dateStr;
          const colors = getStatusColor(day);
          
          return (
            <TouchableOpacity
              key={day}
              onPress={() => onDateSelect(dateStr)}
              style={{
                width: '14.28%',
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.bg,
                borderRadius: 12,
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? '#3B82F6' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CalendarView;
