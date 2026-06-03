import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Font } from '../../constants/typography';
import { Icon, IconName } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { ListRow } from '../../components/ui/ListRow';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAnalyticsSummary } from '../../lib/hooks';
import { useTheme } from '../../lib/theme';

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

function MiniStat({ icon, tone, value, label }: { icon: IconName; tone: 'amber' | 'success' | 'accent'; value: string | number; label: string }) {
  const theme = useTheme();
  const col = tone === 'amber' ? theme.amber : tone === 'success' ? theme.green : theme.blue700;
  const bg = tone === 'amber' ? theme.amberSoft : tone === 'success' ? theme.greenSoft : theme.accentSoft;
  return (
    <View style={[styles.miniStat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.miniIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={17} color={col} fill={icon === 'flame'} />
      </View>
      <Text style={[styles.miniValue, { color: theme.fg }]}>{value}</Text>
      <Text style={[styles.miniLabel, { color: theme.fgMuted }]}>{label}</Text>
    </View>
  );
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.toggleRow, { backgroundColor: theme.surface }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: theme.fg }]}>{label}</Text>
        {sub && <Text style={[styles.toggleSub, { color: theme.fgMuted }]}>{sub}</Text>}
      </View>
      <Switch
        value={value} onValueChange={onChange}
        trackColor={{ false: theme.borderMuted, true: theme.green }}
        thumbColor={theme.white}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, profile, signOut } = useAuthStore();
  const { notificationsEnabled, setNotifications } = useSettingsStore();
  const summary = useAnalyticsSummary();

  const name = profile?.full_name ?? '—';
  const email = user?.email ?? '—';
  const initials = getInitials(profile?.full_name ?? null);
  const role = profile ? roleLabel(profile.role) : '—';
  const level = profile ? levelLabel(profile.level) : '—';
  const streak = summary.data?.streak ?? profile?.streak_count ?? 0;
  const avgScore = summary.data?.avg_score ?? 0;

  return (
    <ScrollView style={[styles.outer, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Navy hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Profile</Text>
        <View style={styles.heroBody}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroEmail}>{email}</Text>
            <View style={styles.badgeRow}>
              <Badge tone="onDark">{role}</Badge>
              <Badge tone="onDark">{level}</Badge>
            </View>
          </View>
        </View>
      </View>

      {/* Mini stats */}
      <View style={styles.miniStats}>
        <MiniStat icon="flame" tone="amber" value={streak} label="Day streak" />
        <MiniStat icon="trend" tone="success" value={avgScore.toFixed(1)} label="Avg score" />
      </View>

      <SectionHeader>Interview target</SectionHeader>
      <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ListRow icon="user" iconTone="accent" title="Role" meta={role} metaTone="muted" onPress={() => router.push('/settings' as any)} />
        <ListRow icon="layers" iconTone="accent" title="Level" meta={level} metaTone="muted" onPress={() => router.push('/settings' as any)} last />
      </View>

      <SectionHeader>Practice</SectionHeader>
      <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ToggleRow
          label="Daily reminder"
          sub="Every day at 9:00 AM"
          value={notificationsEnabled}
          onChange={setNotifications}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ListRow icon="book" title="Question bank" sub="Browse questions" onPress={() => router.push('/questions-bank' as any)} last />
      </View>

      <SectionHeader>Account</SectionHeader>
      <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ListRow icon="settings" title="Settings" onPress={() => router.push('/settings' as any)} />
        <ListRow icon="logout" title="Sign out" onPress={signOut} last />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  content: { paddingBottom: 32 },
  hero: { backgroundColor: '#1B448B', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  heroTitle: { fontFamily: Font.bold, fontSize: 22, color: '#FFFFFF', marginBottom: 18 },
  heroBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Font.bold, fontSize: 22, color: '#FFFFFF' },
  heroName: { fontFamily: Font.bold, fontSize: 18, color: '#FFFFFF' },
  heroEmail: { fontFamily: Font.regular, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  miniStats: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  miniStat: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center', gap: 6 },
  miniIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  miniValue: { fontFamily: Font.extraBold, fontSize: 18 },
  miniLabel: { fontFamily: Font.regular, fontSize: 11, textAlign: 'center' },
  group: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  divider: { height: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 13, paddingHorizontal: 14 },
  toggleLabel: { fontFamily: Font.semiBold, fontSize: 15 },
  toggleSub: { fontFamily: Font.regular, fontSize: 13, marginTop: 2 },
});
