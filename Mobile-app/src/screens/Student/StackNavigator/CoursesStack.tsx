import { createStackNavigator } from '@react-navigation/stack';
import CoursesScreen from '../Courses/CoursesScreen';
import BatchDetailsScreen from '../Courses/BatchDetailsScreen';

const Stack = createStackNavigator();

const CoursesStack = () => {
  return (
    <Stack.Navigator>
      {/* CoursesScreen */}
      <Stack.Screen
        name="CoursesScreen"
        component={CoursesScreen}
        options={({ route }) => ({
          headerTitle: route.params?.isPaid ? 'Paid Courses' : 'Courses',
          headerShown: true,
        })}
      />

      {/* BatchDetailsScreen */}
      <Stack.Screen
        name="BatchDetailsScreen"
        component={BatchDetailsScreen}
        options={({ route }) => ({
          headerTitle: route.params?.Title ?? 'Batch Details',
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
};

export default CoursesStack;
