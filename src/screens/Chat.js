import { View, Text, StyleSheet, FlatList, TextInput, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { socket } from '../services/socket';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  useEffect(() => {
    socket.connect();
    const handler = payload => {
      if (payload?.message) setMessages(prev => [...prev, payload.message]);
    };
    socket.on('chat.message', handler);
    return () => socket.off('chat.message', handler);
  }, []);
  const send = () => {
    const msg = { id: Date.now().toString(), senderId: 'me', type: 'text', body: input, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    socket.emit('chat.message', { threadId: 't1', message: msg });
    setInput('');
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => (
          <View style={styles.msg}><Text>{item.senderId}: {item.body}</Text></View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type" />
        <Button title="Send" onPress={send} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  msg: { padding: 8, borderBottomWidth: 1, borderColor: '#eee' },
  inputRow: { flexDirection: 'row', padding: 8, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 8 },
});
