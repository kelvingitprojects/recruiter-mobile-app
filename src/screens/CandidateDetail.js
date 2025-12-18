import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchCandidateById } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';

export default function CandidateDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, initial } = route.params || {};
  const { data, isLoading } = useQuery({ queryKey: ['candidate', id], queryFn: () => fetchCandidateById(id), enabled: !!id });
  const c = data || initial;
  if (!c) return <View style={styles.center}><Text>No candidate found.</Text></View>;
  const status = c.employmentStatus || (c.boosted ? 'Actively seeking' : 'Open to opportunities');
  const [tab, setTab] = useState('about');
  const coverUri = c.coverUrl || c.logoUrl || 'https://picsum.photos/1200/600?cover';
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.coverWrap}>
        <Image source={{ uri: coverUri }} style={styles.cover} />
        <LinearGradient colors={[ 'rgba(255,255,255,0.0)', 'rgba(255,255,255,0.9)' ]} style={styles.coverGradient} />
      </View>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{status}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Status">
          <Ionicons name="ellipse" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: c.logoUrl }} style={styles.avatar} />
          </View>
          <View style={styles.headerContent}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{c.name || c.title}</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            </View>
            <Text style={styles.subtitle}>{(c.skills || []).slice(0, 2).join(' / ')}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statTop}><Ionicons name="briefcase" size={14} color={colors.text} /><Text style={styles.statValue}> {c.projectsCount || '0'}</Text></View>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statTop}><Ionicons name="cash" size={14} color={colors.text} /><Text style={styles.statValue}> {c.totalEarnings || 'R 0'}</Text></View>
            <Text style={styles.statLabel}>Total earnings</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statTop}><Ionicons name="time" size={14} color={colors.text} /><Text style={styles.statValue}> {c.hourlyRate ? `R ${c.hourlyRate}` : 'Neg.'}</Text></View>
            <Text style={styles.statLabel}>Hourly rate</Text>
          </View>
        </View>
        <View style={styles.iconRow}>
          <View style={styles.iconBtn}><Ionicons name="link" size={18} color={colors.muted} /></View>
          <View style={styles.iconBtn}><Ionicons name="document" size={18} color={colors.muted} /></View>
          <View style={styles.iconBtn}><Ionicons name="images" size={18} color={colors.muted} /></View>
          <View style={styles.iconBtn}><Ionicons name="logo-github" size={18} color={colors.muted} /></View>
          <View style={styles.iconBtn}><Ionicons name="mail" size={18} color={colors.muted} /></View>
        </View>
      </View>
      <View style={styles.segments}>
        <Pressable accessible accessibilityRole="tab" accessibilityLabel="About me" onPress={() => setTab('about')} style={[styles.segment, tab === 'about' && styles.segmentActive]}><Ionicons name="information-circle" size={14} color={tab==='about' ? '#fff' : colors.text} /><Text style={[styles.segmentText, tab === 'about' && styles.segmentTextActive]}> About me</Text></Pressable>
        <Pressable accessible accessibilityRole="tab" accessibilityLabel="Projects" onPress={() => setTab('projects')} style={[styles.segment, tab === 'projects' && styles.segmentActive]}><Ionicons name="albums" size={14} color={tab==='projects' ? '#fff' : colors.text} /><Text style={[styles.segmentText, tab === 'projects' && styles.segmentTextActive]}> Projects</Text></Pressable>
        <Pressable accessible accessibilityRole="tab" accessibilityLabel="Reviews" onPress={() => setTab('reviews')} style={[styles.segment, tab === 'reviews' && styles.segmentActive]}><Ionicons name="chatbubbles" size={14} color={tab==='reviews' ? '#fff' : colors.text} /><Text style={[styles.segmentText, tab === 'reviews' && styles.segmentTextActive]}> Reviews</Text></Pressable>
      </View>
      {tab === 'about' ? (
        <View style={styles.card}>
          <Text style={styles.bodyText}>{c.bio || `Experienced professional with focus on ${(c.skills || []).join(', ') || '—'}. Passionate about shipping useful, clean products.`}</Text>
        </View>
      ) : null}
      {tab === 'projects' ? (
        <View style={styles.card}><Text style={styles.bodyText}>Projects coming soon.</Text></View>
      ) : null}
      {tab === 'reviews' ? (
        <View style={styles.card}><Text style={styles.bodyText}>Reviews coming soon.</Text></View>
      ) : null}
      <View style={styles.helpRow}><Ionicons name="thumbs-up" size={18} color={colors.primary} /><Text style={styles.label}>I can help with</Text></View>
      <View style={styles.list}>
        {(c.skills || []).slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.listItem}><Text style={styles.listText}>{skill}</Text><Ionicons name="chevron-forward" size={16} color={colors.muted} /></View>
        ))}
        {(!c.skills || c.skills.length === 0) && (
          <View style={styles.listItem}><Text style={styles.listText}>General Development</Text><Ionicons name="chevron-forward" size={16} color={colors.muted} /></View>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Schedule')}> 
          <Ionicons name="calendar" size={18} color="#fff" />
          <Text style={styles.btnText}>Schedule Interview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGhost} onPress={() => navigation.navigate('Chat')}> 
          <Ionicons name="chatbubble" size={18} color={colors.primary} />
          <Text style={styles.btnGhostText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, position: 'relative' },
  page: { flex: 1, backgroundColor: colors.pageBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverWrap: { position: 'absolute', left: 0, right: 0, top: 0, height: 220, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' },
  cover: { width: '100%', height: '100%' },
  coverGradient: { ...StyleSheet.absoluteFillObject },
  header: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 12, gap: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { backgroundColor: colors.cardBg, borderRadius: 14, padding: 3, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  avatar: { width: 56, height: 56, borderRadius: 12 },
  headerContent: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.muted },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 6 },
  statCard: { flex: 1, backgroundColor: 'transparent', paddingVertical: 0, paddingHorizontal: 0 },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { color: colors.text, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 12 },
  iconRow: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  segments: { flexDirection: 'row', gap: 8 },
  segment: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.pillBg, borderWidth: 1, borderColor: '#e5e7eb' },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.text, fontWeight: '700' },
  segmentTextActive: { color: '#fff' },
  card: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 12 },
  bodyText: { color: colors.text },
  helpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  label: { color: colors.text, fontWeight: '800' },
  list: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 4 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  listText: { color: colors.text },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnGhost: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  btnGhostText: { color: colors.primary, fontWeight: '700' },
});
