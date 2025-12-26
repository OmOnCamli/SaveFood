import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebaseConfig'; // Fixed import path

// Types
export interface Product {
    id: string;
    title: string;          // Changed from name
    description: string;
    price: number;          // Single price concept for simplicity in request, but code maps to discountedPrice usually
    originalPrice?: number; // Optional
    businessId: string;     // Changed from restaurantId
    address: string;
    latitude: number;
    longitude: number;
    available: boolean;
    createdAt: string;
    imageUrl?: string;      // Optional
}

export interface User {
    id: string;
    role: 'business' | 'consumer';
    name: string;
}

// Keys
const PRODUCTS_KEY = 'products';
const USER_KEY = 'currentUser';

// Helper: Geocode
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!firebaseConfig?.apiKey) return null;
    try {
        const encoded = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${firebaseConfig.apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.results && json.results.length > 0) {
            const loc = json.results[0].geometry.location;
            return { lat: loc.lat, lng: loc.lng };
        }
    } catch (e) {
        console.error("Geocoding error:", e);
    }
    return null;
};

// Data Logic
export const DataService = {
    // Helper exposed
    geocodeAddress,

    async init() {
        // No-op for Firestore, but good for local check if needed
    },

    async getProducts(): Promise<Product[]> {
        if (db) {
            // Firebase Mode
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                return querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // Map Firestore fields to Product interface if needed, or assume direct match
                    return {
                        id: doc.id,
                        ...data
                    } as Product;
                });
            } catch (e) {
                console.error("Error fetching from Firebase", e);
                return [];
            }
        } else {
            // Mock Mode (AsyncStorage)
            const json = await AsyncStorage.getItem(PRODUCTS_KEY);
            return json ? JSON.parse(json) : [];
        }
    },

    async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'latitude' | 'longitude'> & { address: string }) {
        // Geocode first
        let coords = { lat: 41.0082, lng: 28.9784 }; // Default Istanbul
        if (product.address) {
            const geo = await geocodeAddress(product.address);
            if (geo) coords = geo;
        }

        const newProduct = {
            ...product,
            latitude: coords.lat,
            longitude: coords.lng,
            createdAt: new Date().toISOString(),
            available: true,
            // Fallback fields for backwards compatibility if needed
            originalPrice: product.price * 1.5, // Mock logic
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        };

        if (db) {
            // Firebase Mode
            try {
                await addDoc(collection(db, "products"), newProduct);
            } catch (e) {
                console.error("Error adding to Firebase", e);
            }
        } else {
            // Mock Mode
            const productsJson = await AsyncStorage.getItem(PRODUCTS_KEY);
            const products = productsJson ? JSON.parse(productsJson) : [];
            const mockProduct = { ...newProduct, id: Math.random().toString() };
            await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify([mockProduct, ...products]));
        }
    },

    async purchaseProduct(id: string) {
        if (db) {
            // Firebase Mode
            try {
                const productRef = doc(db, "products", id);
                await updateDoc(productRef, { available: false });
            } catch (e) {
                console.error("Error updating in Firebase", e);
            }
        } else {
            // Mock Mode
            const productsJson = await AsyncStorage.getItem(PRODUCTS_KEY);
            let products = productsJson ? JSON.parse(productsJson) : [];
            products = products.map((p: Product) => p.id === id ? { ...p, available: false } : p);
            await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        }
    },

    async getCurrentUser(): Promise<User | null> {
        // Simplified user management
        const json = await AsyncStorage.getItem(USER_KEY);
        return json ? JSON.parse(json) : { id: 'user1', role: 'consumer', name: 'Demo User' };
    },

    async switchRole(role: 'business' | 'consumer') {
        const user: User = { id: role === 'business' ? 'biz1' : 'user1', role, name: role === 'business' ? 'Demo Restaurant' : 'Demo User' };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
    }
};
