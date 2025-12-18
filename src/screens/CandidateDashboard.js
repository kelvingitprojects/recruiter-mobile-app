import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchCandidateApplicationsGql } from '../services/graphql';
import colors from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CandidateDashboard() {
  const user = useSelector(state => state.profile.data);
  const navigation = useNavigation();
  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['candidateApplications', user.id],
    queryFn: () => fetchCandidateApplicationsGql(user.id),
    enabled: !!user.id,
  });

  const renderItem = ({ item }) => {
    const isMatch = item.status === 'accepted';
    return (
      <TouchableOpacity 
        style={[styles.card, isMatch && styles.matchCard]}
        onPress={() => item.job && navigation.navigate('JobDetail', { id: item.job.id, initial: item.job })}
      >
        <View style={styles.header}>
            <Text style={styles.jobTitle}>{item.job?.title || 'Unknown Job'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
        </View>
        <Text style={styles.company}>{item.job?.company || 'Unknown Company'}</Text>
        <Text style={styles.date}>Applied: {new Date(item.createdAt).toLocaleDateString()}</Text>
        {isMatch && (
            <View style={styles.matchBanner}>
                <Ionicons name="heart" size={16} color="white" />
                <Text style={styles.matchText}> It's a Match! </Text>
            </View>
        )}
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'accepted': return colors.success;
          case 'rejected': return colors.danger;
          default: return colors.muted;
      }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No applications yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  list: { padding: 16 },
  card: {
      backgroundColor: colors.cardBg,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
  },
  matchCard: {
      borderColor: colors.success,
      borderWidth: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  company: { fontSize: 16, color: colors.muted, marginBottom: 8 },
  date: { fontSize: 12, color: colors.muted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  matchBanner: {
      marginTop: 8,
      backgroundColor: colors.success,
      padding: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
  },
  matchText: { color: 'white', fontWeight: 'bold', marginLeft: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: colors.muted }
});
