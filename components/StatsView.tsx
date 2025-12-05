import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { DailyLog, Stats } from '../types';

interface StatsViewProps {
  logs: Record<string, DailyLog>;
}

const StatsView: React.FC<StatsViewProps> = ({ logs }) => {
  const stats: Stats = useMemo(() => {
    // Sort logs by date
    const logArray = (Object.values(logs) as DailyLog[]).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Helper to check if a log is "Sick"
    const isSick = (log: DailyLog) =>
      (log.symptoms && log.symptoms.length > 0) ||
      (log.temperatures && log.temperatures.length > 0);

    let totalSickDays = 0;
    let episodesCount = 0;
    const commonSymptoms: Record<string, number> = {};
    const episodeDurations: number[] = [];
    const episodeStartDates: string[] = [];

    // Temporary trackers
    let currentEpisodeDuration = 0;
    let inEpisode = false;
    let lastSickDate: Date | null = null;

    for (let i = 0; i < logArray.length; i++) {
      const log = logArray[i];

      // Skip if this log doesn't count as sick
      if (!isSick(log)) continue;

      totalSickDays++;

      // Symptoms Stats
      if (log.symptoms) {
        log.symptoms.forEach((s) => {
          commonSymptoms[s] = (commonSymptoms[s] || 0) + 1;
        });
      }

      const currentDate = new Date(log.date);

      if (!inEpisode) {
        // Start new episode
        inEpisode = true;
        episodesCount++;
        currentEpisodeDuration = 1;
        episodeStartDates.push(log.date);
      } else {
        // Check if this log is consecutive to the last one (allow 1 day diff)
        if (lastSickDate) {
          const diffTime = Math.abs(
            currentDate.getTime() - lastSickDate.getTime()
          );
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 1) {
            // Continuation
            currentEpisodeDuration++;
          } else {
            // Gap detected, close previous episode and start new
            episodeDurations.push(currentEpisodeDuration);

            inEpisode = true;
            episodesCount++;
            currentEpisodeDuration = 1;
            episodeStartDates.push(log.date);
          }
        }
      }
      lastSickDate = currentDate;
    }

    // Push the last episode duration if active
    if (inEpisode) {
      episodeDurations.push(currentEpisodeDuration);
    }

    const avgDuration =
      episodeDurations.length > 0
        ? episodeDurations.reduce((a, b) => a + b, 0) /
          episodeDurations.length
        : 0;

    // MTBF (Mean Time Between Illnesses)
    let sumGaps = 0;
    let gapCount = 0;

    if (episodeStartDates.length > 1) {
      for (let i = 0; i < episodeStartDates.length - 1; i++) {
        const d1 = new Date(episodeStartDates[i]);
        const d2 = new Date(episodeStartDates[i + 1]);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        sumGaps += diffDays;
        gapCount++;
      }
    }

    const mtbf = gapCount > 0 ? sumGaps / gapCount : 0;

    return {
      totalSickDays,
      episodesCount,
      averageDuration: Math.round(avgDuration * 10) / 10,
      meanTimeBetweenIllness: Math.round(mtbf),
      commonSymptoms,
    };
  }, [logs]);

  const topSymptom = Object.entries(stats.commonSymptoms).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Episodes Card */}
        <View style={[styles.statCard, styles.orangeCard]}>
          <Text style={styles.statLabel}>Episodes</Text>
          <Text style={styles.statValue}>{stats.episodesCount}</Text>
        </View>

        {/* Total Sick Days Card */}
        <View style={[styles.statCard, styles.redCard]}>
          <Text style={styles.statLabel}>Total Sick Days</Text>
          <Text style={styles.statValue}>{stats.totalSickDays}</Text>
        </View>
      </View>

      {/* Detailed Stats Card */}
      <View style={styles.detailedCard}>
        <Text style={styles.cardTitle}>Detailed Stats</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Avg. Duration</Text>
            <Text style={styles.statRowValue}>
              {stats.averageDuration} days
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Mean Time Between Illness</Text>
            <Text style={styles.statRowValue}>
              {stats.meanTimeBetweenIllness > 0
                ? `${stats.meanTimeBetweenIllness} days`
                : '-'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Most Common Symptom</Text>
            <Text style={styles.statRowValue}>
              {topSymptom ? topSymptom[0] : '-'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  orangeCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FECB81',
  },
  redCard: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FEE2E2',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#78350F',
    marginTop: 8,
  },
  detailedCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsContainer: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statRowLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});

export default StatsView;
