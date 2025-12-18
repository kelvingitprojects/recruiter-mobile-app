import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  Animated,
  LayoutAnimation,
  UIManager,
  Modal,
  Pressable
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createAction } from '@reduxjs/toolkit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import { updateProfile as updateProfileApi } from '../services/api';
import { GRAPHQL_URL } from '../config/env';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const updateProfile = createAction('profile/updateProfile');

// --- Constants ---
const JOB_TITLES = [
  "Software Engineer", "Senior Software Engineer", "Product Manager", 
  "UI/UX Designer", "Frontend Developer", "Backend Developer", 
  "Full Stack Developer", "Data Scientist", "DevOps Engineer", 
  "Mobile Developer", "QA Engineer", "Project Manager", "Engineering Manager"
];

const SKILLS_LIST = [
  "React", "React Native", "JavaScript", "TypeScript", "Node.js", 
  "Python", "Java", "C#", "Go", "Rust", "AWS", "Google Cloud", 
  "Azure", "Docker", "Kubernetes", "GraphQL", "REST API", 
  "SQL", "NoSQL", "MongoDB", "PostgreSQL", "Figma", "Adobe XD",
  "Git", "CI/CD", "Agile", "Scrum"
];

// --- Reusable Internal Components ---

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
  error, 
  multiline, 
  keyboardType, 
  autoCapitalize, 
  helperText,
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
      <Text style={styles.label}>
        {label} <Text style={styles.requiredStar}>{error ? '*' : ''}</Text>
      </Text>
      <Animated.View style={[
        styles.inputContainer, 
        { borderColor: error ? colors.danger : borderColor },
        multiline && styles.inputContainerMultiline
      ]}>
        {icon && <Ionicons name={icon} size={20} color={isFocused ? colors.primary : colors.muted} style={styles.inputIcon} />}
        <TextInput 
          style={[styles.input, multiline && styles.textArea]} 
          value={value} 
          onChangeText={(text) => {
            onChangeText(text);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder} 
          placeholderTextColor={colors.muted}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={label}
          accessibilityHint={placeholder}
          accessibilityState={{ error: !!error }}
        />
      </Animated.View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const DropdownField = ({ label, value, options, onSelect, placeholder, error, multiple }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // For multiple select, value is an array
  // For single select, value is a string
  
  const isSelected = (item) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(item);
    }
    return value === item;
  };

  const handleSelect = (item) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(item)) {
        onSelect(current.filter(i => i !== item));
      } else {
        onSelect([...current, item]);
      }
    } else {
      onSelect(item);
      setModalVisible(false);
    }
  };

  const displayText = () => {
    if (multiple) {
      return Array.isArray(value) && value.length > 0 ? `${value.length} selected` : '';
    }
    return value;
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} <Text style={styles.requiredStar}>{error ? '*' : ''}</Text>
      </Text>
      
      <TouchableOpacity 
        style={[styles.inputContainer, { borderColor: error ? colors.danger : colors.border }]} 
        onPress={() => setModalVisible(true)}
      >
        {multiple && Array.isArray(value) && value.length > 0 ? (
          <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 8 }}>
            {value.map(item => (
              <View key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.input, { color: displayText() ? colors.text : colors.muted }]}>
            {displayText() || placeholder}
          </Text>
        )}
        <Ionicons name="chevron-down" size={20} color={colors.muted} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {options.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.modalItem, isSelected(item) && styles.modalItemActive]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.modalItemText, isSelected(item) && styles.modalItemTextActive]}>{item}</Text>
                  {isSelected(item) && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {multiple && (
              <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Main Profile Component ---

export default function Profile({ navigation }) {
  const dispatch = useDispatch();
  const profile = useSelector(state => state.profile.data);
  const role = useSelector(state => state.mode.role);

  // Form State
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  
  // Candidate fields
  const [title, setTitle] = useState(profile?.title || '');
  
  // Parse skills: handle string (legacy) or array
  const parseSkills = (s) => {
    if (Array.isArray(s)) return s;
    if (typeof s === 'string' && s.trim()) return s.split(',').map(i => i.trim());
    return [];
  };

  const [skills, setSkills] = useState(parseSkills(profile?.skills));
  const [bio, setBio] = useState(profile?.bio || '');
  const [hourlyRate, setHourlyRate] = useState(profile?.hourlyRate ? String(profile.hourlyRate) : '');
  
  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
  const DEFAULT_COVER = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl || DEFAULT_AVATAR);
  const [coverUrl, setCoverUrl] = useState(profile?.coverUrl || DEFAULT_COVER);
  const [employmentStatus, setEmploymentStatus] = useState(profile?.employmentStatus || 'Open to opportunities');
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl || '');
  const [uploadingResume, setUploadingResume] = useState(false);

  // Recruiter fields
  const [company, setCompany] = useState(profile?.company || '');
  const [cultureTags, setCultureTags] = useState(profile?.cultureTags?.join(', ') || '');

  // Validation State
  const [errors, setErrors] = useState({});

  const pickImage = async (type) => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'avatar') {
        setLogoUrl(result.assets[0].uri);
      } else {
        setCoverUrl(result.assets[0].uri);
      }
    }
  };

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setUploadingResume(true);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/pdf',
      });

      const uploadUrl = GRAPHQL_URL.replace('/graphql', '/upload');
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.url) {
        setResumeUrl(data.url);
        Alert.alert('Success', 'Resume uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    if (role === 'candidate') {
      if (!title.trim()) newErrors.title = 'Job title is required';
      if (skills.length === 0) newErrors.skills = 'At least one skill is required';
    } else {
      if (!company.trim()) newErrors.company = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please check the fields marked in red.');
      return;
    }

    const updatedData = {
      name,
      email,
      ...(role === 'candidate' ? {
        title,
        skills, // Already an array
        bio,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        logoUrl,
        coverUrl,
        resumeUrl,
        employmentStatus
      } : {
        company,
        cultureTags: cultureTags.split(',').map(s => s.trim()).filter(Boolean)
      })
    };

    // Optimistic update
    dispatch(updateProfile(updatedData));
    
    // API call
    if (profile?.id) {
      try {
        await updateProfileApi(profile.id, updatedData);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      } catch (e) {
        console.error('Failed to sync profile', e);
        Alert.alert('Error', 'Failed to save profile to server');
        return;
      }
    }

    Alert.alert('Success', 'Profile updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const currentCover = coverUrl || profile?.coverUrl;
  const currentAvatar = logoUrl || profile?.logoUrl;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.coverWrapper}>
            {currentCover ? (
              <Image source={{ uri: currentCover }} style={styles.coverImage} />
            ) : (
              <LinearGradient colors={[colors.primary, '#60a5fa']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.coverPlaceholder} />
            )}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.1)']} style={styles.coverOverlay} />
            <TouchableOpacity 
              style={styles.editCoverBtn} 
              onPress={() => pickImage('cover')}
              accessibilityLabel="Change Cover Photo"
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              {currentAvatar ? (
                <Image source={{ uri: currentAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={40} color={colors.primary} />
                </View>
              )}
              <TouchableOpacity 
                style={styles.editAvatarBtn} 
                accessibilityLabel="Change Avatar"
                onPress={() => pickImage('avatar')}
              >
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName}>{name || 'Your Name'}</Text>
              <Text style={styles.headerRole}>{role === 'candidate' ? (title || 'Job Title') : (company || 'Company Name')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.formContainer}>
          
          {/* Section: Subscription Plan */}
          <View style={styles.card}>
            <SectionHeader title="Subscription Plan" icon="star" />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                        {profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free'} Plan
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 14 }}>
                        {profile?.plan === 'enterprise' ? 'Unlimited access' : 
                         profile?.plan === 'pro' ? 'Enhanced visibility' : 'Basic access'}
                    </Text>
                </View>
                <TouchableOpacity 
                    style={[styles.actionBtn, { paddingHorizontal: 16, height: 36, marginTop: 0 }]}
                    onPress={() => navigation.navigate('Subscription')}
                >
                    <Text style={styles.actionBtnText}>Upgrade</Text>
                </TouchableOpacity>
            </View>
          </View>

          {/* Section: Basic Info */}
          <View style={styles.card}>
            <SectionHeader title="Basic Information" icon="person-circle" />
            <InputField 
              label="Full Name" 
              value={name} 
              onChangeText={setName} 
              placeholder="Your Name" 
              error={errors.name}
              icon="person-outline"
            />
            <InputField 
              label="Email Address" 
              value={email} 
              onChangeText={setEmail} 
              placeholder="email@example.com" 
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              icon="mail-outline"
            />
          </View>

          {/* Section: Professional Details (Role Based) */}
          <View style={styles.card}>
            <SectionHeader title="Professional Details" icon="briefcase" />
            
            {role === 'candidate' ? (
              <>
                <DropdownField 
                  label="Job Title"
                  value={title}
                  onSelect={setTitle}
                  options={JOB_TITLES}
                  placeholder="Select Job Title"
                  error={errors.title}
                />
                
                <DropdownField 
                  label="Skills"
                  value={skills}
                  onSelect={setSkills}
                  options={SKILLS_LIST}
                  placeholder="Select Skills"
                  error={errors.skills}
                  multiple
                />
                
                <InputField 
                  label="Employment Status" 
                  value={employmentStatus} 
                  onChangeText={setEmploymentStatus} 
                  placeholder="e.g. Open to opportunities" 
                />
                <InputField 
                  label="Bio" 
                  value={bio} 
                  onChangeText={setBio} 
                  placeholder="Tell us about yourself..." 
                  multiline
                />
                <InputField 
                  label="Hourly Rate (R)" 
                  value={hourlyRate} 
                  onChangeText={setHourlyRate} 
                  placeholder="e.g. 450" 
                  keyboardType="numeric"
                />
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Resume (PDF)</Text>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.secondaryBtn, { marginTop: 4 }]} 
                    onPress={pickResume} 
                    disabled={uploadingResume}
                  >
                    {uploadingResume ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="document-text" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                        <Text style={styles.secondaryBtnText}>{resumeUrl ? 'Update Resume' : 'Upload Resume'}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  {resumeUrl ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text style={{ marginLeft: 4, color: colors.success, fontSize: 14 }}>Resume attached</Text>
                    </View>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <InputField 
                  label="Company Name" 
                  value={company} 
                  onChangeText={setCompany} 
                  placeholder="Company Inc." 
                  error={errors.company}
                />
                <InputField 
                  label="Culture Tags" 
                  value={cultureTags} 
                  onChangeText={setCultureTags} 
                  placeholder="Remote, Fast-paced, Inclusive..." 
                  multiline
                  helperText="Separate tags with commas"
                />
              </>
            )}
          </View>

          {/* Section: Media */}
          <View style={styles.card}>
            <SectionHeader title="Profile Media" icon="images" />
            <InputField 
              label="Profile Image URL" 
              value={logoUrl} 
              onChangeText={setLogoUrl} 
              placeholder="https://..." 
              autoCapitalize="none"
              icon="image-outline"
            />
            <InputField 
              label="Cover Image URL" 
              value={coverUrl} 
              onChangeText={setCoverUrl} 
              placeholder="https://..." 
              autoCapitalize="none"
              icon="image-outline"
            />
          </View>

          {role === 'recruiter' && (
             <TouchableOpacity 
               style={[styles.actionBtn, styles.secondaryBtn]} 
               onPress={() => navigation.navigate('RecruiterJobs')}
               accessibilityRole="button"
               accessibilityLabel="Manage Jobs"
             >
               <Ionicons name="briefcase" size={20} color={colors.accent} style={{ marginRight: 8 }} />
               <Text style={styles.secondaryBtnText}>Manage Jobs</Text>
             </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save Changes"
          >
            <Text style={styles.actionBtnText}>Save Changes</Text>
          </TouchableOpacity>
          
          <View style={styles.footerSpacer} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  content: { paddingBottom: 40 },
  
  // Header
  headerContainer: { marginBottom: 60, zIndex: 1 },
  coverWrapper: { height: 160, width: '100%', position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  editCoverBtn: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  
  profileHeader: { position: 'absolute', top: 80, left: 20, right: 20, flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: colors.pageBg },
  avatarPlaceholder: { backgroundColor: colors.pillBg, alignItems: 'center', justifyContent: 'center' },
  editAvatarBtn: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: colors.primary, width: 32, height: 32, 
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.pageBg
  },
  headerTextContainer: { marginLeft: 15, flex: 1, justifyContent: 'center' },
  headerName: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#fff', 
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  headerRole: { 
    fontSize: 16, 
    color: 'rgba(255, 255, 255, 0.9)', 
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },

  // Form
  formContainer: { paddingHorizontal: 20, gap: 24 },
  card: { backgroundColor: colors.cardBg, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  
  // Section Header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.pillBg, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  
  // Inputs
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  requiredStar: { color: colors.danger },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 12, 
    paddingHorizontal: 12, backgroundColor: '#fff',
    minHeight: 48
  },
  inputContainerMultiline: { alignItems: 'flex-start', paddingVertical: 12, minHeight: 100 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 12 },
  textArea: { height: '100%', textAlignVertical: 'top' },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4, marginLeft: 4 },
  helperText: { fontSize: 12, color: colors.muted, marginTop: 4, marginLeft: 4 },

  // Chip
  chip: { 
    backgroundColor: colors.pillBg, paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: 16, marginRight: 4, marginBottom: 4 
  },
  chipText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalList: { padding: 20 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemActive: { backgroundColor: colors.pillBg + '30', marginHorizontal: -20, paddingHorizontal: 20 },
  modalItemText: { fontSize: 16, color: colors.text },
  modalItemTextActive: { color: colors.primary, fontWeight: '600' },
  modalDoneBtn: { margin: 20, backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  modalDoneText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Buttons
  actionBtn: { 
    backgroundColor: colors.primary, padding: 16, borderRadius: 12, 
    alignItems: 'center', shadowColor: colors.primary, 
    shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  secondaryBtn: { backgroundColor: colors.pillBg, shadowOpacity: 0, elevation: 0, flexDirection: 'row', justifyContent: 'center' },
  secondaryBtnText: { color: colors.accent, fontSize: 16, fontWeight: '600' },

  footerSpacer: { height: 40 }
});
