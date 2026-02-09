import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CurrentAffairsScreen from '../CurrentAffrais/CurrentAffairsScreen'
import PDFViewerScreen from '../PreviosYearPaper/PDFViewerScreen'
import VideoPlayerScreen from '../CurrentAffrais/VideoPlayerScreen'

const Stack = createNativeStackNavigator();

const CurrentAffairsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CurrentAffairsScreen"
        component={CurrentAffairsScreen}
        options={{ headerShown: true }}
      />

       <Stack.Screen
        name="PDFViewerScreen"
        component={PDFViewerScreen}
        options={{ headerShown: false }}
      />

         <Stack.Screen
        name="VideoPlayerScreen"
        component={VideoPlayerScreen}
        options={{ headerShown: false }}
      />
      

   


   

    </Stack.Navigator>
  );
};

export default CurrentAffairsStack;
