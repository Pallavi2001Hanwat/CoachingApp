// src/screens/user/StackNavigator/CategoryStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryScreen from '../Category/CategoryScreen';
import CoursesScreen from '../Courses/CoursesScreen';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const Stack = createNativeStackNavigator();

const CategoryStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={({ navigation, route }) => ({
          headerShown: true,
          headerTitle: route.params?.isPaid ? 'Paid Courses' : 'Courses',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="CoursesScreen"
        component={CoursesScreen}
        options={{ headerShown: false }} // CoursesStack me already header manage hota hai
      />
    </Stack.Navigator>
  );
};

export default CategoryStack;
