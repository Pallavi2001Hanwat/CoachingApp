import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PreviousYearPaperScreen from '@/src/screens/admin/PreviousYearPaper/PreviousYearPaperScreen';
import AddPreviousYearPaperForm from '@/src/screens/admin/PreviousYearPaper/AddPreviousYearPaperForm';
const Stack = createStackNavigator();

const PreviousYearPaperStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Courses list screen */}
    <Stack.Screen
      name="PreviousYearPaperScreen"
      component={PreviousYearPaperScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Course form with back arrow */}
   <Stack.Screen
  name="AddPreviousYearPaperForm"
  component={AddPreviousYearPaperForm}
  options={({ route }) => ({
    title: route.params?.PreviousYearPaperId ? 'Edit PreviousYearPaper' : 'Add New PreviousYearPaper',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}

/>
  


  </Stack.Navigator>
);

export default PreviousYearPaperStackNavigator;
