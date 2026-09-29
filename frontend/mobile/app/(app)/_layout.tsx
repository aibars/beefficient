import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';
import HomeScreen from './home';

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  const { logout } = useAuthStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen
        name="establishments"
        component={() => (
          <HomeScreen />
        )}
        options={{
          title: 'Establecimientos',
          tabBarLabel: 'Establecimientos',
        }}
      />
      <Tab.Screen
        name="more"
        component={() => (
          <HomeScreen />
        )}
        options={{
          title: 'Más',
          tabBarLabel: 'Más',
        }}
      />
    </Tab.Navigator>
  );
}
