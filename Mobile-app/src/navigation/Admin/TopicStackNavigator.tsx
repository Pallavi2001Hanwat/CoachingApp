import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TopicScreen from '@/src/screens/admin/Topic/TopicScreen';
import AddTopicForm from '@/src/screens/admin/Topic/AddTopicForm';

const Stack = createStackNavigator();

const TopicsStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Topics list screen */}
    <Stack.Screen
      name="TopicScreen"
      component={TopicScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Topic form with back arrow */}
   <Stack.Screen
  name="AddTopicForm"
  component={AddTopicForm}
  options={({ route }) => ({
    title: route.params?.TopicId ? 'Edit Topic' : 'Add New Topic',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

  </Stack.Navigator>
);

export default TopicsStackNavigator;
