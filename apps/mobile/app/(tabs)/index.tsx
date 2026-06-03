import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Font } from '../../constants/typography';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { scoreColor } from '../../lib/score';
import { useAuthStore } from '../../stores/authStore';
import { useAnalyticsSummary, useSessions, useWeakTopics } from '../../lib/hooks';
import { useTheme } from '../../lib/theme';
import type { Session } from '@mockly/shared';

const TOPIC_LABELS: Record<string, string> = {
  react: 'React', javascript: 'JavaScript', react_native: 'React Native',
  system_design: 'System Design', behavioral: 'Behavioral', mixed: 'Mixed',
};
const MODE_ICON = { text: 'message', voice: 'mic', rapid: 'zap' } as const;

function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return `Today · ${time}`;
  if (diffDays === 1) return `Yesterday · ${time}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function roleLabel(role: string): string {
  const map: Record<string, string> = { frontend: 'Frontend', backend: 'Backend', react_native: 'React Native', general: 'General' };
  return map[role] ?? role;
}
function levelLabel(level: string): string {
  const map: Record<string, string> = { junior: 'Junior', middle: 'Middle', senior: 'Senior' };
  return map[level] ?? level;
}

function SessionRow({ session, last }: { session: Session; last: boolean }) {
  const theme = useTheme();
  const col = scoreColor(session.total_score ?? 0);
  const icon = MODE_ICON[session.mode as keyof typeof MODE_ICON] ?? 'message';
  return (
    <View style={[
      styles.sessionRow,
      !last && { borderBottomWidth: 1, borderBottomColor: theme.border },
    ]}>
      <View style={[styles.sessionIcon, { backgroundColor: theme.elevated }]}>
        <Icon name={icon} size={18} color={theme.blue700} />
      </View>
      <View style={styles.sessionMid}>
        <Text style={[styles.sessionTopic, { color: theme.fg }]}>{TOPIC_LABELS[session.topic] ?? session.topic}</Text>
        <Text style={[styles.sessionMeta, { color: theme.fgMuted }]}>
          {session.mode[0].toUpperCase() + session.mode.slice(1)} · {session.question_count} Q · {formatSessionDate(session.started_at)}
        </Text>
      </View>
      {session.total_score != null && (
        <View style={[styles.scorePill, { backgroundColor: col + '22' }]}>
          <Text style={[styles.scoreNum, { color: col }]}>{session.total_score.toFixed(1)}</Text>
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useAuthStore();
  const summary = useAnalyticsSummary();
  const sessions = useSessions(3);
  const weakTopics = useWeakTopics();

  const name = profile?.full_name ?? '—';
  const initials = getInitials(profile?.full_name ?? null);
  const role = profile ? roleLabel(profile.role) : '—';
  const level = profile ? levelLabel(profile.level) : '—';
  const readiness = summary.data?.readiness_score ?? 0;
  const streak = summary.data?.streak ?? 0;
  const avgScore = summary.data?.avg_score ?? 0;
  const weakest = weakTopics.data?.[0];

  return (
    <ScrollView style={[styles.outer, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Navy hero — identical in both modes, by design */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            <View>
              <Text style={styles.greeting}>Good morning</Text>
              <Text style={styles.name}>{name}</Text>
            </View>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.streakPill}>
              <Icon name="flame" size={16} color="#FFB454" fill />
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn}>
              <Icon name="bell" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.readinessRow}>
          <ScoreRing
            value={readiness} max={100} size={120} stroke={11} color="#5BC98A"
            label={<Text style={styles.ringNum}>{readiness}</Text>}
            sub={<Text style={styles.ringSub}>READY</Text>}
          />
          <View style={styles.readinessMeta}>
            <Text style={styles.readinessCaption}>Interview readiness</Text>
            <Text style={styles.readinessDesc}>
              You're getting there for{'\n'}
              <Text style={styles.readinessHighlight}>{level} {role}</Text> roles.
            </Text>
            <View style={styles.deltaRow}>
              <Icon name="trend" size={14} color="#7BE5A5" />
              <Text style={styles.deltaText}>{avgScore.toFixed(1)} avg score</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Start CTA card — floats over hero */}
      <View style={styles.ctaWrap}>
        <Card padding={16} style={[styles.ctaCard, { shadowOpacity: theme.isDark ? 0.4 : 0.12 }]}>
          <View style={styles.ctaTop}>
            <View style={[styles.ctaIcon, { backgroundColor: theme.accentSoft }]}>
              <Icon name="sparkle" size={22} color={theme.blue700} fill />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ctaTitle, { color: theme.fg }]}>Start a mock interview</Text>
              <Text style={[styles.ctaSub, { color: theme.fgMuted }]}>AI picks questions for your level</Text>
            </View>
          </View>
          <View style={{ marginTop: 14 }}>
            <TouchableOpacity style={styles.beginBtn} onPress={() => router.push('/session/setup')}>
              <Icon name="play" size={18} color="#FFFFFF" />
              <Text style={styles.beginBtnText}>Begin Session</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {/* Today's focus */}
      {weakest && (
        <>
          <SectionHeader>Today's focus</SectionHeader>
          <View style={styles.section}>
            <Card padding={0} onPress={() => router.push('/(tabs)/analytics')}>
              <View style={styles.focusRow}>
                <View style={[styles.focusIcon, { backgroundColor: theme.amberSoft }]}>
                  <Icon name="target" size={21} color={theme.amber} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.focusTopRow}>
                    <Text style={[styles.focusName, { color: theme.fg }]}>{TOPIC_LABELS[weakest.name] ?? weakest.name}</Text>
                    <Badge tone="amber">Weakest</Badge>
                  </View>
                  <Text style={[styles.focusSub, { color: theme.fgMuted }]}>
                    Avg {weakest.avg_score.toFixed(1)} across {weakest.count} questions — drill this next
                  </Text>
                </View>
                <Icon name="chevR" size={18} color={theme.fgMuted} />
              </View>
            </Card>
          </View>
        </>
      )}

      {/* Recent sessions */}
      <SectionHeader
        action={
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={[styles.seeAll, { color: theme.blue700 }]}>See all</Text>
          </TouchableOpacity>
        }
      >
        Recent sessions
      </SectionHeader>
      <View style={styles.section}>
        {sessions.isLoading ? (
          <ActivityIndicator color={theme.blue700} style={{ paddingVertical: 24 }} />
        ) : sessions.data && sessions.data.length > 0 ? (
          <View style={[styles.sessionList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {sessions.data.map((s, i) => (
              <SessionRow key={s.id} session={s} last={i === (sessions.data?.length ?? 0) - 1} />
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: theme.fgMuted }]}>No sessions yet — start your first interview!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  content: { paddingBottom: 32 },
  hero: { backgroundColor: '#1B448B', paddingTop: 56, paddingBottom: 56, paddingHorizontal: 20 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 38, height: 38, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Font.bold, fontSize: 14, color: '#FFFFFF' },
  greeting: { fontFamily: Font.regular, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 16 },
  name: { fontFamily: Font.bold, fontSize: 16, color: '#FFFFFF', marginTop: 2 },
  heroRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 34, paddingHorizontal: 11, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)' },
  streakNum: { fontFamily: Font.bold, fontSize: 14, color: '#FFFFFF' },
  bellBtn: { width: 34, height: 34, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ringNum: { fontFamily: Font.extraBold, fontSize: 34, color: '#FFFFFF', lineHeight: 36 },
  ringSub: { fontFamily: Font.semiBold, fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginTop: 3 },
  readinessMeta: { flex: 1 },
  readinessCaption: { fontFamily: Font.semiBold, fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5 },
  readinessDesc: { fontFamily: Font.bold, fontSize: 17, color: '#FFFFFF', lineHeight: 24, marginTop: 6 },
  readinessHighlight: { color: '#9FD5FF' },
  deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  deltaText: { fontFamily: Font.bold, fontSize: 13, color: '#7BE5A5' },
  ctaWrap: { paddingHorizontal: 16, marginTop: -36 },
  ctaCard: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowRadius: 12, elevation: 6 },
  ctaTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ctaIcon: { width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ctaTitle: { fontFamily: Font.bold, fontSize: 15 },
  ctaSub: { fontFamily: Font.regular, fontSize: 12.5, marginTop: 2 },
  beginBtn: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1B448B', borderRadius: 8 },
  beginBtnText: { fontFamily: Font.semiBold, fontSize: 16, color: '#FFFFFF' },
  section: { marginHorizontal: 16 },
  focusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  focusIcon: { width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  focusTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 },
  focusName: { fontFamily: Font.bold, fontSize: 15 },
  focusSub: { fontFamily: Font.regular, fontSize: 12.5, lineHeight: 17 },
  seeAll: { fontFamily: Font.semiBold, fontSize: 13 },
  sessionList: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 14 },
  sessionIcon: { width: 38, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sessionMid: { flex: 1, minWidth: 0 },
  sessionTopic: { fontFamily: Font.semiBold, fontSize: 15 },
  sessionMeta: { fontFamily: Font.regular, fontSize: 12.5, marginTop: 2 },
  scorePill: { minWidth: 44, height: 30, paddingHorizontal: 9, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontFamily: Font.extraBold, fontSize: 15 },
  emptyText: { fontFamily: Font.regular, fontSize: 14, textAlign: 'center', paddingVertical: 24 },
});
