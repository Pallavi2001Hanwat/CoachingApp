import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import {
  getAllSyllabusCategories,
} from "@/src/api/studentApi/SyllabusApi";

const StudentSyllabusCategoryScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getAllSyllabusCategories();
      if (res?.success) {
        setCategories(res.SyllabusCategories);
      }
    } catch (err) {
      console.log("Load syllabus categories error", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("SyllbusScreen", {
          SyllabuscategoryId: item._id,
        })
      }
    >
      <Text style={styles.title}>{item.CategoryName}</Text>

      {item.Description ? (
        <Text style={styles.meta}>
          {item.Description.length > 80
            ? item.Description.slice(0, 80) + "..."
            : item.Description}
        </Text>
      ) : null}
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
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No Syllabus Categories found
          </Text>
        }
      />
    </View>
  );
};

export default StudentSyllabusCategoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#f9f9f9",
    margin: 10,
    padding: 14,
    borderRadius: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  meta: {
    fontSize: 13,
    color: "#555",
    marginTop: 6,
  },
});
