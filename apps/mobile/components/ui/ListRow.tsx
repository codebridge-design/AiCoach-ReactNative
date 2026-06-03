import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Font } from '../../constants/typography';
import { Icon, IconName } from './Icon';
import { useTheme } from '../../lib/theme';

type IconTone = 'neutral' | 'success' | 'accent' | 'amber';

interface ListRowProps {
  icon?: IconName;
  iconTone?: IconTone;
  title: string;
  sub?: string;
  meta?: string;
  metaTone?: 'fg' | 'muted' | 'success' | 'amber';
  onPress?: () => void;
  last?: boolean;
  trailing?: React.ReactNode;
}

export function ListRow({ icon, iconTone = 'neutral', title, sub, meta, metaTone = 'fg', onPress, last, trailing }: ListRowProps) {
  const theme = useTheme();

  const ICON_STYLES: Record<IconTone, { bg: string; color: string }> = {
    neutral: { bg: theme.elevated,  color: theme.blue700 },
    success: { bg: theme.greenSoft, color: theme.green },
    accent:  { bg: theme.accentSoft, color: theme.blue700 },
    amber:   { bg: theme.amberSoft,  color: theme.amber },
  };

  const ic = ICON_STYLES[iconTone];
  const metaColor = metaTone === 'muted' ? theme.fgMuted
    : metaTone === 'success' ? theme.green
    : metaTone === 'amber' ? theme.amber
    : theme.fg;

  const inner = (
    <View style={[styles.row, { backgroundColor: theme.surface }, !last && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: ic.bg }]}>
          <Icon name={icon} size={19} color={ic.color} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.fg }]}>{title}</Text>
        {sub && <Text style={[styles.sub, { color: theme.fgMuted }]}>{sub}</Text>}
      </View>
      {trailing != null ? trailing : (
        meta != null
          ? <Text style={[styles.meta, { color: metaColor }]}>{meta}</Text>
          : onPress ? <Icon name="chevR" size={16} color={theme.fgMuted} /> : null
      )}
    </View>
  );

  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{inner}</TouchableOpacity> : inner;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 14 },
  iconWrap: { width: 38, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  content: { flex: 1, minWidth: 0 },
  title: { fontFamily: Font.semiBold, fontSize: 15, lineHeight: 20 },
  sub: { fontFamily: Font.regular, fontSize: 13, marginTop: 2, lineHeight: 18 },
  meta: { fontFamily: Font.bold, fontSize: 14 },
});
