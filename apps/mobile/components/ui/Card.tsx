import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, padding = 16, style, onPress }: CardProps) {
  const theme = useTheme();
  const content = (
    <View style={[{ backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding }, style]}>
      {children}
    </View>
  );
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{content}</TouchableOpacity>;
  return content;
}
