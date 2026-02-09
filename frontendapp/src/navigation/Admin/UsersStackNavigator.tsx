import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UsersScreen from '@/src/screens/admin/Users/UsersScreen';
import AddUserForm from '@/src/screens/admin/Users/AddUserForm';

const Stack = createStackNavigator();

const UsersStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Users list screen */}
    <Stack.Screen
      name="UsersScreen"
      component={UsersScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add user form with back arrow */}
   <Stack.Screen
  name="AddUserForm"
  component={AddUserForm}
  options={({ route }) => ({
    title: route.params?.userId ? 'Edit User' : 'Add New User',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

  </Stack.Navigator>
);

export default UsersStackNavigator;
