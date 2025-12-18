import { useState } from 'react';
import { View, Text, Button, StyleSheet, Platform, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ScheduleModal({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(Platform.OS !== 'web');
  const [textDate, setTextDate] = useState('');

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS !== 'ios');
    setDate(currentDate);
  };

  const schedule = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text>Schedule Interview</Text>
      {Platform.OS === 'web' ? (
        <TextInput style={styles.input} placeholder="YYYY-MM-DD HH:mm" value={textDate} onChangeText={setTextDate} />
      ) : (
        <View>
          <Button title="Pick date" onPress={() => setShow(true)} />
          {show && (
            <DateTimePicker value={date} mode="datetime" onChange={onChange} />
          )}
        </View>
      )}
      <Button title="Schedule" onPress={schedule} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 8, height: 40 },
});
