// Mock Firebase implementation using localStorage and CustomEvents for real-time updates

type CollectionName = 'students' | 'balances' | 'payments' | 'receipts' | 'adminUsers';

export interface Student {
  id: string; // Document ID
  studentId: string;
  name: string;
  course: string;
  yearLevel: string;
  email: string;
}

export interface Balance {
  id: string;
  studentId: string;
  feeType: string;
  description: string;
  balance: number;
  dueDate: string;
}

export interface PaymentItem {
  feeType: string;
  amount: number;
  balanceId: string;
}

export interface Payment {
  id: string;
  orderId: string;
  studentId: string;
  studentName: string;
  items: PaymentItem[];
  amount: number;
  paymentMethod: string;
  status: 'PENDING_FINANCE_REVIEW' | 'UNDER_REVIEW' | 'PAID_CONFIRMED' | 'REJECTED';
  createdAt: number;
  rejectReason?: string;
}

export interface Receipt {
  id: string;
  receiptNo: string;
  orderId: string;
  studentId: string;
  studentName: string;
  semester: string;
  items: PaymentItem[];
  amount: number;
  issuedAt: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

// Seed Data generator
const getSeedData = (uid: string) => ({
  students: [
    { id: uid, studentId: '2023-0001', name: 'John Doe', course: 'BS Computer Science', yearLevel: '3rd Year', email: 'john.doe@student.udd.edu' }
  ],
  adminUsers: [
    { id: 'admin_1', email: 'admin@udd.edu', name: 'Finance Admin', role: 'admin' }
  ],
  balances: [
    { id: 'bal_1', studentId: uid, feeType: 'Tuition Fee', description: 'First Semester 2026', balance: 25000, dueDate: '2026-05-15' },
    { id: 'bal_2', studentId: uid, feeType: 'Library Fine', description: 'Overdue Books', balance: 150, dueDate: '2026-04-01' },
    { id: 'bal_3', studentId: uid, feeType: 'Miscellaneous Fee', description: 'Lab Equipment', balance: 1500, dueDate: '2026-05-15' }
  ],
  payments: [],
  receipts: []
});

// Initialize DB
export const initDB = (uid: string = 'student_1') => {
  // We reset the DB every time to ensure the current kiosk user gets the mock data
  const seedData = getSeedData(uid);
  localStorage.setItem('students', JSON.stringify(seedData.students));
  localStorage.setItem('adminUsers', JSON.stringify(seedData.adminUsers));
  localStorage.setItem('balances', JSON.stringify(seedData.balances));
  
  // Only reset payments/receipts if they don't exist so we don't lose them during hot reloads
  if (!localStorage.getItem('payments')) {
    localStorage.setItem('payments', JSON.stringify(seedData.payments));
    localStorage.setItem('receipts', JSON.stringify(seedData.receipts));
  }
  
  localStorage.setItem('udd_db_initialized', 'true');
  window.dispatchEvent(new CustomEvent(`db_update_balances`));
  window.dispatchEvent(new CustomEvent(`db_update_payments`));
};

// Helper to get collection
export const getCollection = <T>(collection: CollectionName): T[] => {
  const data = localStorage.getItem(collection);
  return data ? JSON.parse(data) : [];
};

// Helper to set collection
export const setCollection = <T>(collection: CollectionName, data: T[]) => {
  localStorage.setItem(collection, JSON.stringify(data));
  // Dispatch event for real-time listeners
  window.dispatchEvent(new CustomEvent(`db_update_${collection}`));
};

// Firestore-like API
export const db = {
  collection: (collectionName: CollectionName) => ({
    get: async () => {
      return getCollection(collectionName);
    },
    add: async (data: any) => {
      const id = Math.random().toString(36).substring(2, 15);
      const items = getCollection(collectionName);
      const newItem = { ...data, id };
      items.push(newItem);
      setCollection(collectionName, items);
      return newItem;
    },
    doc: (id: string) => ({
      get: async () => {
        const items = getCollection<any>(collectionName);
        return items.find(item => item.id === id);
      },
      update: async (data: any) => {
        const items = getCollection<any>(collectionName);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
          items[index] = { ...items[index], ...data };
          setCollection(collectionName, items);
        }
      },
      delete: async () => {
        const items = getCollection<any>(collectionName);
        const filtered = items.filter(item => item.id !== id);
        setCollection(collectionName, filtered);
      }
    }),
    // Real-time listener
    onSnapshot: (callback: (data: any[]) => void) => {
      const handleUpdate = () => {
        callback(getCollection(collectionName));
      };
      // Initial call
      handleUpdate();
      window.addEventListener(`db_update_${collectionName}`, handleUpdate);
      return () => {
        window.removeEventListener(`db_update_${collectionName}`, handleUpdate);
      };
    }
  })
};

// Generate ID helper
export const generateId = () => Math.random().toString(36).substring(2, 15);
