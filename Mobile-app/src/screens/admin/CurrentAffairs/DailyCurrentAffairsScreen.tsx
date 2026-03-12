import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  getAllDailyCurrentAffairs,
  deleteDailyCurrentAffairs,
} from "@/src/api/adminApi/CurrentAffairs";

const DailyCurrentAffairsScreen = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyAffairs, setDailyAffairs] = useState<any[]>([]);

  const loadDailyCurrentAffairs = async () => {
    try {
      setLoading(true);
      const res = await getAllDailyCurrentAffairs();

      if (res.success) {
        setDailyAffairs(res.data);
      }
    } catch (e) {
      console.log("DailyCurrentAffairs load error", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDailyCurrentAffairs();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailyCurrentAffairs();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this Daily Current Affairs?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteDailyCurrentAffairs(id);
              if (res.success) {
                Alert.alert("Deleted", "Record deleted successfully");
                loadDailyCurrentAffairs();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete record");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Daily Current Affairs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddDailyCurrentAffairsForm")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dailyAffairs}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text>No records found</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Top Content */}
            <View style={styles.cardTop}>
              <Text style={styles.title}>{item.Title}</Text>

              <Text style={styles.meta}>
                📅 {new Date(item.Date).toDateString()}
              </Text>

              <Text style={styles.meta}>🗓️ {item.Month}</Text>

              <Text style={styles.meta}>
                📄 PDF: {item.PdfUrl ? "Available" : "Not Available"}
              </Text>

              <Text style={styles.meta}>
                🎥 Video: {item.VideoUrl ? "Available" : "Not Available"}
              </Text>

              <Text style={styles.status}>
                Status: {item.Status}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionButtonsWrapper}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate("AddDailyCurrentAffairsForm", {
                    DailyCurrentAffairId: item._id,
                  })
                }
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButtonDELETE}
                onPress={() => handleDelete(item._id)}
              >
                <Text style={styles.actionTextDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default DailyCurrentAffairsScreen;



const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  heading: { fontSize: 20, fontWeight: "700" },

  addButton: {
    backgroundColor: "#5d3fd3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  addButtonText: { color: "#fff", fontWeight: "600" },

  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },

  cardTop: { gap: 4 },

  title: { fontSize: 16, fontWeight: "bold", color: "#333" },

  meta: { fontSize: 13, color: "#555" },

  status: { fontSize: 13, color: "#333", marginTop: 4 },

  actionButtonsWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 10,
  },

  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#5d3fd3",
  },

  actionButtonDELETE: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderColor: "#dc3545",
    borderWidth: 1,
    backgroundColor: "#dc3545",
  },

  actionButtonText: {
    color: "#5d3fd3",
    fontSize: 12,
    fontWeight: "600",
  },

  actionTextDelete: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
