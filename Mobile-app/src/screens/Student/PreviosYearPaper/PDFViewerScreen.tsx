import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PDFViewerScreen = ({ route, navigation }: any) => {
  const { url } = route.params;
  console.log('PDF URL:', url);

  // Use Google Docs viewer to render PDF inside WebView
  const googleViewer = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <WebView
        source={{ uri: googleViewer }}
        style={{ flex: 1 }}
        useWebKit={true}
        startInLoadingState
      />
    </View>
  );
};

export default PDFViewerScreen;

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
  },
});
