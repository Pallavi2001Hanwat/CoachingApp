import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TestPaperScreen from '@/src/screens/admin/TestPaper/TestPaperScreen';
import AddTestPaperForm from '@/src/screens/admin/TestPaper/AddTestPaperForm';
import SelectQuestionToTestPapers from '@/src/screens/admin/TestPaper/SelectQuestionToTestPaper';
import AddQuestionWithOptionForm from '@/src/screens/admin/QuestionWithOption/AddQuestionWithOptionForm';

const Stack = createStackNavigator();

const TestPaperStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ TestPaper list screen */}
    <Stack.Screen
      name="TestPaperScreen"
      component={TestPaperScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add TestPaper form with back arrow */}
   <Stack.Screen
  name="AddTestPaperForm"
  component={AddTestPaperForm}
  options={({ route }) => ({
    title: route.params?.TestPaperId ? 'Edit TestPaper' : 'Add New TestPaper',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

 {/* ✅ Add Course form with back arrow */}
   <Stack.Screen
  name="SelectQuestionToTestPaper"
  component={SelectQuestionToTestPapers}
  options={({ route }) => ({
    title: route.params?.TestPaperId ? 'Add Questions' : 'Edit Questions ',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}

/>

 <Stack.Screen
  name="AddQuestionWithOptionForm"
  component={AddQuestionWithOptionForm}
  options={({ route }) => ({
    title:  'Add New QuestionWithOption',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>


  </Stack.Navigator>
);

export default TestPaperStackNavigator;
