import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/services/api';
import { store, persistor } from './src/store';
import Welcome from './src/screens/Welcome';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import Chat from './src/screens/Chat';
import Profile from './src/screens/Profile';
import Settings from './src/screens/Settings';
import OnboardingCandidate from './src/screens/OnboardingCandidate';
import OnboardingRecruiter from './src/screens/OnboardingRecruiter';
import ScheduleModal from './src/screens/ScheduleModal';
import RecruiterJobs from './src/screens/RecruiterJobs';
import JobEditor from './src/screens/JobEditor';
import Subscription from './src/screens/Subscription';
import Dashboard from './src/dashboard/Dashboard';
import CandidateDashboard from './src/screens/CandidateDashboard';
import Notifications from './src/screens/Notifications';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors, { applyTheme } from './src/theme/colors';
import Toast from 'react-native-toast-message';




const qc = queryClient;

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function CandidateTabs() {
  const navigation = useNavigation();
  
  function HeaderRight() {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 15 }}>
        <TouchableOpacity onPress={() => navigation.navigate('CandidateDashboard')} style={{ marginRight: 15 }}>
          <Ionicons name="apps" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Tabs.Navigator screenOptions={{ headerTitleStyle: { color: colors.text }, headerShadowVisible: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted }}>
      <Tabs.Screen name="Home" component={Home} options={{ headerTitle: 'Swipe', headerRight: () => <HeaderRight />, tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="Chat" component={Chat} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" color={color} size={size} /> }} />
      <Tabs.Screen name="Profile" component={Profile} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} /> }} />
      <Tabs.Screen name="Settings" component={Settings} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }} />
    </Tabs.Navigator>
  );
}

function RecruiterTabs() {
  function RoleHeaderRight() {
    const role = useSelector(state => state.mode.role);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.pillBg }}>
        <Ionicons name={role === 'recruiter' ? 'briefcase' : 'person'} size={16} color={colors.text} />
        <Text style={{ fontWeight: '600', color: colors.text }}> {role === 'recruiter' ? 'Recruiter' : 'Candidate'}</Text>
      </View>
    );
  }
  return (
    <Tabs.Navigator screenOptions={{ headerTitleStyle: { color: colors.text }, headerShadowVisible: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted }}>
      <Tabs.Screen name="Home" component={Home} options={{ headerTitle: 'Home', headerRight: () => <RoleHeaderRight />, tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="Chat" component={Chat} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" color={color} size={size} /> }} />
      <Tabs.Screen name="Profile" component={Profile} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} /> }} />
      <Tabs.Screen name="Settings" component={Settings} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }} />
    </Tabs.Navigator>
  );
}

function RootNavigator() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const role = useSelector(state => state.mode.role);
  const onboarded = useSelector(state => state.profile.onboarded);
  const theme = useSelector(state => state.theme.mode);
  React.useEffect(() => { applyTheme(theme); }, [theme]);
  
  const isWeb = Platform.OS === 'web';

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <Stack.Navigator>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      ) : !onboarded ? (
        <Stack.Navigator>
          {role === 'recruiter' ? (
            <Stack.Screen name="OnboardingRecruiter" component={OnboardingRecruiter} />
          ) : (
            <Stack.Screen name="OnboardingCandidate" component={OnboardingCandidate} />
          )}
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          {role === 'recruiter' ? (
            isWeb ? (
              // Web Recruiter
              <>
                <Stack.Screen name="WebDashboard" component={Dashboard} options={{ headerShown: false }} />
                <Stack.Screen name="JobEditor" component={JobEditor} options={{ title: 'Edit Job' }} />
              </>
            ) : (
              // Mobile Recruiter
            <>
              <Stack.Screen name="Tabs" options={{ headerShown: false }} component={RecruiterTabs} />
              <Stack.Screen name="RecruiterJobs" component={RecruiterJobs} options={{ title: 'Manage Jobs' }} />
              <Stack.Screen name="JobEditor" component={JobEditor} options={{ title: 'Edit Job' }} />
              <Stack.Screen name="CandidateDetail" component={require('./src/screens/CandidateDetail').default} options={{ title: 'Candidate' }} />
              <Stack.Screen name="Subscription" component={Subscription} options={{ title: 'Subscription' }} />
              <Stack.Screen name="Schedule" component={ScheduleModal} options={{ presentation: 'modal' }} />
            </>
            )
          ) : (
            // Candidate (Web & Mobile)
            <>
              <Stack.Screen name="Tabs" options={{ headerShown: false }} component={CandidateTabs} />
              <Stack.Screen name="CandidateDetail" component={require('./src/screens/CandidateDetail').default} options={{ title: 'Candidate' }} />
              <Stack.Screen name="JobDetail" component={require('./src/screens/JobDetail').default} options={{ title: 'Job' }} />
              <Stack.Screen name="ApplyJob" component={require('./src/screens/ApplyJob').default} options={{ title: 'Apply' }} />
              <Stack.Screen name="Schedule" component={ScheduleModal} options={{ presentation: 'modal' }} />
              <Stack.Screen name="CandidateDashboard" component={CandidateDashboard} options={{ title: 'My Applications' }} />
              <Stack.Screen name="Notifications" component={Notifications} options={{ title: 'Notifications' }} />
              <Stack.Screen name="Subscription" component={Subscription} options={{ title: 'Subscription' }} />
            </>
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={qc}>
          <StatusBar style="auto" />
          <RootNavigator />
          <Toast />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({});