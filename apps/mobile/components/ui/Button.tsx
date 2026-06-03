import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Font } from '../../constants/typography';
import { Icon, IconName } from './Icon';
import { useTheme, ThemeTokens } from '../../lib/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'light';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  full?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  style?: ViewStyle;
}

const SIZES = {
  sm: { height: 36, paddingH: 14, fontSize: 14 },
  md: { height: 48, paddingH: 20, fontSize: 16 },
  lg: { height: 54, paddingH: 24, fontSize: 17 },
};

function getVariants(theme: ThemeTokens) {
  return {
    primary:   { bg: theme.blue800, color: theme.white,   border: 'transparent' as const },
    secondary: { bg: theme.surface, color: theme.blue700, border: theme.borderMuted },
    ghost:     { bg: 'transparent', color: theme.blue700, border: 'transparent' as const },
    success:   { bg: theme.green,   color: theme.white,   border: 'transparent' as const },
    light:     { bg: theme.surface, color: theme.blue800, border: 'transparent' as const },
  };
}

export function Button({ variant = 'primary', size = 'md', children, onPress, disabled, full, leadingIcon, trailingIcon, style }: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const theme = useTheme();
  const s = SIZES[size];
  const v = getVariants(theme)[variant];
  const bgColor = pressed && !disabled
    ? variant === 'primary' ? theme.blue900
    : variant === 'success' ? '#176E3D'
    : theme.elevated
    : v.bg;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={0.85}
      style={[
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.paddingH,
          backgroundColor: bgColor,
          borderColor: v.border,
          borderWidth: v.border !== 'transparent' ? 1.5 : 0,
        },
        full && styles.full,
        disabled && styles.disabled,
        style,
      ]}
    >
      {leadingIcon && <Icon name={leadingIcon} size={18} color={v.color} />}
      <Text style={[styles.label, { color: v.color, fontSize: s.fontSize }]}>{children}</Text>
      {trailingIcon && <Icon name={trailingIcon} size={18} color={v.color} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8 },
  full: { width: '100%' },
  label: { fontFamily: Font.semiBold, lineHeight: 20 },
  disabled: { opacity: 0.4 },
});
