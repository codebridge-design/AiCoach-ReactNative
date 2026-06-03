import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Font } from '../constants/typography';
import { Icon } from '../components/ui/Icon';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { apiPatch } from '../lib/api';
import { queryClient } from '../lib/queryClient';
import { useTheme } from '../lib/theme';
import type { Profile, UserRole, DifficultyLevel } from '@mockly/shared';

const ROLES: { key: UserRole; label: string }[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'react_native', label: 'React Native' },
  { key: 'general', label: 'General' },
];

const LEVELS: { key: DifficultyLevel; label: string }[] = [
  { key: 'junior', label: 'Junior' },
  { key: 'middle', label: 'Middle' },
  { key: 'senior', label: 'Senior' },
];

function OptionRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={styles.optionRow}>
      <Text style={[styles.optionLabel, { color: selected ? theme.blue700 : theme.fg }]}>{label}</Text>
      {selected && <Icon name="check" size={18} color={theme.blue700} strokeWidth={2.5} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile, setProfile } = useAuthStore();
  const { notificationsEnabled, setNotifications, darkMode, setDarkMode } = useSettingsStore();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [role, setRole] = useState<UserRole>(profile?.role ?? 'frontend');
  const [level, setLevel] = useState<DifficultyLevel>(profile?.level ?? 'middle');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name ?? '');
      setRole(profile.role);
      setLevel(profile.level);
    }
  }, [profile]);

  const isDirty =
    name.trim() !== (profile?.full_name ?? '') ||
    role !== profile?.role ||
    level !== profile?.level;

  async function save() {
    setSaving(true);
    try {
      const res = await apiPatch<{ profile: Profile }>('/api/auth/profile', {
        full_name: name.trim() || undefined,
        role,
        level,
      });
      setProfile(res.profile);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.outer, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="chevL" size={22} color={theme.fg} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.fg }]}>Settings</Text>
        <TouchableOpacity
          onPress={save}
          disabled={!isDirty || saving}
          style={[styles.saveBtn, (!isDirty || saving) && styles.saveBtnDisabled]}
        >
          {saving
            ? <ActivityIndicator color={theme.blue700} size="small" />
            : <Text style={[styles.saveBtnText, { color: (!isDirty || saving) ? theme.fgMuted : theme.blue700 }]}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader>Profile</SectionHeader>
        <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: theme.fgMuted }]}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.fgMuted}
              style={[styles.textInput, { borderColor: theme.border, backgroundColor: theme.elevated, color: theme.fg }]}
              autoCapitalize="words"
            />
          </View>
        </View>

        <SectionHeader>Role</SectionHeader>
        <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {ROLES.map((r, i) => (
            <React.Fragment key={r.key}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              <OptionRow label={r.label} selected={role === r.key} onPress={() => setRole(r.key)} />
            </React.Fragment>
          ))}
        </View>

        <SectionHeader>Level</SectionHeader>
        <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {LEVELS.map((l, i) => (
            <React.Fragment key={l.key}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              <OptionRow label={l.label} selected={level === l.key} onPress={() => setLevel(l.key)} />
            </React.Fragment>
          ))}
        </View>

        <SectionHeader>Practice</SectionHeader>
        <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: theme.fg }]}>Daily reminder</Text>
              <Text style={[styles.toggleSub, { color: theme.fgMuted }]}>Every day at 9:00 AM</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotifications}
              trackColor={{ false: theme.borderMuted, true: theme.green }}
              thumbColor={theme.white}
            />
          </View>
        </View>

        <SectionHeader>Appearance</SectionHeader>
        <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: theme.fg }]}>Dark mode</Text>
              <Text style={[styles.toggleSub, { color: theme.fgMuted }]}>Switch to dark color scheme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: theme.borderMuted, true: theme.green }}
              thumbColor={theme.white}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  header: { borderBottomWidth: 1, paddingTop: 56, paddingBottom: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: Font.bold, fontSize: 17 },
  saveBtn: { minWidth: 50, height: 36, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontFamily: Font.bold, fontSize: 15 },
  content: { paddingBottom: 40 },
  group: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  divider: { height: 1, marginLeft: 14 },
  fieldRow: { padding: 14 },
  fieldLabel: { fontFamily: Font.semiBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  textInput: { fontFamily: Font.regular, fontSize: 16, borderWidth: 1, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14 },
  optionLabel: { fontFamily: Font.semiBold, fontSize: 15 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 13, paddingHorizontal: 14 },
  toggleLabel: { fontFamily: Font.semiBold, fontSize: 15 },
  toggleSub: { fontFamily: Font.regular, fontSize: 13, marginTop: 2 },
});
