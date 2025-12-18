import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchNotificationsGql, markNotificationReadGql } from '../services/graphql';
import colors from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function Notifications() {
  const user = useSelector(state => state.profile.data);
  const queryClient = useQueryClient();
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user.id],
    queryFn: () => fetchNotificationsGql(user.id),
    enabled: !!user.id,
  });

  const markReadMutation = useMutation({
      mutationFn: markNotificationReadGql,
      onSuccess: () => {
          queryClient.invalidateQueries(['notifications', user.id]);
      }
  });

  const handlePress = (item) => {
      if (!item.read) {
          markReadMutation.mutate(item.id);
      }
      // Future: Navigate to detail based on item.type and item.data
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={[styles.card, !item.read && styles.unreadCard]} 
        onPress={() => handlePress(item)}
    >
      <View style={styles.row}>
        <Ionicons 
            name={item.type === 'match' ? 'heart' : 'notifications'} 
            size={24} 
            color={item.type === 'match' ? colors.success : colors.primary} 
            style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No notifications.</Text>}
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
  unreadCard: {
      backgroundColor: colors.cardBg,
      borderColor: colors.primary,
      borderWidth: 1.5,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  body: { fontSize: 14, color: colors.muted, marginBottom: 4 },
  date: { fontSize: 12, color: colors.muted },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  empty: { textAlign: 'center', marginTop: 40, color: colors.muted }
});
