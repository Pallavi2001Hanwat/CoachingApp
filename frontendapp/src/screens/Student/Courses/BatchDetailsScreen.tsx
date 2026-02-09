import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import CourseSubjectsList from './CourseSubjectsList';

/* ---------------- TYPES ---------------- */
type TabType = 'details' | 'content' | 'schedule';

const DESCRIPTION_LIMIT = 160;

/* ---------------- HEADER COMPONENT ---------------- */
const BatchDetailsHeader = ({
  title,
  activeTab,
  onTabChange,
}: {
  title: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => {
  return (
    <View style={styles.HeadrContainer}>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.headerTabs}>
        {['details', 'content', 'schedule'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.headerTabBtn,
              activeTab === tab && styles.headerActiveTab,
            ]}
            onPress={() => onTabChange(tab as TabType)}
          >
            <Text
              style={[
                styles.headerTabText,
                activeTab === tab && styles.headerActiveTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/* ---------------- SCREEN ---------------- */
const BatchDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();

  const {
    title = '',
    description = '',
    image,
    price,
    level,
    courseId,
  } = route.params || {};

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* 🔥 HEADER SETUP */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <BatchDetailsHeader
          title={title}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      ),
      headerStyle: { height: 120 },
    });
  }, [navigation, title, activeTab]);

  const isLongDesc = description.length > DESCRIPTION_LIMIT;
  const displayDesc =
    expanded || !isLongDesc
      ? description
      : description.substring(0, DESCRIPTION_LIMIT) + '...';

  /* ---------------- TAB CONTENT FUNCTIONS ---------------- */
  const renderDetails = () => (
    <View>
      <Text style={styles.meta}>Level: {level}</Text>
      <Text style={styles.desc}>{displayDesc}</Text>

      {isLongDesc && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.viewMore}>
            {expanded ? 'View Less' : 'View More'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderContent = () => {
    if (!courseId) {
      return <Text style={styles.placeholder}>Course ID not found</Text>;
    }
    return <CourseSubjectsList courseId={courseId} />;
  };

  const renderSchedule = () => (
    <Text style={styles.placeholder}>🗓 Batch schedule will be shown here</Text>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'content':
        return renderContent();
      case 'schedule':
        return renderSchedule();
      default:
        return renderDetails();
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.root}>
      {/* DETAILS/SCHEDULE IMAGE */}
      {activeTab !== 'content' && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      {/* CONTENT TAB */}
      {activeTab === 'content' ? (
        <CourseSubjectsList courseId={courseId} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.tabContent}>{renderTabContent()}</View>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* 🔥 FIXED BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <Text style={styles.price}>₹{price}</Text>
        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* 🔽 BOTTOM POPUP */}
      {showModal && (
        <View style={styles.overlay}>
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Text style={styles.sheetPrice}>₹{price}</Text>

            <TouchableOpacity style={styles.payBtn}>
              <Text style={styles.payBtnText}>Pay Online</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default BatchDetailsScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  HeadrContainer: { width: '100%' },
  headerTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  headerTabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee' },
  headerTabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  headerActiveTab: { borderBottomWidth: 2, borderColor: '#5d3fd3' },
  headerTabText: { fontSize: 13, color: '#777', fontWeight: '600' },
  headerActiveTabText: { color: '#5d3fd3', fontWeight: '700' },

  image: { width: '100%', height: 220, backgroundColor: '#f2f2f2' },

  tabContent: { padding: 16 },
  meta: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 10 },
  desc: { fontSize: 15, lineHeight: 22, color: '#333' },
  viewMore: { color: '#5d3fd3', fontSize: 14, fontWeight: '600', marginTop: 6 },
  placeholder: { fontSize: 15, color: '#666' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  price: { fontSize: 18, fontWeight: '700' },
  buyNowBtn: { backgroundColor: '#5d3fd3', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  buyNowText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  sheetTitle: { fontSize: 18, fontWeight: '700' },
  sheetPrice: { fontSize: 16, fontWeight: '700', color: '#5d3fd3', marginVertical: 10 },
  payBtn: { backgroundColor: '#5d3fd3', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  closeText: { textAlign: 'center', color: '#777' },
});
