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
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getAllTopics, deleteTopic } from "@/src/api/adminApi/TopicsApi";

const TopicsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [Topics, setTopics] = useState<any[]>([]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const res = await getAllTopics();

      if (res.success) {
        setTopics(res.TopicOrClasss);
      }
    } catch (e) {
      console.log("Topics load error", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTopics();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this Topic?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deleteTopic(id);

            if (res.success) {
              Alert.alert("Deleted", "Topic deleted successfully");
              loadTopics();
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete Topic");
          }
        },
      },
    ]);
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
    {/* Header Section */}
    <View style={styles.headerRow}>
      <Text style={styles.heading}>Topics / Classes</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddTopicForm" as never)}
      >
        <Text style={styles.addButtonText}>+ Add</Text>
      </TouchableOpacity>
    </View>

    <FlatList
      data={Topics}
      keyExtractor={(item) => item._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text>No Topics found</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {/* Content */}
          <View style={styles.cardTop}>
            <Text style={styles.title}>{item.Title}</Text>

            {item.Description && (
              <Text style={styles.description}>
                {item.Description.length > 80
                  ? item.Description.slice(0, 80) + "..."
                  : item.Description}
              </Text>
            )}

            <Text style={styles.status}>
              📌 Type: {item.classType || "N/A"} | Duration: {item.Duration} min
            </Text>
            <Text style={styles.status}>
              Free: {item.isFree ? "Yes" : "No"} | Locked: {item.isLocked ? "Yes" : "No"}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsWrapper}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#ffffff" }]}
              onPress={() =>
                navigation.navigate("AddTopicForm" as never, { TopicId: item._id } as never)
              }
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButtonDELETE, { backgroundColor: "#dc3545" }]}
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

export default TopicsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

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
    flexDirection: "column",
    backgroundColor: "#f9f9f9",
    gap: 5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  cardTop: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
  },

  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  description: { fontSize: 14, color: "#555", marginTop: 4 },
  status: { fontSize: 13, color: "#666", marginTop: 4 },

  actions: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 10,
  },
   actionButtonsWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 10,
  },


  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },

 actionButtonDELETE: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderColor: '#dc3545',
    borderWidth: 1,
  },

  actionButtonText: {
    color: '#5d3fd3',
    fontSize: 12,
    fontWeight: '600',
  },
  actionTextDelete: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

