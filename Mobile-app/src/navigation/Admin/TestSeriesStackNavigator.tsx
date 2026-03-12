import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TestSeriesScreen from '@/src/screens/admin/TestSeries/TestSeriesScreen';
import AddTestSeriesForm from '@/src/screens/admin/TestSeries/AddTestSeriesForm';

const Stack = createStackNavigator();

const TestSeriesStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ TestSeries list screen */}
    <Stack.Screen
      name="TestSeriesScreen"
      component={TestSeriesScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add TestSerie form with back arrow */}
   <Stack.Screen
  name="AddTestSeriesForm"
  component={AddTestSeriesForm}
  options={({ route }) => ({
    title: route.params?.TestSeriesId ? 'Edit TestSeries' : 'Add New TestSeries',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

  </Stack.Navigator>
);

export default TestSeriesStackNavigator;
