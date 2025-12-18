import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useDispatch } from 'react-redux';
import { createAction } from '@reduxjs/toolkit';

const login = createAction('auth/login');

export default function Welcome({ navigation }) {
  const dispatch = useDispatch();
  return (
    <LinearGradient colors={[ '#0B2340', '#0E2945' ]} style={styles.container}>
      <View style={styles.logoMark}>
        <LinearGradient colors={[ '#2FB7FF', '#7FD3FF' ]} style={styles.dropLeft} />
        <View style={styles.dropRight} />
        <View style={styles.handWrap}><Ionicons name="hand-left" size={42} color="#0B2340" /></View>
      </View>
      <Text style={styles.brand}>Recruitor</Text>
      <Text style={styles.tagline}>Connect. Match. Hire.</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.ctaPrimary} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-in" color="#fff" size={18} />
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaGhost} onPress={() => dispatch(login())}>
          <Ionicons name="flash" color="#fff" size={18} />
          <Text style={styles.ctaGhostText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoMark: { width: 140, height: 140, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  dropLeft: { position: 'absolute', left: 16, top: 12, width: 72, height: 96, borderTopLeftRadius: 36, borderTopRightRadius: 36, borderBottomLeftRadius: 48, borderBottomRightRadius: 16 },
  dropRight: { position: 'absolute', right: 16, top: 22, width: 72, height: 96, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, borderBottomLeftRadius: 16, borderBottomRightRadius: 48 },
  handWrap: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  brand: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 16 },
  tagline: { color: '#ffffffcc', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  ctaPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#00000022', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  ctaText: { color: '#fff', fontWeight: '700' },
  ctaGhost: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#ffffff66', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  ctaGhostText: { color: '#fff' },
});
