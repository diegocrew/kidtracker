import React, { useMemo } from 'react';
import { DailyLog, Stats } from '../types';

interface StatsViewProps {
  logs: Record<string, DailyLog>;
}

const StatsView: React.FC<StatsViewProps> = ({ logs }) => {
  const stats: Stats = useMemo(() => {
    // Sort logs by date
    const logArray = (Object.values(logs) as DailyLog[]).sort((a, b) => a.date.localeCompare(b.date));
    
    // Helper to check if a log is "Sick"
    const isSick = (log: DailyLog) => (log.symptoms && log.symptoms.length > 0) || (log.temperatures && log.temperatures.length > 0);

    let totalSickDays = 0;
    let episodesCount = 0;
    const commonSymptoms: Record<string, number> = {};
    const episodeDurations: number[] = [];
    const episodeStartDates: string[] = [];

    // Temporary trackers
    let currentEpisodeDuration = 0;
    let inEpisode = false;
    let lastSickDate: Date | null = null;

    // We need to iterate over all logs, but we also need to account for gaps.
    // However, our logArray only contains days where something was logged.
    // If there is a gap of >1 day between logs, it's a new episode.
    // Actually, even a 1 day gap means healthy. So consecutive days = same episode.
    
    // To do this robustly, let's iterate day by day? No, efficient way is to check date diff.

    for (let i = 0; i < logArray.length; i++) {
        const log = logArray[i];
        
        // Skip if this log doesn't count as sick (e.g. just a note or vitamin)
        if (!isSick(log)) continue;

        totalSickDays++;

        // Symptoms Stats
        if (log.symptoms) {
            log.symptoms.forEach(s => {
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
                const diffTime = Math.abs(currentDate.getTime() - lastSickDate.getTime());
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

    const avgDuration = episodeDurations.length > 0 
      ? episodeDurations.reduce((a, b) => a + b, 0) / episodeDurations.length 
      : 0;

    // MTBF (Mean Time Between Illnesses)
    // Average days between the START of episodes
    let sumGaps = 0;
    let gapCount = 0;
    
    if (episodeStartDates.length > 1) {
        for(let i = 0; i < episodeStartDates.length - 1; i++) {
            const d1 = new Date(episodeStartDates[i]);
            const d2 = new Date(episodeStartDates[i+1]);
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
      commonSymptoms
    };
  }, [logs]);

  const topSymptom = Object.entries(stats.commonSymptoms).sort((a,b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <p className="text-orange-600 text-xs font-semibold uppercase tracking-wider">Episodes</p>
          <p className="text-3xl font-bold text-orange-900 mt-1">{stats.episodesCount}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-red-600 text-xs font-semibold uppercase tracking-wider">Total Sick Days</p>
          <p className="text-3xl font-bold text-red-900 mt-1">{stats.totalSickDays}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
           Detailed Stats
        </h3>
        
        <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Avg. Duration</span>
                <span className="font-medium text-slate-800">{stats.averageDuration} days</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Mean Time Between Illness</span>
                <span className="font-medium text-slate-800">{stats.meanTimeBetweenIllness > 0 ? `${stats.meanTimeBetweenIllness} days` : '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 text-sm">Most Common Symptom</span>
                <span className="font-medium text-slate-800 capitalize">{topSymptom ? topSymptom[0] : '-'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
