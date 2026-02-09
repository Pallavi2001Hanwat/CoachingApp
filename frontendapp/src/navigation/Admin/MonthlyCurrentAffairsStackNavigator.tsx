import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AddMonthlyCurrentAffairsForm from '@/src/screens/admin/CurrentAffairs/AddMonthlyCurrentAffairsForm';
import MonthlyCurrentAffairsScreen from '@/src/screens/admin/CurrentAffairs/MonthlyCurrentAffairsScreen';
const Stack = createStackNavigator();

const CurrentAffairsStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Courses list screen */}
    <Stack.Screen
      name="MonthlyCurrentAffairsScreen"
      component={MonthlyCurrentAffairsScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Course form with back arrow */}
   <Stack.Screen
  name="AddMonthlyCurrentAffairsForm"
  component={AddMonthlyCurrentAffairsForm}
  options={({ route }) => ({
    title: route.params?.MonthlyyDailyCurrentAffairId ? 'Edit MonthlyDailyCurrentAffair' : 'Add New MonnthlyDailyCurrentAffair',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}

/>
  


  </Stack.Navigator>
);

export default CurrentAffairsStackNavigator;
