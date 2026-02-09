import React, { useState ,useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';


import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { startOrResumeTestApi } from '../../../api/studentApi/AttemptStudentTest';

const AttemptTestScreen = ({ route, navigation }) => {

    const { duration, marks, testId ,PaperTitle} = route.params;
    const [agreed, setAgreed] = useState(false);



      /* ---------------- HEADER ---------------- */
   useEffect(() => {
    navigation.setOptions({
        title: PaperTitle,
        headerLeft: () => (
            <TouchableOpacity
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    }
                }}
                style={{ paddingHorizontal: 12 }}
            >
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
        ),
    });
}, [navigation, PaperTitle]);


const startTest = async () => {
  try {
    const res = await startOrResumeTestApi(testId);
console.log(res)
    if (res.success) {
      await AsyncStorage.setItem(
        `Attempt_${testId}`,
        JSON.stringify({
          AttemptId: res.AttemptId,
          StartTime: res.StartTime,
        })
      );

      navigation.navigate('TestQuestionScreen', {
        TestPaperId: testId,
        resume: res.resume,
      });
    }
  } catch (err) {
    console.log('Error', 'Unable to start test');
  }
};


    
    return (
        <View style={styles.container}>


            {/* Duration */}
            <View style={styles.infoBox}>
                <Text style={styles.label}>Duration</Text>
                <Text style={styles.value}>{duration} Minutes</Text>
            </View>

            {/* Marks */}
            <View style={styles.infoBox}>
                <Text style={styles.label}>Total Marks</Text>
                <Text style={styles.value}>{marks}</Text>
            </View>

            {/* Agreement */}
            <TouchableOpacity
                style={styles.agreeRow}
                onPress={() => setAgreed(!agreed)}
            >
                <View style={[
                    styles.checkbox,
                    agreed && styles.checkedBox,
                ]} />
                <Text style={styles.agreeText}>
                    I have read all instructions and agree to continue
                </Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity
                disabled={!agreed}
                style={[
                    styles.continueBtn,
                    !agreed && styles.disabledBtn,
                ]}
                 onPress={startTest}
            >
                <Text style={styles.continueText}>
                    Agree & Continue
                </Text>
            </TouchableOpacity>

        </View>
    );
};

export default AttemptTestScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },

    heading: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
        color: "#333",
    },

    infoBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 12,
    },

    label: {
        fontSize: 14,
        color: "#666",
    },

    value: {
        fontSize: 15,
        fontWeight: "700",
        color: "#333",
    },

    agreeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },

    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: "#5d3fd3",
        marginRight: 10,
        borderRadius: 4,
    },

    checkedBox: {
        backgroundColor: "#5d3fd3",
    },

    agreeText: {
        fontSize: 13,
        color: "#444",
        flex: 1,
    },

    continueBtn: {
        marginTop: 30,
        backgroundColor: "#5d3fd3",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },

    disabledBtn: {
        backgroundColor: "#ccc",
    },

    continueText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
