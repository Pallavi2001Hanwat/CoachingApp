// src/navigation/AdminNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminLayout from '../../screens/admin/AdminLayout';

const Stack = createStackNavigator();

const AdminNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Entire Admin Layout with Dashboard as default tab */}
    <Stack.Screen name="AdminLayout" component={AdminLayout} />
  </Stack.Navigator>
);

export default AdminNavigator;
