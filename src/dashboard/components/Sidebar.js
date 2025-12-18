import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

const isWeb = Platform.OS === 'web';

const SidebarItem = ({ icon, label, id, activeTab, setActiveTab, mobile }) => (
  <TouchableOpacity 
    style={[
      mobile ? styles.mobileItem : styles.sidebarItem, 
      activeTab === id && (mobile ? styles.mobileItemActive : styles.sidebarItemActive)
    ]}
    onPress={() => setActiveTab(id)}
  >
    <Ionicons name={icon} size={20} color={activeTab === id ? (mobile ? '#fff' : colors.primary) : colors.muted} />
    {(!mobile || activeTab === id) && (
       <Text style={[
         mobile ? styles.mobileLabel : styles.sidebarLabel, 
         activeTab === id && (mobile ? styles.mobileLabelActive : styles.sidebarLabelActive)
       ]}>
         {label}
       </Text>
    )}
  </TouchableOpacity>
);

export default function Sidebar({ activeTab, setActiveTab, profile, isLargeScreen = true }) {
  const items = [
    { icon: 'briefcase', label: 'My Jobs', id: 'jobs' },
    { icon: 'people', label: 'Candidates', id: 'candidates' },
    { icon: 'notifications', label: 'Notifications', id: 'notifications' },
    { icon: 'stats-chart', label: 'Analytics', id: 'analytics' },
    { icon: 'settings', label: 'Settings', id: 'settings' },
  ];

  if (!isLargeScreen) {
    return (
      <View style={styles.mobileNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileScroll}>
          {items.map(item => (
            <SidebarItem key={item.id} {...item} activeTab={activeTab} setActiveTab={setActiveTab} mobile />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoContainer}>
         <Ionicons name="briefcase" size={32} color={colors.primary} />
         <Text style={styles.logoText}>SwipeRecruit</Text>
      </View>
      
      {items.map(item => (
        <SidebarItem key={item.id} {...item} activeTab={activeTab} setActiveTab={setActiveTab} />
      ))}
      
      <View style={{ flex: 1 }} />
      <View style={styles.userProfile}>
         <View style={styles.avatar}>
           <Text style={styles.avatarText}>{profile?.companyName?.[0] || 'R'}</Text>
         </View>
         <View>
           <Text style={styles.userName}>{profile?.companyName || 'Recruiter'}</Text>
           <Text style={styles.userRole}>Admin</Text>
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  sidebarItemActive: {
    backgroundColor: '#eff6ff',
  },
  sidebarLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  sidebarLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  userRole: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  // Mobile Styles
  mobileNav: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
  },
  mobileScroll: {
    paddingHorizontal: 15,
  },
  mobileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  mobileItemActive: {
    backgroundColor: colors.primary,
  },
  mobileLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  mobileLabelActive: {
    color: '#fff',
    fontWeight: '600',
  }
});
