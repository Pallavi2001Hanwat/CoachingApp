import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AddDailyCurrentAffairsForm from '@/src/screens/admin/CurrentAffairs/AddDailyCurrentAffairsForm';
import DailyCurrentAffairsScreen from '@/src/screens/admin/CurrentAffairs/DailyCurrentAffairsScreen';
const Stack = createStackNavigator();

const CurrentAffairsStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Courses list screen */}
    <Stack.Screen
      name="DailyCurrentAffairsScreen"
      component={DailyCurrentAffairsScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Course form with back arrow */}
   <Stack.Screen
  name="AddDailyCurrentAffairsForm"
  component={AddDailyCurrentAffairsForm}
  options={({ route }) => ({
    title: route.params?.DailyCurrentAffairId ? 'Edit DailyCurrentAffair' : 'Add New DailyCurrentAffair',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}

/>
  


  </Stack.Navigator>
);

export default CurrentAffairsStackNavigator;
