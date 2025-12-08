import { db } from '../../services/firebaseConfig';
import { collection, addDoc, query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Cake, CakeData } from '../../models/cake.model';

// Hàm thêm bánh mới vào Firestore
export const addCakeToFirestore = async (newCake: Cake): Promise<void> => {
  try {
    const cakeData = newCake.toFirestore();
    // Xóa trường id vì Firestore sẽ tự sinh ID mới
    // (Lưu ý: Logic này tùy thuộc vào việc bạn muốn tự tạo ID hay để Firestore tự tạo)
    const docRef = await addDoc(collection(db, 'cakes'), cakeData);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e; // Ném lỗi ra để màn hình UI bắt được và thông báo cho user
  }
};
// hàm lấy data
export const getCakes = async (): Promise<Cake[]> => {
  try {
    const cakesRef = collection(db, 'cakes');
    // Sắp xếp theo tên hoặc ngày tạo tùy bạn (ở đây mình không sort để mặc định)
    const q = query(cakesRef); 
    const querySnapshot = await getDocs(q);

    const cakes: Cake[] = [];
    querySnapshot.forEach((doc) => {
      // Sử dụng hàm fromFirestore static trong Model của bạn để convert dữ liệu
      cakes.push(Cake.fromFirestore(doc));
    });

    return cakes;
  } catch (e) {
    console.error('Error getting cakes: ', e);
    throw e;
  }
};
// --- 1. CẬP NHẬT BÁNH (EDIT) ---
export const updateCake = async (id: string, data: Partial<CakeData>): Promise<void> => {
  try {
    const cakeRef = doc(db, 'cakes', id);
    await updateDoc(cakeRef, data);
    console.log('Cake updated successfully');
  } catch (error) {
    console.error('Error updating cake:', error);
    throw error;
  }
};

// --- 2. XÓA BÁNH (DELETE) ---
export const deleteCake = async (id: string): Promise<void> => {
  try {
    const cakeRef = doc(db, 'cakes', id);
    await deleteDoc(cakeRef);
    console.log('Cake deleted successfully');
  } catch (error) {
    console.error('Error deleting cake:', error);
    throw error;
  }
};
