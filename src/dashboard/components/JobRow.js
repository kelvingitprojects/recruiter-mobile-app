import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export default function JobRow({ item, navigation }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 2 }}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSub}>{item.location}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{item.applicantsCount || 0} Candidates</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{item.views || 0} Views</Text>
      </View>
      <View style={styles.cell}>
         <View style={[styles.statusTag, item.urgencyLevel > 0 && styles.statusUrgent]}>
          <Text style={[styles.statusText, item.urgencyLevel > 0 && styles.statusTextUrgent]}>
            {item.urgencyLevel > 0 ? 'Urgent' : 'Active'}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => navigation.navigate('JobEditor', { job: item })}
        >
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  rowSub: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  cell: {
    flex: 1,
  },
  cellText: {
    fontSize: 14,
    color: '#4b5563',
  },
  statusTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusUrgent: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  statusTextUrgent: {
    color: '#991b1b',
  },
  actions: {
    width: 80,
    alignItems: 'flex-end',
  },
  actionBtn: {
    padding: 6,
  },
  actionBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
