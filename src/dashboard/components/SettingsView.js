import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { fetchMe, upgradePlan } from '../../services/api';
import Toast from 'react-native-toast-message';

const PLANS = {
  free: { name: 'Free', price: '$0', swipeLimit: 50, superlikeLimit: 1 },
  pro: { name: 'Pro', price: '$29', swipeLimit: 'Unlimited', superlikeLimit: 5 },
  enterprise: { name: 'Enterprise', price: '$99', swipeLimit: 'Unlimited', superlikeLimit: 'Unlimited' }
};

export default function SettingsView({ profile }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const data = await fetchMe(profile.id);
      setUser(data);
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [profile?.id]);

  const handleUpgrade = async (plan) => {
    if (!user) return;
    try {
      await upgradePlan(user.id, plan);
      Toast.show({ type: 'success', text1: 'Success', text2: `Upgraded to ${PLANS[plan].name}` });
      loadUser();
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to upgrade plan' });
    }
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;

  const currentPlan = user?.plan || 'free';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Subscription & Usage</Text>
      
      <View style={styles.usageCard}>
        <Text style={styles.sectionTitle}>Current Usage (Today)</Text>
        <View style={styles.statRow}>
          <View>
            <Text style={styles.statLabel}>Swipes</Text>
            <Text style={styles.statValue}>{user?.swipeCount || 0} / {PLANS[currentPlan].swipeLimit}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Superlikes</Text>
            <Text style={styles.statValue}>{user?.superLikeCount || 0} / {PLANS[currentPlan].superlikeLimit}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 15 }]}>Available Plans</Text>
      
      {Object.entries(PLANS).map(([key, plan]) => (
        <View key={key} style={[styles.planCard, currentPlan === key && styles.activePlanCard]}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>{plan.price}<Text style={styles.perMonth}>/mo</Text></Text>
          </View>
          
          <View style={styles.planFeatures}>
            <Text style={styles.featureText}>• Swipes: {plan.swipeLimit}</Text>
            <Text style={styles.featureText}>• Superlikes: {plan.superlikeLimit}</Text>
            <Text style={styles.featureText}>• {key === 'enterprise' ? 'Dedicated Support' : (key === 'pro' ? 'Priority Support' : 'Community Support')}</Text>
          </View>

          {currentPlan === key ? (
            <View style={styles.currentBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.currentText}>Current Plan</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.upgradeBtn, { backgroundColor: key === 'free' ? colors.muted : colors.primary }]}
              onPress={() => handleUpgrade(key)}
            >
              <Text style={styles.upgradeBtnText}>{key === 'free' ? 'Downgrade' : 'Upgrade'}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  usageCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statLabel: {
    color: colors.textSecondary,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activePlanCard: {
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textTransform: 'capitalize',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  perMonth: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  upgradeBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  currentText: {
    color: colors.success,
    fontWeight: 'bold',
    marginLeft: 5,
  }
});
