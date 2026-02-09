import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CategoryScreen from '@/src/screens/admin/Category/CategoryScreen';
import AddCategoryForm from '@/src/screens/admin/Category/AddCategoryForm';

const Stack = createStackNavigator();

const CategoryStackNavigator = () => (
  <Stack.Navigator>
    {/* ✅ Categorys list screen */}
    <Stack.Screen
      name="CategoryScreen"
      component={CategoryScreen}
      options={{
        headerShown: false, // We'll use Drawer header for this one
      }}
    />

    {/* ✅ Add Category form with back arrow */}
   <Stack.Screen
  name="AddCategoryForm"
  component={AddCategoryForm}
  options={({ route }) => ({
    title: route.params?.CategoryId ? 'Edit Category' : 'Add New Category',
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: '#333',
  })}
/>

  </Stack.Navigator>
);

export default CategoryStackNavigator;
