import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function FilterChips({ filters, setFilters }) {
  const toggle = key => setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.chip, filters.urgent && styles.active]} onPress={() => toggle('urgent')}>
        <Text style={styles.text}>Urgent</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.chip, filters.boosted && styles.active]} onPress={() => toggle('boosted')}>
        <Text style={styles.text}>Boosted</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.chip, filters.remote && styles.active]} onPress={() => toggle('remote')}>
        <Text style={styles.text}>Remote</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardBg },
  active: { backgroundColor: colors.pillBg, borderColor: colors.success },
  text: { fontSize: 12, color: colors.text },
  
});
