import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const VideoPlayerScreen = ({ route, navigation }: any) => {
  const { url } = route.params;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <Video
        source={{ uri: url }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        shouldPlay
      />
    </View>
  );
};

export default VideoPlayerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  header: {
    height: 50,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#000",
  },

  video: {
    flex: 1,
  },
});
