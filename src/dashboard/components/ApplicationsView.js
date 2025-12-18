import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Modal, ScrollView, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import colors from '../../theme/colors';
import { fetchApplications, updateApplicationStatus } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function ApplicationsView({ profile }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [currentResumeUrl, setCurrentResumeUrl] = useState('');
  const PAGE_SIZE = 20;

  const loadApps = async (reset = false) => {
    if (loading) return;
    if (!reset && !hasMore) return;

    try {
      setLoading(true);
      const skip = reset ? 0 : page * PAGE_SIZE;
      const data = await fetchApplications(profile.id, skip, PAGE_SIZE);
      
      if (reset) {
        setApplications(data || []);
        setPage(1);
        setHasMore((data || []).length === PAGE_SIZE);
      } else {
        setApplications(prev => [...prev, ...(data || [])]);
        setPage(prev => prev + 1);
        setHasMore((data || []).length === PAGE_SIZE);
      }
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load applications'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) loadApps(true);
  }, [profile?.id]);

  const handleStatusUpdate = async (status) => {
    if (!selectedApp) return;
    try {
      setProcessing(true);
      await updateApplicationStatus(selectedApp.id, status, feedback);
      
      // Update local state
      setApplications(prev => prev.map(a => 
        a.id === selectedApp.id ? { ...a, status, feedback } : a
      ));
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Application ${status}`
      });
      setSelectedApp(null);
      setFeedback('');
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update status'
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredApps = applications.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return colors.success;
      case 'rejected': return colors.danger;
      case 'reviewed': return colors.accent;
      default: return colors.muted;
    }
  };

  const openResume = (url) => {
    if (!url) return;
    setCurrentResumeUrl(url);
    setResumeModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => setSelectedApp(item)}>
      <View style={{ flex: 2 }}>
        <Text style={styles.candidateName}>{item.candidate?.name || 'Unknown'}</Text>
        <Text style={styles.jobTitle}>{item.job?.title}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      <View style={{ width: 40, alignItems: 'center' }}>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.filters}>
          {['all', 'pending', 'accepted', 'rejected'].map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => loadApps(true)}>
          <Ionicons name="refresh" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 2 }]}>Candidate / Job</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Date</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredApps}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={!loading && <Text style={styles.emptyText}>No applications found.</Text>}
        onEndReached={() => loadApps(false)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} />}
      />

      {/* Detail Modal */}
      <Modal visible={!!selectedApp} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Application Details</Text>
              <TouchableOpacity onPress={() => setSelectedApp(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedApp && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.label}>Candidate</Text>
                    <Text style={styles.value}>{selectedApp.candidate?.name}</Text>
                    <Text style={styles.subValue}>{selectedApp.candidate?.title}</Text>
                    <Text style={styles.subValue}>{selectedApp.candidate?.email}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>Applied For</Text>
                    <Text style={styles.value}>{selectedApp.job?.title}</Text>
                    <Text style={styles.subValue}>{selectedApp.job?.company}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>Cover Note</Text>
                    <View style={styles.noteBox}>
                      <Text style={styles.noteText}>{selectedApp.message || 'No message provided.'}</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>Resume / CV</Text>
                    {selectedApp.resumeUrl ? (
                      <TouchableOpacity style={styles.resumeBtn} onPress={() => openResume(selectedApp.resumeUrl)}>
                        <Ionicons name="document-text" size={20} color={colors.primary} />
                        <Text style={styles.resumeBtnText}>View Attached Resume</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.subValue}>No resume attached.</Text>
                    )}
                  </View>
                  
                  {selectedApp.candidate?.skills && (
                    <View style={styles.section}>
                      <Text style={styles.label}>Skills</Text>
                      <View style={styles.skillsRow}>
                        {(selectedApp.candidate.skills || []).map((s, i) => (
                          <View key={i} style={styles.skillChip}>
                            <Text style={styles.skillText}>{s}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedApp.status === 'rejected' && selectedApp.feedback && (
                    <View style={styles.section}>
                      <Text style={[styles.label, { color: colors.danger }]}>Rejection Reason</Text>
                      <Text style={styles.noteText}>{selectedApp.feedback}</Text>
                    </View>
                  )}

                  {selectedApp.logs && selectedApp.logs.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.label}>History</Text>
                      {selectedApp.logs.map((log, i) => (
                        <View key={i} style={styles.logItem}>
                          <Text style={styles.logText}>
                            {new Date(log.createdAt).toLocaleString()}: {log.action.replace('_', ' ')} 
                            {log.newStatus && ` to ${log.newStatus}`}
                          </Text>
                          {log.note && <Text style={styles.logNote}>Note: {log.note}</Text>}
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {selectedApp && selectedApp.status === 'pending' && (
              <View style={styles.modalFooter}>
                <View style={styles.feedbackContainer}>
                  <Text style={styles.label}>Feedback (Optional for Rejection)</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Reason for rejection..." 
                    value={feedback}
                    onChangeText={setFeedback}
                  />
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.rejectBtn]} 
                    onPress={() => handleStatusUpdate('rejected')}
                    disabled={processing}
                  >
                    <Text style={styles.actionBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.acceptBtn]} 
                    onPress={() => handleStatusUpdate('accepted')}
                    disabled={processing}
                  >
                    <Text style={styles.actionBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Resume Preview Modal */}
      <Modal visible={resumeModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setResumeModalVisible(false)}>
        <View style={styles.resumeModalContainer}>
          <View style={styles.resumeHeader}>
            <Text style={styles.resumeTitle}>Resume Preview</Text>
            <TouchableOpacity onPress={() => setResumeModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {currentResumeUrl ? (
             <WebView 
               source={{ uri: Platform.OS === 'android' && currentResumeUrl.endsWith('.pdf') 
                 ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(currentResumeUrl)}`
                 : currentResumeUrl 
               }} 
               style={{ flex: 1 }}
               startInLoadingState={true}
               renderLoading={() => <ActivityIndicator size="large" color={colors.primary} style={StyleSheet.absoluteFill} />}
             />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  filters: { flexDirection: 'row', gap: 10 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.pillBg },
  filterBtnActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 14, color: colors.text },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  refreshBtn: { padding: 8 },
  
  tableHeader: { flexDirection: 'row', padding: 16, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerCell: { fontWeight: '600', color: colors.muted, fontSize: 13 },
  
  row: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', alignItems: 'center' },
  candidateName: { fontWeight: '600', color: colors.text, fontSize: 15 },
  jobTitle: { color: colors.muted, fontSize: 13 },
  date: { color: colors.text, fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  emptyText: { padding: 20, textAlign: 'center', color: colors.muted },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxWidth: 600, height: '80%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  modalBody: { padding: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: colors.muted, marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '600', color: colors.text },
  subValue: { fontSize: 14, color: colors.muted },
  noteBox: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  noteText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  resumeBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#eff6ff', borderRadius: 8, gap: 8 },
  resumeBtnText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: colors.pillBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  skillText: { fontSize: 13, color: colors.text },

  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#f9fafb' },
  feedbackContainer: { marginBottom: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  rejectBtn: { backgroundColor: '#fee2e2' },
  acceptBtn: { backgroundColor: colors.primary },
  actionBtnText: { fontWeight: '600', fontSize: 14 },

  logItem: { marginBottom: 8, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.border },
  logText: { fontSize: 13, color: colors.text },
  logNote: { fontSize: 12, color: colors.muted, fontStyle: 'italic' },

  resumeModalContainer: { flex: 1, backgroundColor: '#fff' },
  resumeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  resumeTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  closeBtn: { padding: 5 },
});
