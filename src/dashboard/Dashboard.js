import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { fetchMyJobs } from '../services/api';
import Sidebar from './components/Sidebar';
import JobRow from './components/JobRow';
import ApplicationsView from './components/ApplicationsView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';

export default function Dashboard({ navigation }) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const profile = useSelector(state => state.profile.data);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  const loadJobs = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const data = await fetchMyJobs(profile.id);
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [profile?.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadJobs();
    });
    return unsubscribe;
  }, [navigation]);

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'jobs': return 'Job Management';
      case 'candidates': return 'Applications';
      case 'notifications': return 'Notifications';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <View style={[styles.container, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} isLargeScreen={isLargeScreen} />

      {/* Main Content */}
      <View style={[styles.main, !isLargeScreen && { padding: 10 }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          {activeTab === 'jobs' && (
            <TouchableOpacity 
              style={styles.createBtn} 
              onPress={() => navigation.navigate('JobEditor')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createBtnText}>Post New Job</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeTab === 'jobs' && (
          <View style={styles.content}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 2 }]}>Job Details</Text>
              <Text style={styles.headerCell}>Applicants</Text>
              <Text style={styles.headerCell}>Stats</Text>
              <Text style={styles.headerCell}>Status</Text>
              <Text style={[styles.headerCell, { width: 80 }]}>Actions</Text>
            </View>
            
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
              <FlatList
                data={jobs}
                renderItem={({ item }) => <JobRow item={item} navigation={navigation} />}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        )}

        {activeTab === 'candidates' && (
          <View style={styles.content}>
            <ApplicationsView profile={profile} />
          </View>
        )}

        {activeTab === 'notifications' && (
          <NotificationsView profile={profile} />
        )}
        
        {activeTab === 'settings' && (
          <SettingsView profile={profile} />
        )}

        {['analytics'].includes(activeTab) && (
          <View style={[styles.content, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>Feature coming soon...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  main: {
    flex: 1,
    padding: 30,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    padding: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
});
