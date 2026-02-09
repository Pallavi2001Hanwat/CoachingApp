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
  createSyllabus,
  getSyllabusById,
  updateSyllabus,
} from "@/src/api/adminApi/SyllabusApi";
import { getAllSyllabusCategories } from "@/src/api/adminApi/SyllabusApi";

const AddSyllabusForm = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { SyllabusId } = route.params || {};

  const [loading, setLoading] = useState(false);

  // ------------------ FORM FIELDS ------------------
  const [Title, setTitle] = useState("");
  const [Description, setDescription] = useState("");
  const [SyllabusCategoryId, setSyllabusCategoryId] = useState("");
  const [PdfUrl, setPdfUrl] = useState("");
  const [PdfTitle, setPdfTitle] = useState("");
  const [Status, setStatus] = useState<"Active" | "Inactive">("Active");

  const [categories, setCategories] = useState<any[]>([]);

  // ------------------ LOAD DATA ------------------
  useEffect(() => {
    loadCategories();
    if (SyllabusId) {
      loadSyllabusDetails(SyllabusId);
    }
  }, [SyllabusId]);

  const loadCategories = async () => {
    try {
      const res = await getAllSyllabusCategories();
      if (res?.success) {
        setCategories(res.SyllabusCategories);
      }
    } catch (err) {
      console.log("Load categories error", err);
    }
  };

  const loadSyllabusDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getSyllabusById(id);
      if (res?.success) {
        const s = res.Syllabus;
        setTitle(s.Title || "");
        setDescription(s.Description || "");
        setSyllabusCategoryId(s.SyllabusCategoryId._id || "");
        setPdfUrl(s.PdfUrl || "");
        setStatus(s.Status || "Active");
      }
    } catch (err) {
      Alert.alert("Error loading syllabus details");
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
  const handleSaveSyllabus = async () => {
    if (!Title || !SyllabusCategoryId) {
      Alert.alert("Please fill all required fields");
      return;
    }

    try {
      const payload: any = {
        Title,
        Description,
        SyllabusCategoryId,
        Status,
      };

      // only send pdf if newly selected
      if (PdfUrl && PdfUrl.startsWith("data:")) {
        payload.PdfUrl = PdfUrl;
      }

      let res;
      if (SyllabusId) {
        res = await updateSyllabus(SyllabusId, payload);
      } else {
        res = await createSyllabus(payload);
      }

      if (res?.success) {
        Alert.alert(
          SyllabusId ? "Syllabus updated successfully" : "Syllabus added successfully"
        );
        navigation.goBack();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error saving syllabus");
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
          {SyllabusId ? "Edit Syllabus" : "Add New Syllabus"}
        </Text>

        {/* TITLE */}
        <TextInput
          placeholder="Syllabus Title"
          placeholderTextColor="#000"
          value={Title}
          onChangeText={setTitle}
          style={styles.input}
        />

        {/* DESCRIPTION */}
        <TextInput
          placeholder="Description"
          placeholderTextColor="#000"
          value={Description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100 }]}
        />

        {/* CATEGORY */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={SyllabusCategoryId}
            onValueChange={setSyllabusCategoryId}
            style={styles.picker}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((c) => (
              <Picker.Item
                key={c._id}
                label={c.CategoryName}
                value={c._id}
              />
            ))}
          </Picker>
        </View>

        {/* PDF PICKER */}
        <TouchableOpacity style={styles.imageButton} onPress={handlePdfPick}>
          <Text style={styles.imageButtonText}>
            {PdfUrl ? "Change PDF" : "Select PDF"}
          </Text>
        </TouchableOpacity>

        {PdfUrl ? (
          <Text style={{ marginBottom: 10 }}>
            Selected PDF: {PdfTitle || "Existing PDF"}
          </Text>
        ) : null}

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

        {/* SAVE */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveSyllabus}
        >
          <Text style={styles.buttonText}>
            {SyllabusId ? "Update" : "Add"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddSyllabusForm;


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
