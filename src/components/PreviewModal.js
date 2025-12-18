import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import Card from './Card';

export default function PreviewModal({ visible, item, onClose }) {
  if (!visible || !item) return null;
  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <Card item={item} />
        <TouchableOpacity style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '90%', maxWidth: 480, backgroundColor: colors.cardBg || '#fff', borderRadius: 12, paddingBottom: 12 },
  close: { alignSelf: 'center', marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.pillBg, borderRadius: 6 },
  closeText: { fontSize: 14 },
});
