import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChaptersScreen from '@/src/screens/admin/Chapter/ChapterScreen';
import AddChapterForm from '@/src/screens/admin/Chapter/AddChapterForm';

const Stack = createStackNavigator();

const ChapterStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Chapters list screen */}
    <Stack.Screen
      name="ChapterScreen"
      component={ChaptersScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Chapter form with back arrow */}
   <Stack.Screen
  name="AddChapterForm"
  component={AddChapterForm}
  options={({ route }) => ({
    title: route.params?.ChapterId ? 'Edit Chapter' : 'Add New Chapter',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

  </Stack.Navigator>
);

export default ChapterStackNavigator;
