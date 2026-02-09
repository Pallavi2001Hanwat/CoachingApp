import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import QuestionWithOptionsScreen from '@/src/screens/admin/QuestionWithOption/QuestionWithOptionScreen';
import AddQuestionWithOptionForm from '@/src/screens/admin/QuestionWithOption/AddQuestionWithOptionForm';

const Stack = createStackNavigator();

const QuestionWithOptionsStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ QuestionWithOptions list screen */}
    <Stack.Screen
      name="QuestionWithOptionScreen"
      component={QuestionWithOptionsScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add QuestionWithOption form with back arrow */}
   <Stack.Screen
  name="AddQuestionWithOptionForm"
  component={AddQuestionWithOptionForm}
  options={({ route }) => ({
    title: route.params?.QuestionWithOptionId ? 'Edit QuestionWithOption' : 'Add New QuestionWithOption',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

  </Stack.Navigator>
);

export default QuestionWithOptionsStackNavigator;
