// src/navigation/UserNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StudentLayout from '../../screens/Student/StudentLayout'// create a stub if needed

const Stack = createStackNavigator();

const StudentNavigator = () => (
 <Stack.Navigator screenOptions={{ headerShown: false }}>
 
    <Stack.Screen name="StudentLayout" component={StudentLayout} />
  </Stack.Navigator>
);

export default StudentNavigator;
