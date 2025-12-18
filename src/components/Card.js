import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function Card({ item, role, onboarded, onLongPress, onPress, onShowMore }) {
  const [hoverMore, setHoverMore] = useState(false);
  const [focusMore, setFocusMore] = useState(false);
  return (
    <Pressable style={styles.card} onLongPress={onLongPress} onPress={() => onPress && onPress(item)}>
      <View style={styles.mediaWrap}>
        {item.logoUrl ? <Image source={{ uri: item.logoUrl }} style={styles.image} /> : null}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={styles.gradient} />
        {item.urgencyLevel ? <View style={[styles.badge, styles.badgeUrgent]}><Text style={styles.badgeText}>Active</Text></View> : null}
        {item.boosted ? <View style={[styles.badge, styles.badgeBoost]}><Text style={styles.badgeText}>Recently Active</Text></View> : null}
        {item.applicantsCount !== undefined ? (
          <View style={styles.badgeCount}>
            <Ionicons name="people" size={12} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>{item.applicantsCount} applied</Text>
          </View>
        ) : null}
        <View style={styles.bottomBar}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            {role ? (
              <View style={styles.rolePill}>
                <Ionicons name={role === 'candidate' ? 'briefcase' : 'person'} size={14} color="#fff" />
                <Text style={styles.rolePillText}> {role === 'candidate' ? (item.company || 'Company') : (!onboarded ? 'Recruitor' : (item.name || item.title || 'Candidate'))}</Text>
              </View>
            ) : null}
          </View>
          <ScrollView
            horizontal
            style={styles.chipsRow}
            contentContainerStyle={styles.chipsRowContent}
            showsHorizontalScrollIndicator={false}
            accessible
            accessibilityRole="scrollbar"
            accessibilityLabel="Skills row"
          >
            {(item.skills || []).slice(0, 3).map((s, idx) => (
              <View key={idx} style={styles.chip}>
                <Ionicons name="pricetag" size={12} color="#666" />
                <Text style={styles.chipText}> {s}</Text>
              </View>
            ))}
            {Array.isArray(item.skills) && item.skills.length > 3 ? (
              <Pressable
                style={[styles.chip, hoverMore && styles.chipHover, focusMore && styles.chipFocus]}
                accessible accessibilityRole="button" accessibilityLabel="Show more skills"
                onPress={() => onShowMore && onShowMore(item)}
                onHoverIn={() => setHoverMore(true)}
                onHoverOut={() => setHoverMore(false)}
                onFocus={() => setFocusMore(true)}
                onBlur={() => setFocusMore(false)}
              >
                <Ionicons name="list" size={12} color="#666" />
                <Text style={styles.chipText}> (+more...)</Text>
              </Pressable>
            ) : null}
            {item.salaryMax ? (
              <View style={styles.chip}>
                <Ionicons name="cash" size={12} color="#666" />
                <Text style={styles.chipText}> up to {item.salaryMax}</Text>
              </View>
            ) : null}
            {item.experience ? (
              <View style={styles.chip}>
                <Ionicons name="briefcase" size={12} color="#666" />
                <Text style={styles.chipText}> {item.experience} yrs</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  mediaWrap: { position: 'relative', flex: 1 },
  image: { width: '100%', height: '100%', borderRadius: 16 },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#00000080', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeUrgent: { backgroundColor: colors.danger },
  badgeBoost: { backgroundColor: colors.primary },
  badgeCount: { position: 'absolute', top: 12, right: 12, backgroundColor: '#00000080', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bottomBar: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: '#00000044', padding: 12, borderRadius: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  chipsRow: { marginTop: 8 },
  chipsRowContent: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.chipBg },
  chipText: { fontSize: 12, color: colors.text },
  chipHover: { backgroundColor: '#ffffffee' },
  chipFocus: { borderWidth: 1, borderColor: '#ffffff', backgroundColor: '#ffffffee' },
  rolePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#00000055' },
  rolePillText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
