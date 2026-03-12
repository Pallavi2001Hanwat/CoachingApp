// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import PassswordScreen from '../screens/auth/PasswordScreen';
import VerifyotpScreen from '../screens/auth/VerifyOtpScreen';
import BeforeSignUPScreen from '../screens/auth/BeforeSignUP';

const Stack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
     <Stack.Screen name="Password" component={PassswordScreen} />
    <Stack.Screen name="VerifyotpScreen" component={VerifyotpScreen} />
      <Stack.Screen name="BeforeSignUPScreen" component={BeforeSignUPScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
