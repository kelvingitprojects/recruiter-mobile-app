import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import colors, { applyTheme } from '../theme/colors';
import { resetAlgorithm } from '../services/api';
import { setAuthToken } from '../services/graphql';
import { logout, setRole, setTheme } from '../store';

const SectionHeader = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const SettingRow = ({ icon, label, value, onPress, isLast, rightElement }) => (
  <TouchableOpacity 
    style={[styles.row, isLast && styles.rowLast]} 
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.rowLeft}>
      <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
        <Ionicons name={icon.name} size={18} color={icon.color} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <View style={styles.rowRight}>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {rightElement}
      {onPress && !rightElement && <Ionicons name="chevron-forward" size={16} color={colors.muted} />}
    </View>
  </TouchableOpacity>
);

const SegmentedControl = ({ options, selected, onSelect }) => (
  <View style={styles.segmentContainer}>
    {options.map((opt) => {
      const isActive = selected === opt.value;
      return (
        <TouchableOpacity 
          key={opt.value} 
          style={[styles.segmentBtn, isActive && styles.segmentBtnActive]} 
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function Settings({ navigation }) {
  const dispatch = useDispatch();
  const role = useSelector(state => state.mode.role);
  const theme = useSelector(state => state.theme.mode);
  const profile = useSelector(state => state.profile.data);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { setAuthToken(null); dispatch(logout()); } },
    ]);
  };

  const handleResetAlgo = () => {
    resetAlgorithm();
    Alert.alert('Success', 'Algorithm training data has been reset.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {profile?.logoUrl || profile?.avatar ? (
             <Image source={{ uri: profile.logoUrl || profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>
          )}
        </View>
        <Text style={styles.profileName}>{profile?.name || 'User Name'}</Text>
        <Text style={styles.profileEmail}>{profile?.email || 'user@example.com'}</Text>
        <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.card}>
        <SectionHeader title="Preferences" icon="options-outline" />
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Theme</Text>
          <SegmentedControl 
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ]}
            selected={theme}
            onSelect={(val) => { dispatch(setTheme(val)); applyTheme(val); }}
          />
        </View>
      </View>

      {/* Account */}
      <View style={styles.card}>
        <SectionHeader title="Account" icon="person-circle-outline" />
        <SettingRow 
          icon={{ name: 'notifications', color: colors.accent }} 
          label="Notifications" 
          rightElement={<Switch value={true} onValueChange={() => {}} trackColor={{ true: colors.primary }} />}
        />
        <SettingRow 
          icon={{ name: 'lock-closed', color: colors.success }} 
          label="Privacy & Security" 
          onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available in the next update.')}
        />
        <SettingRow 
          icon={{ name: 'help-circle', color: colors.primary }} 
          label="Help & Support" 
          onPress={() => Alert.alert('Support', 'Please contact support@example.com for assistance.')}
        />
      </View>

      {/* Developer */}
      <View style={styles.card}>
        <SectionHeader title="Developer" icon="code-slash-outline" />
        <SettingRow 
          icon={{ name: 'refresh-circle', color: colors.danger }} 
          label="Reset Algorithm" 
          onPress={handleResetAlgo}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0 (Build 102)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  content: { padding: 20, paddingBottom: 40 },
  
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.pillBg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  profileName: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: colors.muted, marginBottom: 12 },
  editProfileBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.primary + '15' },
  editProfileText: { color: colors.primary, fontWeight: '600', fontSize: 14 },

  // Card & Section
  card: { backgroundColor: colors.cardBg, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.pillBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  
  // Row (Boxed)
  row: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 12
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { fontSize: 16, color: colors.text },
  rowValue: { fontSize: 14, color: colors.muted },
  iconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.pillBg },
  
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  controlLabel: { fontSize: 16, color: colors.text, fontWeight: '500' },
  
  segmentContainer: { flexDirection: 'row', backgroundColor: colors.pillBg, borderRadius: 8, padding: 2 },
  segmentBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  segmentBtnActive: { backgroundColor: colors.cardBg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  segmentTextActive: { color: colors.text, fontWeight: '600' },

  logoutBtn: { backgroundColor: colors.danger + '15', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 16 },
  
  versionText: { textAlign: 'center', color: colors.muted, fontSize: 12 },
});
