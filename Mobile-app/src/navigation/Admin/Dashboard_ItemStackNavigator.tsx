import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard_ItemsScreen from '@/src/screens/admin/DashboardItem/DashboardItemScreen';
import AddDashboard_ItemForm from '@/src/screens/admin/DashboardItem/AddDashboardItemForm';

const Stack = createStackNavigator();

const Dashboard_ItemsStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Dashboard_Items list screen */}
    <Stack.Screen
      name="Dashboard_ItemsScreen"
      component={Dashboard_ItemsScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Dashboard_Item form with back arrow */}
   <Stack.Screen
  name="AddDashboard_ItemForm"
  component={AddDashboard_ItemForm}
  options={({ route }) => ({
    title: route.params?.Dashboard_ItemId ? 'Edit Dashboard Item' : 'Add New Dashboard Item',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}

/>

  

  </Stack.Navigator>
);

export default Dashboard_ItemsStackNavigator;
