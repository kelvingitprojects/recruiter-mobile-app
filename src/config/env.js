import { Platform } from 'react-native';

const getLocalhost = () => {
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
};

export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.8.101:3000';
export const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || 'http://192.168.8.101:4000/graphql';
