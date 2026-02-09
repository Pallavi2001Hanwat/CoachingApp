import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import {
  createMonthlyCurrentAffairs,
  getMonthlyCurrentAffairsById,
  updateMonthlyCurrentAffairs,
} from "@/src/api/adminApi/CurrentAffairs";

const AddMonthlyCurrentAffairsForm = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { MonthlyCurrentAffairId } = route.params || {};

  const [loading, setLoading] = useState(false);

  // ------------------ FORM FIELDS ------------------
  const [Month, setMonth] = useState("");
  const [PdfUrl, setPdfUrl] = useState("");
  const [PdfTitle, setPdfTitle] = useState("");
  const [Language, setLanguage] = useState<"Hindi" | "English">("English");
  const [Status, setStatus] = useState<"Active" | "Inactive">("Active");

  // ------------------ LOAD DATA ------------------
  useEffect(() => {
    if (MonthlyCurrentAffairId) {
      loadMonthlyCurrentAffairsDetails(MonthlyCurrentAffairId);
    }
  }, [MonthlyCurrentAffairId]);

  const loadMonthlyCurrentAffairsDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getMonthlyCurrentAffairsById(id);
      if (res?.success) {
        const t = res.data;
        setMonth(t.Month || "");
        setPdfUrl(t.PdfUrl || "");
        setPdfTitle(t.PdfTitle || "");
        setLanguage(t.Language || "English");
        setStatus(t.Status || "Active");
      }
    } catch (err) {
      Alert.alert("Error loading Monthly Current Affairs details");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ PDF PICKER ------------------
  const uriToBase64 = async (uri: string, mimeType: string) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
    return `data:${mimeType};base64,${base64}`;
  };

  const handlePdfPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];

        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert("PDF too large (max 10MB)");
          return;
        }

        const base64Pdf = await uriToBase64(
          asset.uri,
          "application/pdf"
        );
        setPdfUrl(base64Pdf);
        setPdfTitle(asset.name);
      }
    } catch (error) {
      Alert.alert("Error picking PDF");
    }
  };

  // ------------------ SAVE ------------------
  const handleSaveMonthlyCurrentAffairs = async () => {
    if (!Month || !Language) {
      Alert.alert("Please fill all required fields");
      return;
    }

    try {
      const payload: any = {
        Month,
        Language,
        Status,
      };

      // Only include PDF if newly selected
      if (PdfUrl && PdfUrl.startsWith("data:")) {
        payload.PdfUrl = PdfUrl;
        payload.PdfTitle = PdfTitle;
      }

      let res;
      if (MonthlyCurrentAffairId) {
        res = await updateMonthlyCurrentAffairs(
          MonthlyCurrentAffairId,
          payload
        );
      } else {
        res = await createMonthlyCurrentAffairs(payload);
      }

      if (res?.success) {
        Alert.alert(
          MonthlyCurrentAffairId
            ? "Updated successfully"
            : "Added successfully"
        );
        navigation.goBack();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error saving data");
    }
  };

  // ------------------ UI ------------------
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>
          {MonthlyCurrentAffairId
            ? "Edit Monthly Current Affairs"
            : "Add New Monthly Current Affairs"}
        </Text>

        {/* MONTH */}
        <TextInput
          placeholder="Month (e.g. January 2026)"
          placeholderTextColor="#000"
          value={Month}
          onChangeText={setMonth}
          style={styles.input}
        />

        {/* PDF PICKER */}
        <TouchableOpacity style={styles.imageButton} onPress={handlePdfPick}>
          <Text style={styles.imageButtonText}>
            {PdfUrl ? "Change PDF" : "Select PDF"}
          </Text>
        </TouchableOpacity>
        {PdfUrl ? (
          <Text style={{ marginBottom: 10 }}>
            Selected PDF: {PdfTitle}
          </Text>
        ) : null}

        {/* LANGUAGE */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Language</Text>
          <Picker
            selectedValue={Language}
            onValueChange={setLanguage}
            style={styles.picker}
          >
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Hindi" value="Hindi" />
          </Picker>
        </View>

        {/* STATUS */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Status</Text>
          <Picker
            selectedValue={Status}
            onValueChange={setStatus}
            style={styles.picker}
          >
            <Picker.Item label="Active" value="Active" />
            <Picker.Item label="Inactive" value="Inactive" />
          </Picker>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveMonthlyCurrentAffairs}
        >
          <Text style={styles.buttonText}>
            {MonthlyCurrentAffairId ? "Update" : "Add"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddMonthlyCurrentAffairsForm;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#5d3fd3",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    color: "#000",
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
    paddingLeft: 8,
    paddingTop: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#5d3fd3",
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  picker: { color: "#000", backgroundColor: "#fff" },
  button: {
    backgroundColor: "#5d3fd3",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#5d3fd3",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  imageButtonText: {
    color: "#5d3fd3",
    fontWeight: "600",
  },
});
