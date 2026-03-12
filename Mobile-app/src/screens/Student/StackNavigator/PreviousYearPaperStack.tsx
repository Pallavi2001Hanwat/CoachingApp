import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PYPCategoryScreen from '../PreviosYearPaper/PYPCategoryScreen';
import PreviousYearPaperScreen from '../PreviosYearPaper/PreviousYearPaperScreen';
import PDFViewerScreen from '../PreviosYearPaper/PDFViewerScreen';

const Stack = createNativeStackNavigator();

const PreviousYearPaperStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PYPCategoryScreen"
        component={PYPCategoryScreen}
        options={{ headerShown: true }}
      />

      <Stack.Screen
  name="PreviousYearPaperScreen"
  component={PreviousYearPaperScreen}
  options={{
    headerShown: true,
  }}
/>


    

<Stack.Screen
  name="PDFViewerScreen"
  component={PDFViewerScreen}
  options={{ headerShown: false }}
/>


  


    </Stack.Navigator>
  );
};

export default PreviousYearPaperStack;
