import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAction } from '@reduxjs/toolkit';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { loginAuth, signupAuth, requestPasswordReset } from '../services/api';

const login = createAction('auth/login');
const setRole = createAction('mode/setRole');

const completeOnboarding = createAction('profile/completeOnboarding');

export default function Login() {
  const dispatch = useDispatch();
  const role = useSelector(state => state.mode.role);
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await loginAuth(email, password);
      } else {
        if (!name) {
          Alert.alert('Error', 'Name is required for signup');
          setLoading(false);
          return;
        }
        res = await signupAuth(email, password, name, role);
      }
      
      dispatch(login());
      // Do not mark onboarded here; allow onboarding to run if needed
      dispatch(completeOnboarding(res.user));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email first');
      return;
    }
    try {
      await requestPasswordReset(email);
      Alert.alert('Success', 'If an account exists, a reset link has been sent (Check server console for token)');
    } catch (e) {
      Alert.alert('Error', 'Failed to request reset');
    }
  };

  return (
    <View style={styles.container}>
      {!isLogin && (
        <View style={styles.topRight}>
          <View style={styles.roleToggle}>
            <Pressable onPress={() => dispatch(setRole('candidate'))} style={[styles.roleBtn, role === 'candidate' && styles.roleBtnActive]}>
              <Text style={[styles.roleBtnText, role === 'candidate' && styles.roleBtnTextActive]}>Candidate</Text>
            </Pressable>
            <Pressable onPress={() => dispatch(setRole('recruiter'))} style={[styles.roleBtn, role === 'recruiter' && styles.roleBtnActive]}>
              <Text style={[styles.roleBtnText, role === 'recruiter' && styles.roleBtnTextActive]}>Recruiter</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Sign in to continue' : 'Join to start swiping'}</Text>
      </View>

      <View style={styles.form}>
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {isLogin && (
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.link}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#f8f9fa',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  link: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  topRight: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 4,
  },
  roleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  roleBtnTextActive: {
    color: '#000',
  },
});
