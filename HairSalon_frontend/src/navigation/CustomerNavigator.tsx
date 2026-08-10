import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Avatar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomerHomeScreen } from '../screens/customer/CustomerHomeScreen';
import { BrowseServicesScreen } from '../screens/customer/BrowseServicesScreen';
import { ServiceDetailScreen } from '../screens/customer/ServiceDetailScreen';
import { BrowseStylistsScreen } from '../screens/customer/BrowseStylistsScreen';
import { StylistProfileDetailScreen } from '../screens/customer/StylistProfileDetailScreen';
import { AboutSalonScreen } from '../screens/customer/AboutSalonScreen';
import { BookAppointmentScreen } from '../screens/customer/BookAppointmentScreen';
import { MyBookingsScreen } from '../screens/customer/MyBookingsScreen';
import { BookingDetailScreen } from '../screens/customer/BookingDetailScreen';

import { ViewProfileScreen } from '../screens/auth/ViewProfileScreen';
import { UpdateProfileScreen } from '../screens/auth/UpdateProfileScreen';
import { ChangePasswordScreen } from '../screens/auth/ChangePasswordScreen';
import { NotificationPanelScreen } from '../screens/auth/NotificationPanelScreen';
import { SettingsScreen } from '../screens/auth/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomerTabs = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 14;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'HomeTab') iconName = 'content-cut';
          else if (route.name === 'ServicesTab') iconName = 'scissors-cutting';
          else if (route.name === 'StylistsTab') iconName = 'account-group';
          else if (route.name === 'MyBookingsTab') iconName = 'calendar-clock';
          else if (route.name === 'ProfileTab') iconName = 'account-circle';

          return <Avatar.Icon size={size || 24} icon={iconName} style={{ backgroundColor: 'transparent' }} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={CustomerHomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="ServicesTab" component={BrowseServicesScreen} options={{ tabBarLabel: 'Services' }} />
      <Tab.Screen name="StylistsTab" component={BrowseStylistsScreen} options={{ tabBarLabel: 'Stylists' }} />
      <Tab.Screen name="MyBookingsTab" component={MyBookingsScreen} options={{ tabBarLabel: 'Bookings' }} />
      <Tab.Screen name="ProfileTab" component={ViewProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const CustomerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerMainTabs" component={CustomerTabs} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="BrowseServices" component={BrowseServicesScreen} />
      <Stack.Screen name="BrowseStylists" component={BrowseStylistsScreen} />
      <Stack.Screen name="StylistProfileDetail" component={StylistProfileDetailScreen} />
      <Stack.Screen name="AboutSalon" component={AboutSalonScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="NotificationPanel" component={NotificationPanelScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
