import { DocumentSnapshot, Timestamp } from "firebase/firestore";

export interface InventoryData {
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
  lowStock: boolean;
  createdAt: Timestamp;
}

export class InventoryItem {
  id?: string;
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
  lowStock: boolean;
  createdAt: Timestamp;

  constructor(
    id: string | undefined,
    ingredient: string,
    quantity: number,
    unit: string,
    category: string = "Uncategorized",
    lowStock: boolean = false,
    createdAt: Timestamp = Timestamp.now()
  ) {
    this.id = id;
    this.ingredient = ingredient;
    this.quantity = quantity;
    this.unit = unit;
    this.category = category;
    this.lowStock = lowStock;
    this.createdAt = createdAt;
  }

  // 🔥 FIXED: KHÔNG reset createdAt khi update
  toFirestore(): InventoryData {
    return {
      ingredient: this.ingredient,
      quantity: this.quantity,
      unit: this.unit,
      category: this.category,
      lowStock: this.lowStock,
      createdAt: this.createdAt, // giữ nguyên timestamp
    };
  }

  static fromFirestore(doc: DocumentSnapshot): InventoryItem {
    const data = doc.data() as InventoryData;
    return new InventoryItem(
      doc.id,
      data.ingredient,
      data.quantity,
      data.unit,
      data.category ?? "Uncategorized",
      data.lowStock ?? false,
      data.createdAt ?? Timestamp.now()
    );
  }
}
