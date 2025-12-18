import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Animated,
  Platform,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { applyToJob } from '../services/api';
import colors from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

// --- Reusable Components (Matching Profile Style) ---

const SectionHeader = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  multiline, 
  icon 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedBorder = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedBorder, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary]
  });

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[
        styles.inputContainer, 
        { borderColor: borderColor },
        multiline && styles.inputContainerMultiline
      ]}>
        {icon && <Ionicons name={icon} size={20} color={isFocused ? colors.primary : colors.muted} style={styles.inputIcon} />}
        <TextInput 
          style={[styles.input, multiline && styles.textArea]} 
          value={value} 
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder} 
          placeholderTextColor={colors.muted}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </Animated.View>
    </View>
  );
};

// --- Main Component ---

export default function ApplyJob() {
  const route = useRoute();
  const navigation = useNavigation();
  const { job } = route.params || {};
  const profile = useSelector(state => state.profile.data);
  const [message, setMessage] = useState('');

  const applyMut = useMutation({
    mutationFn: () => applyToJob(job.id, profile.id, message),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Application Sent!',
        text2: `Good luck with your application to ${job?.company}.`,
        visibilityTime: 4000,
      });
      // Go back after a slight delay to let the user see the toast
      setTimeout(() => {
        navigation.navigate('Home');
      }, 1500);
    },
    onError: (err) => {
      Toast.show({
        type: 'error',
        text1: 'Application Failed',
        text2: 'Something went wrong. Please try again.',
      });
      console.error(err);
    }
  });

  if (!job) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>No job data found.</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: colors.pageBg }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header / Job Summary Card */}
        <LinearGradient 
          colors={[colors.primary, '#60a5fa']} 
          start={{x:0, y:0}} 
          end={{x:1, y:1}} 
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
             <View style={styles.companyLogoContainer}>
                {job.logoUrl ? (
                    <Image source={{ uri: job.logoUrl }} style={styles.companyLogo} />
                ) : (
                    <Text style={styles.companyInitial}>{job.company?.charAt(0) || 'C'}</Text>
                )}
             </View>
             <Text style={styles.headerJobTitle}>{job.title}</Text>
             <Text style={styles.headerCompany}>{job.company}</Text>
             <View style={styles.tagsRow}>
                <View style={styles.tag}>
                    <Ionicons name="location-outline" size={12} color="white" />
                    <Text style={styles.tagText}>{job.location || 'Remote'}</Text>
                </View>
                <View style={styles.tag}>
                    <Ionicons name="cash-outline" size={12} color="white" />
                    <Text style={styles.tagText}>{job.salaryCurrency}{job.salaryMax ? `${job.salaryMax/1000}k` : 'Negotiable'}</Text>
                </View>
             </View>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          
          {/* Section: Applicant Profile */}
          <View style={styles.card}>
            <SectionHeader title="Your Profile" icon="person-circle" />
            <View style={styles.profileRow}>
              <Image 
                source={{ uri: profile?.logoUrl || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60' }} 
                style={styles.profileAvatar} 
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{profile?.name || 'Your Name'}</Text>
                <Text style={styles.profileTitle}>{profile?.title || 'Candidate'}</Text>
                <Text style={styles.profileMeta}>
                    {profile?.email} • {profile?.location || 'South Africa'}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
            <View style={styles.resumeStatus}>
                <Ionicons name="document-text-outline" size={16} color={colors.muted} />
                <Text style={styles.resumeText}>
                    {profile?.resumeUrl ? 'Resume attached automatically' : 'No resume uploaded'}
                </Text>
                {!profile?.resumeUrl && (
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12, marginLeft: 8 }}>Upload</Text>
                    </TouchableOpacity>
                )}
            </View>
          </View>

          {/* Section: Cover Note */}
          <View style={styles.card}>
            <SectionHeader title="Cover Note" icon="create-outline" />
            <Text style={styles.sectionSubtitle}>Add a personal touch to your application (optional).</Text>
            
            <InputField 
              label=""
              value={message}
              onChangeText={setMessage}
              placeholder="Hi there, I'm interested in this role because..."
              multiline
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.applyBtn, applyMut.isPending && styles.applyBtnDisabled]} 
            onPress={() => applyMut.mutate()}
            disabled={applyMut.isPending}
          >
            {applyMut.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.applyBtnText}>Submit Application</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Header
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: -20, // Overlap with cards
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
  },
  companyLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  companyInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  headerJobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerCompany: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Form Container
  formContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },

  // Cards
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
    marginTop: -8,
  },

  // Profile Section
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.pillBg,
    padding: 12,
    borderRadius: 12,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileTitle: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
  },
  profileMeta: {
    fontSize: 12,
    color: colors.muted,
  },
  resumeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  resumeText: {
    fontSize: 13,
    color: colors.muted,
    marginLeft: 6,
    fontStyle: 'italic',
  },

  // Input
  inputGroup: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 12,
    minHeight: 120,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
  textArea: {
    height: 100,
  },

  // Buttons
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  applyBtnDisabled: {
    opacity: 0.7,
  },
  applyBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 16,
  },
});
