import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { upgradePlanGql } from '../services/graphql';
import { PLANS } from '../config/plans';
import { updateProfile } from '../store';

export default function Subscription({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.profile.data);
  const role = useSelector(state => state.mode.role);
  const [loading, setLoading] = useState(false);

  const currentPlan = user?.plan || 'free';
  const plans = PLANS[role] || PLANS.candidate;

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    
    // Simulate Payment
    setLoading(true);
    
    try {
      // In a real app, we would integrate Stripe/Paystack here.
      // await paymentService.charge(...);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedUser = await upgradePlanGql(user.id, planId);
      dispatch(updateProfile(updatedUser));
      
      Alert.alert(
        'Success', 
        `You have successfully upgraded to the ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upgrade plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade your Plan</Text>
        <Text style={styles.subtitle}>Get more visibility and unlock features</Text>
      </View>

      {plans.map((plan) => {
        const isCurrent = currentPlan === plan.id;
        const isRecommended = plan.recommended;

        return (
          <View 
            key={plan.id} 
            style={[
              styles.card, 
              isCurrent && styles.activeCard,
              isRecommended && !isCurrent && styles.recommendedCard
            ]}
          >
            {isRecommended && !isCurrent && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>RECOMMENDED</Text>
              </View>
            )}
            
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
              </View>
              {isCurrent && (
                 <View style={styles.currentBadge}>
                   <Ionicons name="checkmark-circle" size={16} color="white" />
                   <Text style={styles.currentBadgeText}>Current</Text>
                 </View>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.featuresList}>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={18} color={colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: isCurrent ? colors.muted : plan.color }
              ]}
              disabled={isCurrent || loading}
              onPress={() => handleUpgrade(plan.id)}
            >
              {loading && !isCurrent ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  activeCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  recommendedCard: {
    borderColor: colors.primary,
    borderWidth: 1,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  planPeriod: {
    fontSize: 14,
    color: colors.muted,
    marginLeft: 4,
  },
  currentBadge: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.text,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
