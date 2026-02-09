import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PYPCategoryScreen from '@/src/screens/admin/PYPCategory/PYPCategoryScreen';
import AddPYPCategoryForm from '@/src/screens/admin/PYPCategory/AddPYPCategoryForm';
const Stack = createStackNavigator();

const PYPCategoryStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Courses list screen */}
    <Stack.Screen
      name="PYPCategoryScreen"
      component={PYPCategoryScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Course form with back arrow */}
   <Stack.Screen
  name="AddPYPCategoryForm"
  component={AddPYPCategoryForm}
  options={({ route }) => ({
    title: route.params?.PYPCategoryId ? 'Edit PYPCategory' : 'Add New PYPCategory',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}

/>

   {/* ✅ Add Course form with back arrow */}
  


  </Stack.Navigator>
);

export default PYPCategoryStackNavigator;
