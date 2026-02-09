// src/screens/user/CoursesScreen.tsx
// src/screens/user/CoursesScreen.tsx
import React, { useEffect, useState, useContext, useRef, useLayoutEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Alert,
    Image
} from 'react-native';
import {
    getCoursesByCategoryId,
    getAll_Free_Courses,
    getAllCourses
} from '../../../api/studentApi/CoursesApi';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";



const CoursesScreen = () => {
    const { user } = useContext(AuthContext);
    const navigation = useNavigation();
    const route = useRoute<any>();
    const params = route.params || {};

    const {
        categoryId = null,
        categories = [],
        selectedCategory: selectedFromRoute = 'home',
        isPaid = false,
        isNewCourse = false,
    } = params;

    /* ---------------- STATES ---------------- */
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>(selectedFromRoute);

    console.log(activeCategory)
    /* ---------------- TABS ---------------- */
    const tabListRef = useRef<FlatList>(null);

    const tabData = [
        { _id: 'home', CategoryName: 'Home' },
        { _id: 'new', CategoryName: 'New Courses' },
        ...categories,
    ];

    /* 🔁 Sync route param → local state */
    useEffect(() => {
        setActiveCategory(selectedFromRoute);
    }, [selectedFromRoute]);

    /* 🔥 Scroll active tab to center */
    useEffect(() => {
        const index = tabData.findIndex(t => t._id === activeCategory);
        if (index !== -1) {
            setTimeout(() => {
                tabListRef.current?.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0.5,
                });
            }, 100);
        }
    }, [activeCategory, categories]);

    /* ---------------- FETCH COURSES ---------------- */
    const fetchCourses = async () => {
        try {
            setLoading(true);
            let res: any = null;

            if (isPaid && !isNewCourse && activeCategory && activeCategory !== 'home') {
                res = await getCoursesByCategoryId(activeCategory);
            }
            else if (isNewCourse) {
                res = await getAllCourses();
                if (res?.success) {
                    const now = new Date();
                    const last24hrs = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    res.courses = res.courses.filter((c: any) =>
                        new Date(c.CreatedAt) >= last24hrs
                    );
                }
            }
            else {
                res = await getAll_Free_Courses();
            }

            if (res?.success) {
                setCourses(res.courses || []);
            }
        } catch {
            Alert.alert("Error", "Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [activeCategory, isNewCourse]);

    /*---------Render--------------*/

    useLayoutEffect(() => {
        if (!tabData.length || !activeCategory) return;

        const index = tabData.findIndex(
            (item) => item._id === activeCategory
        );

        if (index >= 0) {
            requestAnimationFrame(() => {
                tabListRef.current?.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0.5, // 🔥 always center
                });
            });
        }
    }, [activeCategory, tabData.length]);


    /* ---------------- HEADER ---------------- */
  useEffect(() => {
    navigation.setOptions({
        headerTitle: isPaid ? 'Paid Courses' : 'Courses',
        headerShown: true, // Always show for Stack
        headerLeft: () => (
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ paddingHorizontal: 12 }}
            >
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
        ),
    });
}, [isPaid]);


    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCourses();
        setRefreshing(false);
    };

    /* ---------------- RENDER COURSE ---------------- */
    const renderCoursesItem = ({ item }: any) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>

            {/* 🔵 Course Image */}
            <Image
                source={{ uri: item.Image }}
                style={styles.courseImage}
                resizeMode="cover"
            />

            {/* 🔵 Title */}
            <Text style={styles.title}>{item.Title}</Text>

            {/* 🔵 Price & Level */}
            <Text style={styles.count}>
                {isPaid ? `Price: ₹${item.Price}` : "Free Course"} | Level: {item.Level}
            </Text>

            {/* 🔴 PAID COURSE BUTTONS */}
            {isPaid ? (
                <>
                    <View style={styles.rowButtons}>
                        <TouchableOpacity
                            style={styles.outlineBtn}
                            onPress={() => {
                                navigation.navigate('CoursesStack', {
                                    screen: 'BatchDetailsScreen',
                                    params: {
                                        courseId: item._id,
                                        title: item.Title,
                                        description: item.Description,
                                        image: item.Image,
                                        price: item.Price,
                                        level: item.Level,
                                    },
                                });
                            }}
                        >
                            <Text style={styles.outlineBtnText}>Batch Details</Text>
                        </TouchableOpacity>


                        <TouchableOpacity style={styles.outlineBtn}>
                            <Text style={styles.outlineBtnText}>View Demo</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.buyBtn}>
                        <Text style={styles.buyBtnText}>Buy Now</Text>
                    </TouchableOpacity>
                </>
            ) : (
                /* 🟢 FREE COURSE BUTTON */
                <TouchableOpacity style={styles.buyBtn}>
                    <Text style={styles.buyBtnText}>View Course</Text>
                </TouchableOpacity>
            )}

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

            {/* 🔵 CATEGORY TABS */}
            {
                isPaid &&
                <FlatList
                    ref={tabListRef}
                    horizontal
                    data={tabData}
                    keyExtractor={(item) => item._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ marginBottom: 15 }}

                    onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                            tabListRef.current?.scrollToIndex({
                                index: info.index,
                                animated: true,
                                viewPosition: 0.5,
                            });
                        }, 100);
                    }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.tabBtn,
                                activeCategory === item._id && styles.activeTab,
                            ]}
                            onPress={() => {
                                setActiveCategory(item._id);

                                if (item._id === 'home') {
                                    navigation.navigate('CategoryScreen', {
                                        selectedCategory: 'home',
                                    });
                                }
                                else if (item._id === 'new') {
                                    navigation.setParams({
                                        isNewCourse: true,
                                        selectedCategory: 'new',
                                        categoryId: null,
                                    });
                                }
                                else {
                                    navigation.setParams({
                                        categoryId: item._id,
                                        selectedCategory: item._id,
                                        isNewCourse: false,
                                    });
                                }
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeCategory === item._id && styles.activeTabText,
                                ]}
                            >
                                {item.CategoryName}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            }


            {/* 🔵 COURSE LIST */}
            <FlatList
                data={courses}
                keyExtractor={(item) => item._id}
                renderItem={renderCoursesItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No courses available.</Text>
                }
            />
        </View>
    );
};

export default CoursesScreen;

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },

    /* TABS */
    tabBtn: {
        paddingHorizontal: 25,
        height: 40,              // ✅ fixed height
        justifyContent: "center",// ✅ vertically center
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#5d3fd3",
    },

    activeTab: {
        backgroundColor: "#5d3fd3",
        borderColor: "#5d3fd3",
    },

    tabText: {
        fontSize: 14,
        color: "#5d3fd3",
        fontWeight: "600",
    },

    activeTabText: {
        color: "#fff",
        fontWeight: "700",
    },


    /* COURSE CARD */
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    title: { fontWeight: '700', fontSize: 17, marginBottom: 4 },
    desc: { fontSize: 13, color: '#666' },
    count: { fontSize: 13, fontWeight: '700', marginTop: 6 },

    emptyText: { textAlign: "center", marginTop: 40, color: "#888" },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    courseImage: {
        width: "100%",
        height: 160,
        backgroundColor: "#f2f2f2",
    },
    rowButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    outlineBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#5d3fd3",
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: "center",
        marginHorizontal: 4,
    },

    outlineBtnText: {
        color: "#5d3fd3",
        fontSize: 13,
        fontWeight: "600",
    },

    buyBtn: {
        backgroundColor: "#5d3fd3",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },

    buyBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },

});
