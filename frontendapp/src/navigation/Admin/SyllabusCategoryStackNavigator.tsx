import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SyllabusCategoryScreen from '@/src/screens/admin/Syllabus/SyllabusCategoryScreen';
import AddSyllabusCategoryForm from '@/src/screens/admin/Syllabus/AddSyllabusCategoryForm';

const Stack = createStackNavigator();

const SyllabusCategoryStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Subjects list screen */}
    <Stack.Screen
      name="SyllabusCategoryScreen"
      component={SyllabusCategoryScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Subject form with back arrow */}
   <Stack.Screen
  name="AddSyllabusCategoryForm"
  component={AddSyllabusCategoryForm}
  options={({ route }) => ({
    title: route.params?.SyllabusCategoryId ? 'Edit SyllabusCategory' : 'Add New SyllabusCategory',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

  </Stack.Navigator>
);

export default SyllabusCategoryStackNavigator;
