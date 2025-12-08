export interface CategoryData {
  name: string;
  icon: string;       // URL ảnh icon
  createdAt: number;
}

export class Category {
  id: string;
  name: string;
  icon: string;
  createdAt: number;

  constructor(
    id: string,
    name: string,
    icon: string,
    createdAt: number = Date.now()
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.createdAt = createdAt;
  }

  // Lưu lên Firestore
  toFirestore(): CategoryData {
    return {
      name: this.name,
      icon: this.icon,
      createdAt: this.createdAt,
    };
  }

  // Lấy từ Firestore về
  static fromFirestore(doc: any): Category {
    const data = doc.data();
    return new Category(
      doc.id,
      data.name || '',
      data.icon || '',
      data.createdAt || Date.now()
    );
  }
}