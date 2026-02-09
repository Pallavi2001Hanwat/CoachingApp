


// src/screens/user/CategoryScreen.tsx
import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
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
import { get_PaidCourseCategories } from '../../../api/studentApi/CategoryApi';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";



const CategoryScreen = () => {
    const { user } = useContext(AuthContext);
    const navigation = useNavigation();
    const route = useRoute<any>();

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('home');

    const tabListRef = useRef<FlatList>(null);

    const tabData = [
        { _id: 'home', CategoryName: 'Home' },
        { _id: 'new', CategoryName: 'New Courses' },
        ...categories,
    ];

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await get_PaidCourseCategories();
            if (res?.success) setCategories(res.categories || []);
        } catch {
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

useEffect(() => {
    navigation.setOptions({
        headerShown: true,
        headerTitle: 'Paid Courses',
        headerLeft: () => (
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ paddingHorizontal: 12 }}
            >
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
        ),
    });
}, [navigation]);


    useEffect(() => {
        fetchCategories();
    }, []);

    /** 🔑 Sync state from navigation params */
    useFocusEffect(
        useCallback(() => {
            if (route.params?.selectedCategory) {
                setSelectedCategory(route.params.selectedCategory);
            } else {
                setSelectedCategory('home');
            }
        }, [route.params?.selectedCategory])
    );

    /** 🔥 Scroll active tab to center */
    useEffect(() => {
        const index = tabData.findIndex(i => i._id === selectedCategory);
        if (index !== -1) {
            setTimeout(() => {
                tabListRef.current?.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0.5,
                });
            }, 100);
        }
    }, [selectedCategory, categories]);

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }


    const categoryListData = [
        { _id: 'new', CategoryName: 'New Courses', Description: 'Latest courses added recently' },
        ...categories,
    ];

    return (
        <View style={styles.container}>
            {/* 🔵 TABS */}
            <FlatList
                ref={tabListRef}
                horizontal
                data={tabData}
                keyExtractor={item => item._id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.tabBtn,
                            selectedCategory === item._id && styles.activeTab,
                        ]}
                        onPress={() => {
                            if (item._id === 'home') {
                                setSelectedCategory('home');
                            } else if (item._id === 'new') {
                                navigation.navigate('CoursesScreen', {
                                    isNewCourse: true,
                                    selectedCategory: 'new',
                                    categories,
                                    isPaid: true
                                });
                            } else {
                                navigation.navigate('CoursesScreen', {
                                    categoryId: item._id,
                                    selectedCategory: item._id,
                                    categories,
                                    isPaid: true
                                });
                            }
                        }}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedCategory === item._id && styles.activeTabText,
                            ]}
                        >
                            {item.CategoryName}
                        </Text>
                    </TouchableOpacity>
                )}
            />
            <Text style={styles.heading} >
                Exam Categories
            </Text>
            {/* 🔵 CATEGORY LIST */}

            <FlatList
                data={categoryListData}
                keyExtractor={item => item._id}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.categoryBox}
                        onPress={() => {
                            if (item._id === 'new') {
                                navigation.navigate('CoursesStack', {
                                    screen: 'CoursesScreen',
                                    params: {
                                        isNewCourse: true,
                                        selectedCategory: 'new',
                                        categories,
                                        isPaid: true,
                                    },
                                });
                            } else {
                                navigation.navigate('CoursesStack', {
                                    screen: 'CoursesScreen',
                                    params: {
                                        categoryId: item._id,
                                        selectedCategory: item._id,
                                        categories,
                                        isPaid: true,
                                    },
                                });
                            }
                        }}
                    >

                        <Image
                            source={{ uri: item.Image }} // 👈 API se image
                            style={styles.categoryImage}
                            resizeMode="contain"
                        />

                        <Text style={styles.categoryTitle} numberOfLines={2}>
                            {item.CategoryName}
                        </Text>
                    </TouchableOpacity>
                )}
            />


        </View>
    );
};

export default CategoryScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff"
    },

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

    heading: {
        color: "#000"
    },



    categoryBox: {
        width: "30%",          // ✅ 3 boxes per row
        height: 150,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        alignItems: "center",
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#eee",
        elevation: 2,          // android shadow
        shadowColor: "#000",   // ios shadow
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },

    categoryImage: {
        width: 90,
        height: 90,
        marginBottom: 8,
    },

    categoryTitle: {
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
        color: "#333",
    },
}); 