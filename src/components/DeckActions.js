import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import colors from '../theme/colors';

function ActionButton({ size = 64, borderColor, icon, iconColor, onPress }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={{ color: '#00000022', borderless: true }}
        style={[styles.btnBase, { width: size, height: size, borderRadius: size / 2, borderColor }]}
      >
        <Ionicons name={icon} size={size > 80 ? 30 : 24} color={iconColor} />
      </Pressable>
    </Animated.View>
  );
}

export default function DeckActions({ onPass, onSuper, onLike }) {
  return (
    <View style={styles.row}>
      <ActionButton size={56} borderColor={colors.danger} icon="close" iconColor={colors.danger} onPress={onPass} />
      <ActionButton size={80} borderColor={colors.success} icon="heart" iconColor={colors.success} onPress={onLike} />
      <ActionButton size={56} borderColor={colors.accent} icon="star" iconColor={colors.accent} onPress={onSuper} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 12 },
  btnBase: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardBg, borderWidth: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
});
