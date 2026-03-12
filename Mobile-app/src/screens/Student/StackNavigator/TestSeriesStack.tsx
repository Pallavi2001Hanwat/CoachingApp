import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestSeriesScreen from '../TestSeries/TestSeriesScreen'
import TestPaperScreen from '../TestPaper/TestPaperScreen';
import AttemptTestScreen from '../TestPaper/AttemptTestScreen';
import TestQuestionScreen from '../TestPaper/TestQuestionScreen';
import TestResultScreen from '../TestPaper/TestResultScreen';
const Stack = createNativeStackNavigator();

const TestSeriesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TestSeriesScreen"
        component={TestSeriesScreen}
        options={{ headerShown: true }}
      />

      <Stack.Screen
        name="TestPaperScreen"
        component={TestPaperScreen}
        options={{ headerShown: true }}
      />

      <Stack.Screen
    name="AttemptTestScreen"
    component={AttemptTestScreen}
    options={{ headerShown: true }}
/>

    <Stack.Screen
    name="TestQuestionScreen"
    component={TestQuestionScreen}
    options={{ headerShown: true }}
/>


    <Stack.Screen
    name="TestResultScreen"
    component={TestResultScreen}
    options={{ headerShown: true }}
/>


      {/* Future Screens */}
      {/* <Stack.Screen name="StartTestScreen" component={StartTestScreen} /> */}
    </Stack.Navigator>
  );
};

export default TestSeriesStack;
