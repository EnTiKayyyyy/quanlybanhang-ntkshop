import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    Timestamp,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Customer, Product, ProductWithStatus, ExpiryStatus, ProductTypeDefinition } from "@/types";
import { differenceInDays, startOfDay } from "date-fns";

const CUSTOMERS_COLLECTION = "customers";
const PRODUCTS_COLLECTION = "products";
const PRODUCT_TYPES_COLLECTION = "product_types";

// Helper to convert Firestore data to local types
const convertDoc = <T>(doc: any): T => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        // Convert Timestamps to Dates
        createdAt: data.createdAt?.toDate(),
        // purchaseDate: data.purchaseDate?.toDate(), // Removed
        soldDate: data.soldDate?.toDate(),
        expiryDate: data.expiryDate?.toDate(),
    } as T;
};

// --- Product Type Services ---

export const getProductTypes = async (): Promise<ProductTypeDefinition[]> => {
    const q = query(collection(db, PRODUCT_TYPES_COLLECTION), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertDoc<ProductTypeDefinition>(doc));
};

export const addProductType = async (name: string): Promise<string> => {
    const docRef = await addDoc(collection(db, PRODUCT_TYPES_COLLECTION), {
        name,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
};

export const updateProductType = async (id: string, name: string): Promise<void> => {
    const docRef = doc(db, PRODUCT_TYPES_COLLECTION, id);
    await updateDoc(docRef, { name });
};

export const deleteProductType = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, PRODUCT_TYPES_COLLECTION, id));
};

// --- Customer Services ---

export const getCustomers = async (): Promise<Customer[]> => {
    const q = query(collection(db, CUSTOMERS_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertDoc<Customer>(doc));
};

export const addCustomer = async (customer: Omit<Customer, "id" | "createdAt">): Promise<string> => {
    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
        ...customer,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<void> => {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await updateDoc(docRef, data);
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, id));
};

// --- Product Services ---

export const getProducts = async (): Promise<ProductWithStatus[]> => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("expiryDate", "asc"));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => convertDoc<Product>(doc));

    // For backward compatibility, if customerInfo is empty but we have customerId, try to fill it?
    // Or just rely on what's there.
    // We can map old customerId to customerInfo if needed, but let's just return products.
    // The UI will handle displaying customerInfo or falling back to legacy fields if present.
    return products.map(p => enrichProduct(p));
};

export const getProductsByCustomer = async (customerId: string): Promise<ProductWithStatus[]> => {
    const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("customerId", "==", customerId),
        orderBy("expiryDate", "asc")
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => convertDoc<Product>(doc));
    return products.map(p => enrichProduct(p));
};

export const addProduct = async (product: Omit<Product, "id" | "createdAt">): Promise<string> => {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...product,
        createdAt: Timestamp.now(),
        // Ensure dates are Timestamps if passed as Dates
        // purchaseDate: Timestamp.fromDate(product.purchaseDate),
        soldDate: Timestamp.fromDate(product.soldDate),
        expiryDate: Timestamp.fromDate(product.expiryDate),
    });
    return docRef.id;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<void> => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const updateData = { ...data };

    // Convert Dates to Timestamps for update
    // if (data.purchaseDate) updateData.purchaseDate = Timestamp.fromDate(data.purchaseDate) as any;
    if (data.soldDate) updateData.soldDate = Timestamp.fromDate(data.soldDate) as any;
    if (data.expiryDate) updateData.expiryDate = Timestamp.fromDate(data.expiryDate) as any;

    await updateDoc(docRef, updateData);
};

export const deleteProduct = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
};

// --- Helpers ---

const enrichProduct = (product: Product): ProductWithStatus => {
    const today = startOfDay(new Date());
    const expiry = startOfDay(product.expiryDate);
    const daysRemaining = differenceInDays(expiry, today);

    let status: ExpiryStatus = 'safe';
    if (daysRemaining <= 3) {
        status = daysRemaining < 0 ? 'expired' : 'warning'; // Actually requirement says <= 7 is red.
        // Wait, requirement:
        // Green: > 30
        // Yellow: 7-30
        // Red: <= 7 or expired
    } else if (daysRemaining <= 15) {
        status = 'warning';
    }

    // Correction based on exact requirement:
    // Red: <= 7
    // Yellow: 7-30 (Exclusive of 7? "7-30" usually implies range. If <=7 is red, then 8-30 is yellow)
    // Let's refine:
    if (daysRemaining <= 3) {
        status = 'expired'; // Using 'expired' to mean "Critical/Red" as per UI requirement, though logic might distinguish actual expired.
        // Let's stick to the type 'safe' | 'warning' | 'expired' but map 'expired' to Red color which covers <=7.
    } else if (daysRemaining <= 15) {
        status = 'warning';
    } else {
        status = 'safe';
    }

    return {
        ...product,
        daysRemaining,
        status,
        // customerName: product.customerName || customerName || 'Khách lẻ'
        // Just return as is, UI will decide what to show (customerInfo or legacy customerName)
    };
};
