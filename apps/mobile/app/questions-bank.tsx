import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Font } from '../constants/typography';
import { Icon } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { Chip } from '../components/ui/Chip';
import { useQuestionBank } from '../hooks';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../lib/theme';
import type { Question, TopicKey } from '@mockly/shared';

const TOPIC_FILTERS: { key: TopicKey | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'react', label: 'React' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'react_native', label: 'React Native' },
  { key: 'system_design', label: 'System Design' },
  { key: 'behavioral', label: 'Behavioral' },
];

const CATEGORY_TONE: Record<string, 'success' | 'amber' | 'info'> = {
  technical: 'success',
  system_design: 'amber',
  behavioral: 'info',
};
const CATEGORY_LABEL: Record<string, string> = {
  technical: 'Technical',
  system_design: 'System Design',
  behavioral: 'Behavioral',
};

function QuestionRow({ question }: { question: Question }) {
  const theme = useTheme();
  const tone = CATEGORY_TONE[question.category] ?? 'success';
  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.rowTop}>
        <Badge tone={tone}>{CATEGORY_LABEL[question.category] ?? question.category}</Badge>
        {question.estimated_answer_minutes && (
          <Text style={[styles.minutes, { color: theme.fgMuted }]}>~{question.estimated_answer_minutes} min</Text>
        )}
      </View>
      <Text style={[styles.questionText, { color: theme.fg }]}>{question.text}</Text>
      {(question.key_concepts ?? []).length > 0 && (
        <View style={styles.concepts}>
          {(question.key_concepts ?? []).map(c => (
            <View key={c} style={[styles.conceptTag, { backgroundColor: theme.elevated }]}>
              <Text style={[styles.conceptText, { color: theme.fgMuted }]}>{c}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function QuestionBankScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useAuthStore();
  const [topic, setTopic] = useState<TopicKey | 'all'>('all');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; right: number } | null>(null);
  const infoRef = useRef<TouchableOpacity>(null);

  function openTooltip() {
    infoRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setTooltipPos({ top: py + height + 8, right: 12 });
      setTooltipVisible(true);
    });
  }

  const { data, isLoading, error } = useQuestionBank({
    topic: topic === 'all' ? undefined : topic,
    role: profile?.role,
    level: profile?.level,
    limit: 30,
  });

  const questions = data?.questions ?? [];
  const total = data?.total ?? 0;

  return (
    <View style={[styles.outer, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="chevL" size={22} color={theme.fg} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[styles.title, { color: theme.fg }]}>Question Bank</Text>
          {total > 0 && <Text style={[styles.count, { color: theme.fgMuted }]}>{total} questions</Text>}
        </View>
        <TouchableOpacity ref={infoRef} onPress={openTooltip} style={styles.backBtn}>
          <Icon name="info" size={22} color={tooltipVisible ? theme.blue700 : theme.fgMuted} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={tooltipVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipVisible(false)}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setTooltipVisible(false)} />
        {tooltipPos && (
          <View style={[tipStyles.bubble, { top: tooltipPos.top, right: tooltipPos.right, backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[tipStyles.arrow, { borderBottomColor: theme.surface }]} />
            <Text style={[tipStyles.line, { color: theme.fg }]}>
              <Text style={{ fontFamily: Font.semiBold }}>Auto-added: </Text>
              Score 7.0+ on an answer to save it automatically.
            </Text>
            <Text style={[tipStyles.line, { color: theme.fg }]}>
              <Text style={{ fontFamily: Font.semiBold }}>Bookmark: </Text>
              Tap the bookmark icon in session feedback to save manually.
            </Text>
          </View>
        )}
      </Modal>

      <View style={[styles.filtersWrap, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <FlatList
          data={TOPIC_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <Chip active={topic === item.key} onPress={() => setTopic(item.key as TopicKey | 'all')}>
              {item.label}
            </Chip>
          )}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.blue700} size="large" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.emptyWrap}>
          <Icon name="target" size={36} color={theme.borderMuted} />
          <Text style={[styles.emptyTitle, { color: theme.fgMuted }]}>Failed to load</Text>
          <Text style={[styles.emptySub, { color: theme.fgMuted }]}>Check your connection and try again</Text>
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="book" size={36} color={theme.borderMuted} />
          <Text style={[styles.emptyTitle, { color: theme.fgMuted }]}>No questions found</Text>
          <Text style={[styles.emptySub, { color: theme.fgMuted }]}>Try a different topic filter</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <QuestionRow question={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  header: { borderBottomWidth: 1, paddingTop: 56, paddingBottom: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1 },
  title: { fontFamily: Font.bold, fontSize: 18, textAlign: 'center' },
  count: { fontFamily: Font.regular, fontSize: 12, textAlign: 'center', marginTop: 1 },
  filtersWrap: { borderBottomWidth: 1, paddingVertical: 10 },
  filtersScroll: { paddingHorizontal: 16, gap: 7 },
  list: { padding: 16, paddingBottom: 32 },
  row: { borderRadius: 12, borderWidth: 1, padding: 14 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  minutes: { fontFamily: Font.regular, fontSize: 12 },
  questionText: { fontFamily: Font.semiBold, fontSize: 15, lineHeight: 22 },
  concepts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  conceptTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  conceptText: { fontFamily: Font.semiBold, fontSize: 11.5 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontFamily: Font.bold, fontSize: 17 },
  emptySub: { fontFamily: Font.regular, fontSize: 13.5 },
});

const tipStyles = StyleSheet.create({
  bubble: { position: 'absolute', width: 252, borderRadius: 10, borderWidth: 1, padding: 13, gap: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  arrow: { position: 'absolute', top: -8, right: 14, width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  line: { fontFamily: Font.regular, fontSize: 12.5, lineHeight: 18 },
});
