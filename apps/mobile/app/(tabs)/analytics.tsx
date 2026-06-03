import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';
import { Font } from '../../constants/typography';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { scoreColor, scoreLabel } from '../../lib/score';
import { useAnalyticsSummary, useAnalyticsHistory, useWeakTopics } from '../../lib/hooks';
import { useTheme } from '../../lib/theme';

const TOPIC_LABELS: Record<string, string> = {
  react: 'React', javascript: 'JavaScript', react_native: 'React Native',
  system_design: 'System Design', behavioral: 'Behavioral', mixed: 'Mixed',
};
const TOPIC_ICONS: Record<string, string> = {
  react: 'code', javascript: 'zap', react_native: 'layers',
  system_design: 'target', behavioral: 'message', mixed: 'sparkle',
};

function HeroStat({ value, label }: { value: string | number; label: string }) {
  return (
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TrendChart({ data }: { data: number[] }) {
  const theme = useTheme();
  if (data.length < 2) return null;
  const W = 300, H = 110, pad = 8;
  const min = 0, max = 10;
  const xs = data.map((_, i) => pad + (i * (W - pad * 2)) / (data.length - 1));
  const ys = data.map(v => pad + (1 - (v - min) / (max - min)) * (H - pad * 2));
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${line} L${xs[xs.length - 1].toFixed(1)},${H - pad} L${xs[0].toFixed(1)},${H - pad} Z`;
  const last = data[data.length - 1];
  const lx = xs[xs.length - 1];
  const ly = ys[ys.length - 1];
  const areaFill = theme.isDark ? 'rgba(75,174,232,0.14)' : 'rgba(1,89,166,0.10)';

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      {[2.5, 5, 7.5].map(g => {
        const y = pad + (1 - g / 10) * (H - pad * 2);
        return <Line key={g} x1={pad} y1={y} x2={W - pad} y2={y} stroke={theme.border} strokeWidth="1" strokeDasharray="3 4" />;
      })}
      <Path d={area} fill={areaFill} />
      <Path d={line} fill="none" stroke={theme.blue700} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <Circle key={i} cx={x} cy={ys[i]} r={i === data.length - 1 ? 4.5 : 3}
          fill={i === data.length - 1 ? theme.blue700 : theme.surface}
          stroke={theme.blue700} strokeWidth="2" />
      ))}
      <Rect x={lx - 18} y={ly - 26} width="36" height="19" rx="5" fill="#1B448B" />
      <SvgText x={lx} y={ly - 13} textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFFFF">{last.toFixed(1)}</SvgText>
    </Svg>
  );
}

export default function AnalyticsScreen() {
  const theme = useTheme();
  const summary = useAnalyticsSummary();
  const history = useAnalyticsHistory(30);
  const weakTopics = useWeakTopics();

  const readiness = summary.data?.readiness_score ?? 0;
  const avgScore = summary.data?.avg_score ?? 0;
  const streak = summary.data?.streak ?? 0;
  const sessionsTotal = summary.data?.sessions_count ?? 0;

  const trendData = (history.data ?? [])
    .filter(s => s.avg_score != null)
    .map(s => s.avg_score as number);

  const topics = weakTopics.data ?? [];
  const isLoading = summary.isLoading || history.isLoading || weakTopics.isLoading;

  if (isLoading) {
    return (
      <View style={[styles.outer, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={theme.blue700} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.outer, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Navy hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Progress</Text>
        <View style={styles.heroBody}>
          <ScoreRing
            value={readiness} max={100} size={104} stroke={10} color="#5BC98A"
            label={<Text style={styles.ringNum}>{readiness}</Text>}
            sub={<Text style={styles.ringSub}>READY</Text>}
          />
          <View style={styles.statsGrid}>
            <HeroStat value={avgScore.toFixed(1)} label="Avg score" />
            <HeroStat value={streak} label="Day streak" />
            <HeroStat value={sessionsTotal} label="Sessions" />
          </View>
        </View>
      </View>

      {trendData.length >= 2 && (
        <>
          <SectionHeader>Score over time</SectionHeader>
          <View style={styles.chartSection}>
            <Card padding={16}>
              <TrendChart data={trendData} />
              <View style={styles.chartLabels}>
                <Text style={[styles.chartLabel, { color: theme.fgMuted }]}>{trendData.length} sessions ago</Text>
                <Text style={[styles.chartLabel, { color: theme.fgMuted }]}>Latest</Text>
              </View>
            </Card>
          </View>
        </>
      )}

      {topics.length > 0 && (
        <>
          <SectionHeader>Topic mastery</SectionHeader>
          <View style={styles.topicsSection}>
            {[...topics].sort((a, b) => b.avg_score - a.avg_score).map(t => {
              const col = scoreColor(t.avg_score);
              const icon = TOPIC_ICONS[t.name] ?? 'code';
              return (
                <Card key={t.name} padding={14} style={styles.topicCard}>
                  <View style={styles.topicHeader}>
                    <View style={[styles.topicIcon, { backgroundColor: col + '22' }]}>
                      <Icon name={icon as any} size={18} color={col} />
                    </View>
                    <View style={styles.topicMid}>
                      <Text style={[styles.topicName, { color: theme.fg }]}>{TOPIC_LABELS[t.name] ?? t.name}</Text>
                      <Text style={[styles.topicMeta, { color: theme.fgMuted }]}>{t.count} questions · {scoreLabel(t.avg_score)}</Text>
                    </View>
                    <Text style={[styles.topicScore, { color: col }]}>{t.avg_score.toFixed(1)}</Text>
                  </View>
                  <View style={[styles.topicTrack, { backgroundColor: theme.elevated }]}>
                    <View style={[styles.topicFill, { width: `${t.avg_score * 10}%` as any, backgroundColor: col }]} />
                  </View>
                </Card>
              );
            })}
          </View>
        </>
      )}

      {topics.length === 0 && trendData.length < 2 && (
        <View style={styles.emptyWrap}>
          <Icon name="trend" size={36} color={theme.borderMuted} />
          <Text style={[styles.emptyTitle, { color: theme.fgMuted }]}>No data yet</Text>
          <Text style={[styles.emptySub, { color: theme.fgMuted }]}>Complete a session to see your progress</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  content: { paddingBottom: 32 },
  hero: { backgroundColor: '#1B448B', paddingTop: 56, paddingBottom: 22, paddingHorizontal: 20 },
  heroTitle: { fontFamily: Font.bold, fontSize: 22, color: '#FFFFFF', marginBottom: 18 },
  heroBody: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ringNum: { fontFamily: Font.extraBold, fontSize: 30, color: '#FFFFFF', lineHeight: 32 },
  ringSub: { fontFamily: Font.semiBold, fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginTop: 2 },
  statsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 14 },
  statValue: { fontFamily: Font.extraBold, fontSize: 20, color: '#FFFFFF', lineHeight: 22 },
  statLabel: { fontFamily: Font.regular, fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  chartSection: { paddingHorizontal: 16 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  chartLabel: { fontFamily: Font.regular, fontSize: 11 },
  topicsSection: { paddingHorizontal: 16, gap: 10 },
  topicCard: {},
  topicHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  topicIcon: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  topicMid: { flex: 1 },
  topicName: { fontFamily: Font.bold, fontSize: 15 },
  topicMeta: { fontFamily: Font.regular, fontSize: 12, marginTop: 1 },
  topicScore: { fontFamily: Font.extraBold, fontSize: 18 },
  topicTrack: { height: 7, borderRadius: 999, overflow: 'hidden' },
  topicFill: { height: '100%', borderRadius: 999 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: Font.bold, fontSize: 17 },
  emptySub: { fontFamily: Font.regular, fontSize: 13.5 },
});
