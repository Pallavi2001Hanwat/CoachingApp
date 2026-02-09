import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllDashboard_Items, deleteDashboard_Item } from '@/src/api/adminApi/DashboardItemApi';

const Dashboard_ItemsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [Dashboard_Items, setDashboard_Items] = useState<any[]>([]);

  const loadDashboard_Items = async () => {
    setLoading(true);
    try {
      const res = await getAllDashboard_Items();
      if (res.success) {
        setDashboard_Items(res.Dashboard_Items);
      }
    } catch (e) {
      console.log("Dashboard_Items load error", e);
    } finally {
      setLoading(false);
    }
  };

  // Auto load on screen focus
  useFocusEffect(
    useCallback(() => {
      loadDashboard_Items();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard_Items();
    setRefreshing(false);
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this Dashboard Item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteDashboard_Item(id);
              if (res.success) {
                Alert.alert("Deleted successfully");
                await loadDashboard_Items();
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Failed to delete item");
            }
          }
        }
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
      <Text style={styles.heading}>Dashboard Items</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddDashboard_ItemForm" as never)}
      >
        <Text style={styles.addButtonText}>+ Add Dashboard Item</Text>
      </TouchableOpacity>
    </View>

    <FlatList
      data={Dashboard_Items}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.title}>{item.Title}</Text>

            {item.Description && (
              <Text style={styles.desc}>
                {item.Description.length > 80
                  ? item.Description.slice(0, 80) + "..."
                  : item.Description}
              </Text>
            )}

            <Text style={styles.meta}>
              Type: {item.Type} | Visibility: {item.Visibility}
            </Text>
            <Text style={styles.meta}>
              Order: {item.OrderNumber} | Status: {item.Status}
            </Text>
          </View>

          {/* Image */}
          {item.Image && (
            <Image source={{ uri: item.Image }} style={styles.image} />
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsWrapper}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#ffffff", borderColor: "#5d3fd3" }]}
              onPress={() =>
                navigation.navigate("AddDashboard_ItemForm" as never, {
                  Dashboard_ItemId: item._id,
                } as never)
              }
            >
              <Text style={[styles.actionButtonText, { color: "#5d3fd3" }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButtonDELETE, { backgroundColor: "#dc3545" }]}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.actionButtonTextDELETE}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={<Text>No Dashboard Items found</Text>}
    />
  </View>
);


};

export default Dashboard_ItemsScreen;

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

  desc: { color: "#555", fontSize: 14, marginTop: 4 },

  meta: { color: "#666", fontSize: 13, marginTop: 4 },

  image: {
    width: "50%",
    height: 100,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  actionButtonsWrapper: {
    width: "100%",
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
  },

  actionButtonDELETE: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderColor: "#dc3545",
    borderWidth: 1,
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  actionButtonTextDELETE: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
