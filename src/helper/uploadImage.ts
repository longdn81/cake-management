import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Cấu hình Cloudinary (Nên đưa vào biến môi trường .env nếu có thể)
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "user-management";

/**
 * Hàm chọn ảnh từ thư viện
 * @returns {Promise<string | null>} Trả về URI của ảnh hoặc null nếu hủy/lỗi
 */
export const pickImageFromGallery = async (): Promise<string | null> => {
  // 1. Xin quyền truy cập
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission denied', 'We need permission to access your gallery');
    return null;
  }

  // 2. Mở thư viện ảnh
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true, // Cho phép cắt ảnh vuông (hoặc theo aspect)
    aspect: [4, 3],
    quality: 0.7, // Giảm chất lượng chút để upload nhanh
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }

  return null;
};

/**
 * Hàm upload ảnh lên Cloudinary
 * @param {string} uri - Đường dẫn ảnh trên máy (file://...)
 * @returns {Promise<string>} Trả về URL ảnh trên Cloudinary
 */
export const uploadToCloudinary = async (uri: string): Promise<string> => {
  try {
    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    // 1. Chuẩn bị thông tin file
    let filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
    
    // Đoán đuôi file
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image/jpeg`;

    // 2. Tạo FormData
    const formData = new FormData();
    
    // Lưu ý: React Native yêu cầu object { uri, name, type } cho file
    formData.append("file", {
      uri: uri, 
      name: filename,
      type: type, 
    } as any); // 'as any' để tránh lỗi TypeScript với FormData chuẩn
    
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    console.log("Starting upload to Cloudinary...", { filename });

    // 3. Gọi Fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: {
          'Accept': 'application/json',
          // Không set Content-Type thủ công khi dùng FormData
      },
    });

    const data = await response.json();
    
    if (data.secure_url) {
      console.log("Upload success:", data.secure_url);
      return data.secure_url;
    } else {
      console.log("Cloudinary error:", data);
      throw new Error("Upload thất bại: " + (data.error?.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Upload function error:", error);
    throw error;
  }
};