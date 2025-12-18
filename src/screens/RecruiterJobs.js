import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { fetchMyJobs } from '../services/api';

export default function RecruiterJobs({ navigation }) {
  const profile = useSelector(state => state.profile.data);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async () => {
    if (!profile?.id) return;
    try {
      const data = await fetchMyJobs(profile.id);
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [profile?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('JobEditor', { job: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JobEditor', { job: item })}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color={colors.muted} />
        <Text style={styles.infoText}>{item.location}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.applicantsCount || 0}</Text>
          <Text style={styles.statLabel}>Applicants</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.views || 0}</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
        <View style={[styles.statusTag, item.urgencyLevel > 0 && styles.statusUrgent]}>
          <Text style={[styles.statusText, item.urgencyLevel > 0 && styles.statusTextUrgent]}>
            {item.urgencyLevel > 0 ? 'Urgent' : 'Active'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('JobEditor')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>No jobs posted yet.</Text>
              <Text style={styles.emptySub}>Tap the + button to post your first job.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  
  list: { padding: 16, gap: 16 },
  card: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  infoText: { fontSize: 14, color: colors.muted },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.muted },
  
  statusTag: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: colors.success + '20' },
  statusText: { fontSize: 12, color: colors.success, fontWeight: '600' },
  statusUrgent: { backgroundColor: colors.danger + '20' },
  statusTextUrgent: { color: colors.danger },
  
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: colors.muted },
  emptySub: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
