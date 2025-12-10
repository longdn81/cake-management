import { db } from '../../services/firebaseConfig';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    deleteDoc, 
    updateDoc, 
    doc, 
    where, // <--- QUAN TRỌNG: Cần import where
    DocumentData 
} from 'firebase/firestore'; 
import { InventoryItem, InventoryData } from '../../models/inventory.model';

const COLLECTION_NAME = "inventory";

// ➤ ADD ITEM (Thêm export để sửa lỗi ts(2305))
export const addInventoryToFirestore = async (
    newItem: InventoryItem
): Promise<void> => {
    try {
        const itemData = newItem.toFirestore();
        await addDoc(collection(db, COLLECTION_NAME), itemData as DocumentData);
    } catch (error) {
        console.error("Error adding inventory item: ", error);
        throw error;
    }
};

// ➤ GET LIST (Thêm tham số categoryFilter để sửa lỗi ts(2554))
export const getInventoryList = async (
    categoryFilter?: string 
): Promise<InventoryItem[]> => {
    try {
        const queryConstraints = [];

        // Logic lọc theo Category
        if (categoryFilter && categoryFilter !== "All") {
            queryConstraints.push(where("category", "==", categoryFilter));
        }

        queryConstraints.push(orderBy("createdAt", "desc"));

        const q = query(
            collection(db, COLLECTION_NAME),
            ...queryConstraints
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((d) => InventoryItem.fromFirestore(d));
    } catch (error) {
        console.error("Error getting inventory list with filter: ", error);
        return [];
    }
};

// ➤ UPDATE ITEM
export const updateInventoryItem = async (
    id: string,
    data: Partial<InventoryData>
): Promise<void> => {
    try {
        const itemRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(itemRef, data);
    } catch (error) {
        console.error("Error updating inventory item:", error);
        throw error;
    }
};

// ➤ DELETE ITEM
export const deleteInventoryItem = async (id: string): Promise<void> => {
    try {
        const itemRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(itemRef);
    } catch (error) {
        console.error("Error deleting inventory item:", error);
        throw error;
    }
};