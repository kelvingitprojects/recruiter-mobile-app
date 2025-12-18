import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { createJob, updateJob } from '../services/api';

export default function JobEditor({ navigation, route }) {
  const job = route.params?.job;
  const isEditing = !!job;
  const profile = useSelector(state => state.profile.data);
  
  const [title, setTitle] = useState(job?.title || '');
  const [company, setCompany] = useState(job?.company || profile?.companyName || '');
  const [location, setLocation] = useState(job?.location || '');
  const [salaryMax, setSalaryMax] = useState(job?.salaryMax?.toString() || '');
  const [skills, setSkills] = useState(job?.skills?.join(', ') || '');
  const [urgencyLevel, setUrgencyLevel] = useState(job?.urgencyLevel > 0);
  const [boosted, setBoosted] = useState(job?.boosted || false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !company || !location) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Company, Location)');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      company,
      location,
      salaryMax: parseInt(salaryMax) || 0,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      urgencyLevel: urgencyLevel ? 2 : 0,
      boosted
    };

    try {
      if (isEditing) {
        await updateJob(job.id, payload);
      } else {
        await createJob(profile.id, payload);
      }
      Alert.alert('Success', `Job ${isEditing ? 'updated' : 'posted'} successfully`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput 
              style={styles.input} 
              value={title} 
              onChangeText={setTitle} 
              placeholder="e.g. Senior React Developer" 
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company *</Text>
            <TextInput 
              style={styles.input} 
              value={company} 
              onChangeText={setCompany} 
              placeholder="Company Name" 
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput 
              style={styles.input} 
              value={location} 
              onChangeText={setLocation} 
              placeholder="City, Country or Remote" 
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Salary (Annual)</Text>
            <TextInput 
              style={styles.input} 
              value={salaryMax} 
              onChangeText={setSalaryMax} 
              placeholder="100000" 
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Required Skills</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={skills} 
              onChangeText={setSkills} 
              placeholder="React, Node.js, TypeScript..." 
              placeholderTextColor={colors.muted}
              multiline
            />
            <Text style={styles.helperText}>Comma separated</Text>
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Urgent Hiring</Text>
              <Text style={styles.switchSub}>Mark as urgent to attract more candidates</Text>
            </View>
            <Switch 
              value={urgencyLevel} 
              onValueChange={setUrgencyLevel} 
              trackColor={{ true: colors.danger }}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Boost Post</Text>
              <Text style={styles.switchSub}>Increase visibility in candidate feeds</Text>
            </View>
            <Switch 
              value={boosted} 
              onValueChange={setBoosted} 
              trackColor={{ true: colors.accent }}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && styles.disabledBtn]} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? 'Saving...' : (isEditing ? 'Update Job' : 'Post Job')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  content: { padding: 20 },
  
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginLeft: 4 },
  input: { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 16, color: colors.text },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  helperText: { fontSize: 12, color: colors.muted, marginLeft: 4 },
  
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  switchLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  switchSub: { fontSize: 12, color: colors.muted },
  
  submitBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  disabledBtn: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
