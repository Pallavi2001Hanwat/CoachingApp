import { createStackNavigator } from '@react-navigation/stack';
import StudentProfileScreen from '../StudentProfile/StudentProfileScreen';

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      
      <Stack.Screen
        name="StudentProfileScreen"
        component={StudentProfileScreen}
        options={({ route }) => ({
          headerTitle: 'My Profile' ,
          headerShown: true,
        })}
      />

     
    </Stack.Navigator>
  );
};

export default ProfileStack;
