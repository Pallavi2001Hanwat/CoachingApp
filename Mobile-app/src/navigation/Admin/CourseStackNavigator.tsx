import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CoursesScreen from '@/src/screens/admin/Courses/CoursesScreen';
import AddCourseForm from '@/src/screens/admin/Courses/AddCourseForm';
import SelectSubjectsToCourse from '@/src/screens/admin/Courses/SelectSubjectsToCourse';
const Stack = createStackNavigator();

const CoursesStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Courses list screen */}
    <Stack.Screen
      name="CoursesScreen"
      component={CoursesScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Course form with back arrow */}
   <Stack.Screen
  name="AddCourseForm"
  component={AddCourseForm}
  options={({ route }) => ({
    title: route.params?.CourseId ? 'Edit Course' : 'Add New Course',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}

/>

   {/* ✅ Add Course form with back arrow */}
   <Stack.Screen
  name="SelectSubjectsToCourse"
  component={SelectSubjectsToCourse}
  options={({ route }) => ({
    title: route.params?.CourseId ? 'Add Subject' : 'Edit Subject ',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}

/>

  </Stack.Navigator>
);

export default CoursesStackNavigator;
