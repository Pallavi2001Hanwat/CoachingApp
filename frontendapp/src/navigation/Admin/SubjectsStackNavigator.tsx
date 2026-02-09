import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SubjectsScreen from '@/src/screens/admin/Subject/SubjectScreen';
import AddSubjectForm from '@/src/screens/admin/Subject/AddSubjectForm';

const Stack = createStackNavigator();

const SubjectsStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Subjects list screen */}
    <Stack.Screen
      name="SubjectScreen"
      component={SubjectsScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Subject form with back arrow */}
   <Stack.Screen
  name="AddSubjectForm"
  component={AddSubjectForm}
  options={({ route }) => ({
    title: route.params?.SubjectId ? 'Edit Subject' : 'Add New Subject',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

  </Stack.Navigator>
);

export default SubjectsStackNavigator;
