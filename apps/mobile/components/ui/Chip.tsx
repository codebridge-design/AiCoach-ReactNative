import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Font } from '../../constants/typography';
import { useTheme } from '../../lib/theme';

interface ChipProps {
  active?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}

export function Chip({ active, onPress, children }: ChipProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? theme.blue800 : theme.surface, borderColor: active ? theme.blue800 : theme.borderMuted },
      ]}
    >
      <Text style={[styles.text, { color: active ? theme.white : theme.fg }]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: { height: 34, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontFamily: Font.semiBold, fontSize: 13 },
});
