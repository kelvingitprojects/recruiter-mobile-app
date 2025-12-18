import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { createAction } from '@reduxjs/toolkit';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const completeOnboarding = createAction('profile/completeOnboarding');
const setRole = createAction('mode/setRole');

export default function OnboardingRecruiter({ navigation }) {
  const dispatch = useDispatch();
  const [companyName, setCompanyName] = useState('');
  const [cultureTags, setCultureTags] = useState('');
  const submit = () => {
    // Simulate getting an ID from auth/backend
    const id = 'recruiter_' + Math.floor(Math.random() * 1000);
    dispatch(completeOnboarding({ id, companyName, cultureTags: cultureTags.split(',').map(s => s.trim()) }));
  };
  return (
    <View style={styles.container}>
      <View style={styles.roleRow}>
        <Pressable onPress={() => { dispatch(setRole('candidate')); navigation.replace('OnboardingCandidate'); }} style={styles.roleCard}>
          <Ionicons name="person" size={20} color={colors.muted} />
          <Text style={styles.roleText}>Candidate</Text>
        </Pressable>
        <Pressable style={[styles.roleCard, styles.roleActive]}>
          <Ionicons name="briefcase" size={20} color={colors.primary} />
          <Text style={[styles.roleText, styles.roleTextActive]}>Recruiter</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>Tell us about your company</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Company Name" value={companyName} onChangeText={setCompanyName} />
        <TextInput style={styles.input} placeholder="Culture Tags (comma-separated)" value={cultureTags} onChangeText={setCultureTags} />
      </View>
      <TouchableOpacity style={styles.finish} onPress={submit}>
        <Ionicons name="checkmark" size={18} color="#fff" />
        <Text style={styles.finishText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: colors.pageBg },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardBg },
  roleActive: { borderColor: colors.primary, backgroundColor: colors.pillBg },
  roleText: { color: colors.muted },
  roleTextActive: { color: colors.primary, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  form: { gap: 10 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: colors.cardBg, color: colors.text },
  finish: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, alignSelf: 'flex-start' },
  finishText: { color: '#fff', fontWeight: '700' },
});
