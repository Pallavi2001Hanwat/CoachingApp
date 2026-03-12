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
  getAllDailyCurrentAffairs,
  getAllMonthlyCurrentAffairs,
} from "@/src/api/studentApi/CurrentAffairs";

type TabType = "VIDEOS" | "PDF" | "MONTHLY";

const CurrentAffairsScreen = () => {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<TabType>("VIDEOS");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === "MONTHLY") {
        const res = await getAllMonthlyCurrentAffairs();
        if (res?.success) setData(res.data);
      } else {
        const res = await getAllDailyCurrentAffairs();
        if (res?.success) {
          const filtered =
            activeTab === "VIDEOS"
              ? res.data.filter((i: any) => i.VideoUrl)
              : res.data.filter((i: any) => i.PdfUrl);

          setData(filtered);
        }
      }
    } catch (err) {
      console.log("Current Affairs load error", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ PDF OPEN
  const openPDF = (url: string) => {
    navigation.navigate("PDFViewerScreen", { url });
  };

  // ✅ VIDEO OPEN (FIXED)
  const openVideo = (url: string) => {
    navigation.navigate("VideoPlayerScreen", { url });
  };

  const renderItem = ({ item }: any) => {
    // 🔹 MONTHLY PDF
    if (activeTab === "MONTHLY") {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => item.PdfUrl && openPDF(item.PdfUrl)}
        >
          <Text style={styles.title}>
            {item.PdfTitle || "Monthly Current Affairs"}
          </Text>
          <Text style={styles.meta}>🗓️ {item.Month}</Text>
          <Text style={styles.meta}>🌐 {item.Language}</Text>
        </TouchableOpacity>
      );
    }

    // 🔹 DAILY VIDEO / PDF
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (activeTab === "VIDEOS" && item.VideoUrl) {
            openVideo(item.VideoUrl);
          }
          if (activeTab === "PDF" && item.PdfUrl) {
            openPDF(item.PdfUrl);
          }
        }}
      >
        <Text style={styles.title}>{item.Title}</Text>
        <Text style={styles.meta}>
          📅 {new Date(item.Date).toDateString()}
        </Text>

        <Text style={styles.meta}>
          {activeTab === "VIDEOS"
            ? "▶ Tap to play video"
            : "📄 Tap to open PDF"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {["VIDEOS", "PDF", "MONTHLY"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab as TabType)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No records found
            </Text>
          }
        />
      )}
    </View>
  );
};

export default CurrentAffairsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  activeTab: {
    borderBottomWidth: 3,
    borderColor: "#5d3fd3",
  },

  tabText: {
    fontWeight: "600",
    color: "#777",
  },

  activeTabText: {
    color: "#5d3fd3",
  },

  card: {
    backgroundColor: "#f9f9f9",
    margin: 10,
    padding: 12,
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
    marginTop: 4,
  },
});
