import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import {
  createTestSeries,
  getTestSerieById,
  updateTestSeries,
} from '@/src/api/adminApi/TestSeriesApi';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { getAllCategories } from '@/src/api/adminApi/CategoryApi';
const AddTestSeriesForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { TestSeriesId } = route.params || {};

  const [loading, setLoading] = useState(false);

  const [Title, setTitle] = useState('');
  const [Description, setDescription] = useState('');
  const [ImageUrl, setImageUrl] = useState('');
  const [Status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
  const [IsPaid, setIsPaid] = useState(false);
  const [Price, setPrice] = useState('');
  const [DiscountPrice, setDiscountPrice] = useState('');
  const [ValidityDays, setValidityDays] = useState('');

  // 🔹 Fetch TestSeries details when editing
  useEffect(() => {
    if (TestSeriesId) loadDetails(TestSeriesId);
  }, [TestSeriesId]);

  const loadDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await getTestSerieById(id);
      if (res?.success) {
        const t = res.TestSeries;
        console.log("t",t)
        setTitle(t.Title || '');
        setDescription(t.Description || '');
        setImageUrl(t.Image || '');
        setStatus(t.Status || 'Active');
        setIsPaid(t.IsPaid);
         setCategory(t.CategoryId._id || '');
        setPrice(t.Price?.toString() || '');
        setDiscountPrice(t.DiscountPrice?.toString() || '');
        setValidityDays(t.ValidityDays?.toString() || '');
      }
    } catch (error) {
      Alert.alert('Error loading Test Series details');
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
          loadCategories();
      }, []);
  
      const loadCategories = async () => {
          try {
              const res = await getAllCategories();
              if (res && res.success) setCategories(res.categories);
          } catch (error) {
              console.log('Error loading categories:', error);
          }
      };
  // 📸 Select Image
  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted')
      return Alert.alert('Permission required to access gallery');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUrl(`data:image/jpeg;base64,${asset.base64}`);
    }
  };

  // 💾 Save or Update TestSeries
  const handleSave = async () => {
    if (!Title || !Description)
      return Alert.alert('Please fill Title & Description');

    const payload = {
      Title,
      Description,
      Image: ImageUrl,
      Status,
      IsPaid,
         CategoryId: category,
      Price: IsPaid ? Number(Price) : 0,
      DiscountPrice: IsPaid ? Number(DiscountPrice) : 0,
      ValidityDays: IsPaid ? Number(ValidityDays) : 0,
    };

    try {
      let res;
      if (TestSeriesId) res = await updateTestSeries(TestSeriesId, payload);
      else res = await createTestSeries(payload);

      if (res?.success) {
        Alert.alert(
          `✅ Test Series ${TestSeriesId ? 'updated' : 'created'} successfully`
        );
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('❌ Failed to save Test Series');
    }
  };

 return (
  <KeyboardAvoidingView
    style={styles.flex}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.heading}>
        {TestSeriesId ? 'Edit Test Series' : 'Add New Test Series'}
      </Text>


            {/* ✅ Category Picker */}
                      <View style={styles.pickerContainer}>
                          <Text style={styles.label}>Category</Text>
                          <Picker
                              selectedValue={category}
                              onValueChange={(itemValue) => setCategory(itemValue)}
                              style={styles.picker}
                          >
                              <Picker.Item label="Select Category" value="" />
                              {categories.map((cat) => (
                                  <Picker.Item key={cat._id} label={cat.CategoryName} value={cat._id} />
                              ))}
                          </Picker>
                           <Text style={styles.arrow}>▼</Text>
                      </View>

      {/* Title */}
      <TextInput
        placeholder="Title"
        placeholderTextColor="#000"
        value={Title}
        onChangeText={setTitle}
        style={styles.input}
      />

      {/* Description */}
      <TextInput
        placeholder="Description"
        placeholderTextColor="#000"
        value={Description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea]}
      />

      {/* Image */}
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.label}>Image</Text>

        <TouchableOpacity
          style={styles.imageButton}
          onPress={handleSelectImage}
        >
          <Text style={styles.imageButtonText}>
            {ImageUrl ? 'Change Image' : 'Select Image'}
          </Text>
        </TouchableOpacity>

        {ImageUrl ? (
          <Image
            source={{ uri: ImageUrl }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.noImageText}>No image selected</Text>
        )}
      </View>

      {/* Paid / Free */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Is Paid</Text>
        <Picker
          selectedValue={IsPaid}
          onValueChange={(value) => setIsPaid(value)}
          style={styles.picker}
        >
          <Picker.Item label="Free" value={false} />
          <Picker.Item label="Paid" value={true} />
        </Picker>
        <Text style={styles.arrow}>▼</Text>
      </View>

      {/* Paid Fields */}
      {IsPaid && (
        <>
          <TextInput
            placeholder="Price"
            placeholderTextColor="#000"
            keyboardType="numeric"
            value={Price}
            onChangeText={setPrice}
            style={styles.input}
          />

          <TextInput
            placeholder="Discount Price"
            placeholderTextColor="#000"
            keyboardType="numeric"
            value={DiscountPrice}
            onChangeText={setDiscountPrice}
            style={styles.input}
          />

          <TextInput
            placeholder="Validity Days"
            placeholderTextColor="#000"
            keyboardType="numeric"
            value={ValidityDays}
            onChangeText={setValidityDays}
            style={styles.input}
          />
        </>
      )}

      {/* Status */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Status</Text>
        <Picker
          selectedValue={Status}
          onValueChange={(value) => setStatus(value)}
          style={styles.picker}
        >
          <Picker.Item label="Active" value="Active" />
          <Picker.Item label="Inactive" value="Inactive" />
        </Picker>
        <Text style={styles.arrow}>▼</Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {TestSeriesId ? 'Update Test Series' : 'Add Test Series'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  </KeyboardAvoidingView>
);

};

export default AddTestSeriesForm;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#000',
  },

  input: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    color: '#000',
    backgroundColor: '#fff',
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
    paddingLeft: 8,
    paddingTop: 6,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  picker: {
    color: '#000',
    backgroundColor: '#fff',
  },

  arrow: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
    color: '#5d3fd3',
    fontSize: 14,
    pointerEvents: 'none',
  },

  button: {
    backgroundColor: '#5d3fd3',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  imageButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#5d3fd3',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },

  imageButtonText: {
    color: '#5d3fd3',
    fontWeight: '600',
  },

  imagePreview: {
    width: '100%',
    height: 180,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  noImageText: {
    color: '#999',
    marginTop: 6,
  },
});

