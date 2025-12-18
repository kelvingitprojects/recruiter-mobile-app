import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchJobById } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';

export default function JobDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, initial } = route.params || {};
  const { data, isLoading } = useQuery({ queryKey: ['job', id], queryFn: () => fetchJobById(id), enabled: !!id });
  const j = data || initial;
  if (!j) return <View style={styles.center}><Text>No job found.</Text></View>;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.hero}>
        {j.logoUrl ? <Image source={{ uri: j.logoUrl }} style={styles.banner} /> : null}
        <LinearGradient colors={["transparent","rgba(0,0,0,0.55)"]} style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{j.title}</Text>
          <View style={styles.heroRow}>
            <View style={styles.pill}>
              <Ionicons name="briefcase" size={14} color="#fff" />
              <Text style={styles.pillText} numberOfLines={1}> {j.company || 'Company'}</Text>
            </View>
            {j.location ? (
              <View style={styles.pill}><Ionicons name="location" size={14} color="#fff" /><Text style={styles.pillText} numberOfLines={1}> {j.location}</Text></View>
            ) : null}
            {j.workSetting ? (
              <View style={styles.pill}><Ionicons name="home" size={14} color="#fff" /><Text style={styles.pillText} numberOfLines={1}> {j.workSetting}</Text></View>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.metricsRow}>
          <View style={styles.infoCard}><Ionicons name="time" size={16} color={colors.muted} /><Text style={styles.infoPrimary}>{j.postedAt ? new Date(j.postedAt).toDateString() : '—'}</Text><Text style={styles.infoSecondary}>Posted</Text></View>
          <View style={styles.infoCard}><Ionicons name="people" size={16} color={colors.muted} /><Text style={styles.infoPrimary}>{j.applicantsCount ?? 0}</Text><Text style={styles.infoSecondary}>Applicants</Text></View>
          <View style={styles.infoCard}><Ionicons name="eye" size={16} color={colors.muted} /><Text style={styles.infoPrimary}>{j.views ?? 0}</Text><Text style={styles.infoSecondary}>Views</Text></View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About the job</Text>
        <Text style={styles.item}>{j.description || '—'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Role details</Text>
        <View style={styles.row}><Ionicons name="briefcase" size={16} color={colors.muted} /><Text style={styles.item}> {j.employmentType || '—'}</Text></View>
        <View style={styles.row}><Ionicons name="bar-chart" size={16} color={colors.muted} /><Text style={styles.item}> {j.experienceLevel || '—'}</Text></View>
        <View style={styles.row}><Ionicons name="business" size={16} color={colors.muted} /><Text style={styles.item}> {j.industry || '—'}</Text></View>
        <View style={styles.row}><Ionicons name="cash" size={16} color={colors.muted} /><Text style={styles.item}> {j.salaryCurrency === 'R' ? 'R' : ''} {j.salaryMax || '—'}</Text></View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Responsibilities</Text>
        {(j.responsibilities || []).map((r, i) => (
          <View key={i} style={styles.row}><Ionicons name="checkmark" size={16} color={colors.primary} /><Text style={styles.item}> {r}</Text></View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Qualifications</Text>
        {(j.qualifications || j.skills || []).map((q, i) => (
          <View key={i} style={styles.row}><Ionicons name="cube" size={16} color={colors.muted} /><Text style={styles.item}> {q}</Text></View>
        ))}
        {Array.isArray(j.preferredQualifications) && j.preferredQualifications.length ? (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.sectionSub}>Preferred</Text>
            {j.preferredQualifications.map((q, i) => (
              <View key={`p-${i}`} style={styles.row}><Ionicons name="star" size={16} color={colors.accent} /><Text style={styles.item}> {q}</Text></View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        <View style={styles.chipsRow}>{(j.benefits || []).map((b, i) => (
          <View key={i} style={styles.chip}><Ionicons name="gift" size={12} color="#666" /><Text style={styles.chipText}> {b}</Text></View>
        ))}</View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('ApplyJob', { job: j })}>
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={styles.btnText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  banner: { width: '100%', height: 180, borderRadius: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  section: { gap: 6 },
  hero: { position: 'relative' },
  heroOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: '#00000044', padding: 12, borderRadius: 12 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#00000055', maxWidth: '100%', flexShrink: 1 },
  pillText: { color: '#fff', fontWeight: '700', fontSize: 12, flexShrink: 1 },
  card: { gap: 6, backgroundColor: colors.cardBg, borderRadius: 12, padding: 12 },
  metricsRow: { flexDirection: 'row', gap: 24, justifyContent: 'space-between' },
  infoCard: { flex: 1, alignItems: 'center', gap: 4 },
  infoPrimary: { color: colors.text, fontWeight: '800' },
  infoSecondary: { color: colors.muted },
  sectionTitle: { fontWeight: '800', color: colors.text },
  sectionSub: { fontWeight: '700', color: colors.text },
  item: { color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.chipBg },
  chipText: { fontSize: 12, color: colors.text },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnGhost: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  btnGhostText: { color: colors.primary, fontWeight: '700' },
});
