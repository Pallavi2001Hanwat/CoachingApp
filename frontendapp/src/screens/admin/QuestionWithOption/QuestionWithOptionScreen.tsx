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
import { getAllQuestionOptions, deleteQuestionOption } from '@/src/api/adminApi/QuestionWithOptionApi';

const QuestionWithOptionsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await getAllQuestionOptions();
      if (res.success) {
        setQuestions(res.questionswithoption);
      }
    } catch (e) {
      console.log("Questions load error", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadQuestions();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuestions();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this Question?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteQuestionOption(id);
              if (res.success) {
                Alert.alert("Question deleted successfully!");
                await loadQuestions();
              }
            } catch (error) {
              Alert.alert("Failed to delete question");
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
        <Text style={styles.heading}>Questions</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("AddQuestionWithOptionForm" as never)
          }
        >
          <Text style={styles.addButtonText}>+ Add Question</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* TOP CONTENT */}
            <View style={styles.cardTop}>
              {/* IMAGE */}
              {item.QuestionImage ? (
                <Image
                  source={{ uri: item.QuestionImage }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.noImageBox}>
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}

              {/* DETAILS */}
              <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.QuestionText}
                </Text>

                <Text style={styles.meta}>
                  📘 Type: {item.QuestionType}
                </Text>

                <Text style={styles.meta}>
                  🎯 Difficulty: {item.DifficultyLevel}
                </Text>

                <Text style={styles.meta}>
                  🧮 Marks: {item.Marks}
                  {item.NegativeMarks
                    ? ` | Negative: ${item.NegativeMarks}`
                    : ""}
                </Text>

                <Text style={styles.meta}>
                  ⏱ Time: {item.TimeAllowedInSeconds} sec
                </Text>

                <Text style={styles.meta}>
                  📌 Status: {item.Status}
                </Text>

                <Text style={styles.meta}>
                  🔢 Options: {item.Options?.length ?? 0}
                </Text>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionButtonsWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#ffffff" }]}
                onPress={() =>
                  navigation.navigate(
                    "AddQuestionWithOptionForm" as never,
                    { QuestionWithOptionId: item._id } as never
                  )
                }
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButtonDELETE,
                  { backgroundColor: "#dc3545" },
                ]}
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
        ListEmptyComponent={<Text>No Questions found</Text>}
      />
    </View>
  );
};

export default QuestionWithOptionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
  },

  addButton: {
    backgroundColor: "#5d3fd3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* CARD */
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },

  noImageBox: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#eaeaea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  noImageText: {
    fontSize: 12,
    color: "#777",
  },

  details: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  meta: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  /* ACTION BUTTONS */
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
    borderColor: "#5d3fd3",
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
    color: "#5d3fd3",
    fontSize: 12,
    fontWeight: "600",
  },

  actionButtonTextDELETE: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

