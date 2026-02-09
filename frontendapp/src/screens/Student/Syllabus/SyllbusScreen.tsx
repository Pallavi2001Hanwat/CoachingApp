import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import {
  getSyllbusBySyllbusCategoryId,
} from "@/src/api/studentApi/SyllabusApi";

const StudentSyllabusScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { SyllabuscategoryId } = route.params;

  const [loading, setLoading] = useState(true);
  const [syllabus, setSyllabus] = useState<any[]>([]);

  useEffect(() => {
    loadSyllabus();
  }, []);

  const loadSyllabus = async () => {
    try {
      setLoading(true);
      const res = await getSyllbusBySyllbusCategoryId(SyllabuscategoryId);
      if (res?.success) {
        setSyllabus(res.Syllabus);
      }
    } catch (err) {
      console.log("Load syllabus error", err);
    } finally {
      setLoading(false);
    }
  };

  const openPDF = (url: string) => {
    navigation.navigate("PDFViewerScreen", { url });
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => item.PdfUrl && openPDF(item.PdfUrl)}
    >
      <Text style={styles.title}>{item.Title}</Text>

      {item.Description ? (
        <Text style={styles.meta}>
          {item.Description.length > 80
            ? item.Description.slice(0, 80) + "..."
            : item.Description}
        </Text>
      ) : null}

      <Text style={styles.meta}>📄 Tap to open PDF</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <FlatList
        data={syllabus}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No Syllabus found
          </Text>
        }
      />
    </View>
  );
};

export default StudentSyllabusScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    padding: 12,
    color: "#333",
  },

  card: {
    backgroundColor: "#f9f9f9",
    margin: 10,
    padding: 14,
    borderRadius: 8,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },

  meta: {
    fontSize: 13,
    color: "#555",
    marginTop: 6,
  },
});
