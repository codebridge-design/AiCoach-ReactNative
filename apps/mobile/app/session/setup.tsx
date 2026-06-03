import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Font } from '../../constants/typography';
import { Icon, IconName } from '../../components/ui/Icon';
import { Chip } from '../../components/ui/Chip';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiPost } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../lib/theme';
import type { Question, TopicKey, SessionMode } from '@mockly/shared';

const MODES = [
  { key: 'text' as SessionMode, name: 'Text', icon: 'message' as IconName, desc: 'Type your answers at your own pace', meta: '8 questions · ~15 min' },
  { key: 'voice' as SessionMode, name: 'Voice', icon: 'mic' as IconName, desc: 'Speak answers aloud, AI transcribes', meta: '6 questions · ~20 min' },
  { key: 'rapid' as SessionMode, name: 'Rapid Drill', icon: 'zap' as IconName, desc: 'Fast-fire concepts, short answers', meta: '12 questions · ~7 min' },
];

const TOPICS: { key: TopicKey; label: string }[] = [
  { key: 'react', label: 'React' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'react_native', label: 'React Native' },
  { key: 'system_design', label: 'System Design' },
  { key: 'behavioral', label: 'Behavioral' },
  { key: 'mixed', label: 'Mixed' },
];

export default function SetupScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useAuthStore();
  const [mode, setMode] = useState<SessionMode>('text');
  const [topic, setTopic] = useState<TopicKey>('react');
  const [count, setCount] = useState(8);
  const [starting, setStarting] = useState(false);

  const roleDisplay = profile?.role === 'react_native' ? 'React Native' :
    profile ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : '…';
  const levelDisplay = profile ? profile.level.charAt(0).toUpperCase() + profile.level.slice(1) : '…';

  async function startSession() {
    setStarting(true);
    try {
      const res = await apiPost<{ session_id: string; first_question: Question }>('/api/sessions', { mode, topic });
      router.push({
        pathname: '/session/[id]',
        params: {
          id: res.session_id,
          mode,
          topic,
          count: String(count),
          firstQuestion: JSON.stringify(res.first_question),
        },
      });
    } catch {
      Alert.alert('Error', 'Failed to start session. Please check your connection.');
      setStarting(false);
    }
  }

  return (
    <View style={[styles.outer, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icon name="x" size={20} color={theme.fg} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.fg }]}>New Session</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.targetBanner, { backgroundColor: theme.accentSoft }]}>
          <Icon name="target" size={17} color={theme.blue700} />
          <Text style={[styles.targetText, { color: theme.fg }]}>
            Tuned for <Text style={[styles.targetBold, { color: theme.fg }]}>{levelDisplay} {roleDisplay}</Text> — difficulty adapts to your answers
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.fgMuted }]}>MODE</Text>
        <View style={styles.modeList}>
          {MODES.map(m => {
            const on = mode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                onPress={() => setMode(m.key)}
                style={[
                  styles.modeCard,
                  { backgroundColor: theme.surface, borderColor: on ? theme.blue700 : theme.border },
                  on && styles.modeCardActive,
                ]}
              >
                <View style={[styles.modeIcon, { backgroundColor: on ? '#1B448B' : theme.elevated }]}>
                  <Icon name={m.icon} size={21} color={on ? '#FFFFFF' : theme.blue700} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeName, { color: theme.fg }]}>{m.name}</Text>
                  <Text style={[styles.modeDesc, { color: theme.fgMuted }]}>{m.desc}</Text>
                </View>
                <View style={[styles.radio, { borderColor: on ? theme.blue700 : theme.borderMuted }, on && styles.radioActive]}>
                  {on && <Icon name="check" size={13} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.fgMuted }]}>TOPIC</Text>
        <View style={styles.chipRow}>
          {TOPICS.map(t => <Chip key={t.key} active={topic === t.key} onPress={() => setTopic(t.key)}>{t.label}</Chip>)}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.fgMuted }]}>QUESTIONS</Text>
        <Card padding={14}>
          <View style={styles.countRow}>
            <View>
              <Text style={[styles.countNum, { color: theme.fg }]}>{count}</Text>
              <Text style={[styles.countEst, { color: theme.fgMuted }]}>≈ {Math.round(count * 1.8)} min</Text>
            </View>
            <View style={styles.steppers}>
              <TouchableOpacity
                style={[styles.stepBtn, { borderColor: theme.borderMuted, backgroundColor: theme.surface }, count <= 5 && styles.stepBtnDisabled]}
                onPress={() => setCount(c => Math.max(5, c - 1))}
                disabled={count <= 5}
              >
                <Icon name="minus" size={20} color={theme.blue700} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stepBtn, { borderColor: theme.borderMuted, backgroundColor: theme.surface }, count >= 15 && styles.stepBtnDisabled]}
                onPress={() => setCount(c => Math.min(15, c + 1))}
                disabled={count >= 15}
              >
                <Icon name="plus" size={20} color={theme.blue700} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
        {starting ? (
          <View style={styles.loadingBtn}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.loadingBtnText}>Starting…</Text>
          </View>
        ) : (
          <Button full size="lg" leadingIcon="play" onPress={startSession}>
            Start Interview
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  header: { borderBottomWidth: 1, paddingTop: 56, paddingBottom: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  closeBtn: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: Font.bold, fontSize: 17 },
  body: { padding: 16, gap: 0, paddingBottom: 8 },
  targetBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 18 },
  targetText: { flex: 1, fontFamily: Font.regular, fontSize: 13 },
  targetBold: { fontFamily: Font.bold },
  sectionLabel: { fontFamily: Font.bold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.66, marginBottom: 10, marginTop: 6 },
  modeList: { gap: 10, marginBottom: 22 },
  modeCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  modeCardActive: { shadowColor: '#1B448B', shadowOpacity: 0.16, shadowRadius: 5, shadowOffset: { width: 0, height: 0 }, elevation: 2 },
  modeIcon: { width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modeName: { fontFamily: Font.bold, fontSize: 15 },
  modeDesc: { fontFamily: Font.regular, fontSize: 12.5, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioActive: { backgroundColor: '#1B448B', borderColor: '#1B448B' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countNum: { fontFamily: Font.extraBold, fontSize: 26 },
  countEst: { fontFamily: Font.regular, fontSize: 12 },
  steppers: { flexDirection: 'row', gap: 8 },
  stepBtn: { width: 44, height: 44, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.4 },
  footer: { padding: 16, borderTopWidth: 1 },
  loadingBtn: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#1B448B', borderRadius: 10 },
  loadingBtnText: { fontFamily: Font.semiBold, fontSize: 16, color: '#FFFFFF' },
});
