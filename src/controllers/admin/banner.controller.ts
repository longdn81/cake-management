import { db } from '../../services/firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Banner, BannerData } from '../../models/banner.model';

export const addBannerToFirestore = async (newBanner: Banner): Promise<void> => {
  try {
    const bannerData = newBanner.toFirestore();
    // Lưu vào collection tên là 'banners'
    await addDoc(collection(db, 'banners'), bannerData);
    console.log('Banner added successfully!');
  } catch (error) {
    console.error('Error adding banner: ', error);
    throw error;
  }
};
export const getBanners = async (): Promise<Banner[]> => {
  try {
    const bannersRef = collection(db, 'banners');
    // Sắp xếp theo thời gian tạo mới nhất lên trước ('desc')
    const q = query(bannersRef, orderBy('createdAt', 'desc')); 
    
    const querySnapshot = await getDocs(q);
    
    const banners: Banner[] = [];
    querySnapshot.forEach((doc) => {
      banners.push(Banner.fromFirestore(doc));
    });

    return banners;
  } catch (error) {
    console.error('Error getting banners: ', error);
    return []; // Trả về mảng rỗng nếu lỗi để app không bị crash
  }
};

// --- 3. CẬP NHẬT BANNER ---
export const updateBanner = async (id: string, data: Partial<BannerData>): Promise<void> => {
  try {
    const bannerRef = doc(db, 'banners', id);
    await updateDoc(bannerRef, data);
    console.log('Banner updated successfully');
  } catch (error) {
    console.error('Error updating banner:', error);
    throw error;
  }
};

// --- 4. XÓA BANNER ---
export const deleteBanner = async (id: string): Promise<void> => {
  try {
    const bannerRef = doc(db, 'banners', id);
    await deleteDoc(bannerRef);
    console.log('Banner deleted successfully');
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw error;
  }
};