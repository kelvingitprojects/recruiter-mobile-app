import { View, Text, StyleSheet, Button, Animated, Platform, Dimensions, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchJobs, fetchCandidates, swipeRight, swipeLeft, swipeUp } from '../services/api';
import SwipeDeck from '../components/SwipeDeck';
import Card from '../components/Card';
import DeckActions from '../components/DeckActions';
import React, { useRef, useState, useMemo, useCallback } from 'react';
import PreviewModal from '../components/PreviewModal';
import FilterChips from '../components/FilterChips';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import colors from '../theme/colors';
import Toast from 'react-native-toast-message';

export default function Home({ navigation }) {
  const role = useSelector(state => state.mode.role);
  const onboarded = useSelector(state => state.profile.onboarded);
  const profile = useSelector(state => state.profile.data);
  const { data: jobs, refetch: refetchJobs } = useQuery({ 
    queryKey: ['jobs', profile?.id], 
    queryFn: () => fetchJobs(profile?.id),
    enabled: role !== 'recruiter' 
  });
  const { data: candidates, refetch: refetchCandidates } = useQuery({ 
    queryKey: ['candidates', profile?.id], 
    queryFn: () => fetchCandidates(profile?.id),
    enabled: role === 'recruiter'
  });
  
  useFocusEffect(
    useCallback(() => {
      if (role === 'recruiter') refetchCandidates();
      else refetchJobs();
    }, [role, refetchCandidates, refetchJobs])
  );

  const items = role === 'recruiter' ? candidates || [] : jobs || [];

  const likeMut = useMutation({ 
    mutationFn: (i) => swipeRight(i, profile?.id),
    onError: (error) => {
      setLimitMessage(error.message || "Limit Reached");
      setLimitModalVisible(true);
    }
  });
  const passMut = useMutation({ 
    mutationFn: (i) => swipeLeft(i, profile?.id),
    onError: (error) => {
      setLimitMessage(error.message || "Limit Reached");
      setLimitModalVisible(true);
    }
  });
  const superMut = useMutation({ 
    mutationFn: (i) => swipeUp(i, profile?.id),
    onError: (error) => {
      deckRef.current?.reset();
      setLimitMessage(error.message || "Limit Reached");
      setLimitModalVisible(true);
    }
  });
  const deckRef = useRef();
  const [previewItem, setPreviewItem] = useState(null);
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [filters, setFilters] = useState({ urgent: false, boosted: false, remote: false });
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [matchItem, setMatchItem] = useState(null);
  const filteredItems = useMemo(() => {
    let list = items;
    if (filters.urgent) list = list.filter(i => i.urgencyLevel);
    if (filters.boosted) list = list.filter(i => i.boosted);
    return list;
  }, [items, filters]);
  const { width, height } = Dimensions.get('window');
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {role === 'recruiter' ? 'Candidates' : 'Jobs'} ({filteredItems.length})
        </Text>
      </View>
      <View style={styles.deckWrap}>
        <View style={styles.filtersOverlay}>
          <FilterChips filters={filters} setFilters={setFilters} />
          <TouchableOpacity style={styles.scheduleBtn} onPress={() => navigation.navigate('Schedule')}>
            <Text style={styles.scheduleText}>SCHEDULE</Text>
          </TouchableOpacity>
        </View>
        <SwipeDeck
          ref={deckRef}
          items={filteredItems}
          renderCard={item => <Card item={item} role={role} onboarded={onboarded} onShowMore={(it) => setPreviewItem(it)} onPress={(it) => {
            const serialized = JSON.parse(JSON.stringify(it));
            if (role === 'recruiter') navigation.navigate('CandidateDetail', { id: it.id, initial: serialized });
            else navigation.navigate('JobDetail', { id: it.id, initial: serialized });
          }} />}
          onLongPress={i => setPreviewItem(i)}
          onSwipeRight={i => likeMut.mutate(i, { 
            onSuccess: () => { 
              if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 
              setMatchItem(i); 
              Animated.sequence([
                Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }), 
                Animated.timing(overlayOpacity, { toValue: 0, duration: 700, useNativeDriver: true })
              ]).start(() => setMatchItem(null)); 
              Toast.show({ type: 'success', text1: 'Liked', visibilityTime: 1500 });
            },
            onError: (err) => {
              Toast.show({
                type: 'error',
                text1: err.message || 'Error',
                text2: 'Tap here to upgrade',
                onPress: () => navigation.navigate('Subscription'),
                visibilityTime: 4000
              });
            }
          })}
          onSwipeLeft={i => passMut.mutate(i, { onSuccess: () => { if (Platform.OS !== 'web') Haptics.selectionAsync(); } })}
          onSwipeUp={i => superMut.mutate(i, { 
            onSuccess: () => { 
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); 
              setMatchItem(i); 
              Animated.sequence([
                Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }), 
                Animated.timing(overlayOpacity, { toValue: 0, duration: 700, useNativeDriver: true })
              ]).start(() => setMatchItem(null)); 
              Toast.show({ type: 'success', text1: 'Superlike!', visibilityTime: 1500 });
            },
            onError: (err) => {
              // Reset card position if superlike fails
              deckRef.current?.reset();
              Toast.show({
                type: 'error',
                text1: err.message || "Limit Reached",
                text2: 'Tap here to upgrade',
                onPress: () => navigation.navigate('Subscription'),
                visibilityTime: 4000
              });
            }
          })}
        />
        <View style={styles.actionsOverlay}>
          <DeckActions
            onPass={() => deckRef.current?.swipeLeft()}
            onSuper={() => deckRef.current?.swipeUp()}
            onLike={() => deckRef.current?.swipeRight()}
          />
        </View>
      </View>
      <PreviewModal visible={!!previewItem} item={previewItem} onClose={() => setPreviewItem(null)} />
      {matchItem ? (
        <Animated.View style={[styles.matchOverlay, { opacity: overlayOpacity }]}> 
          <View style={styles.matchCard}><Text style={styles.matchText}>It’s a match!</Text><Text style={styles.matchItem}>{matchItem.title}</Text></View>
          <ConfettiCannon count={120} colors={[colors.primary, colors.success, colors.danger, colors.accent]} origin={{ x: width / 2, y: height - 160 }} fadeOut autoStart explosionSpeed={220} fallSpeed={2200} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: colors.pageBg,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginLeft: 12 },
  header: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  
  filtersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deckWrap: { flex: 1, position: 'relative' },
  filtersOverlay: { position: 'absolute', left: 12, right: 12, top: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionsOverlay: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center' },
  matchOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  matchCard: { backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', gap: 8 },
  matchText: { fontSize: 24, fontWeight: '700' },
  matchItem: { fontSize: 16 },
  scheduleBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  scheduleText: { color: '#fff', fontWeight: '700' },
});
