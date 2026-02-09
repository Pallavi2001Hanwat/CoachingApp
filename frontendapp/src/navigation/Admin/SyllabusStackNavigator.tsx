import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SyllabusScreen from '@/src/screens/admin/Syllabus/SyllabusScreen';
import AddSyllabusForm from '@/src/screens/admin/Syllabus/AddSyllabusForm';

const Stack = createStackNavigator();

const SyllabusStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Subjects list screen */}
    <Stack.Screen
      name="SyllabusScreen"
      component={SyllabusScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Subject form with back arrow */}
   <Stack.Screen
  name="AddSyllabusForm"
  component={AddSyllabusForm}
  options={({ route }) => ({
    title: route.params?.SyllabusId ? 'Edit' : 'Add New Syllabus',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

  </Stack.Navigator>
);

export default SyllabusStackNavigator;
