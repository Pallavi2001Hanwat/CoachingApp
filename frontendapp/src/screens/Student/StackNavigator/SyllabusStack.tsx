import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SyllabusCategoryScreen from '../Syllabus/SyllabusCategoryScreen'
import PDFViewerScreen from '../PreviosYearPaper/PDFViewerScreen'
import SyllbusScreen from '../Syllabus/SyllbusScreen'

const Stack = createNativeStackNavigator();

const SyllabusStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SyllabusCategoryScreen"
        component={SyllabusCategoryScreen}
        options={{ headerShown: true }}
      />

       <Stack.Screen
        name="PDFViewerScreen"
        component={PDFViewerScreen}
        options={{ headerShown: false }}
      />

         <Stack.Screen
        name="SyllbusScreen"
        component={SyllbusScreen}
        options={({ route }) => ({
          headerTitle:  'Syllabus',
          headerShown: true,
        })}
      />
      

   


   

    </Stack.Navigator>
  );
};

export default SyllabusStack;
