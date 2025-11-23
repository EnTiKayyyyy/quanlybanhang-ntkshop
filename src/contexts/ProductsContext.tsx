import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/services/db';
import type { Product, ProductWithStatus } from '@/types';

interface ProductsContextType {
    products: ProductWithStatus[];
    loading: boolean;
    error: string | null;
    refreshProducts: () => Promise<void>;
    addProductOptimistic: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
    updateProductOptimistic: (id: string, data: Partial<Product>) => Promise<void>;
    deleteProductOptimistic: (id: string) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<ProductWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<number>(0);

    const CACHE_DURATION = 30000; // 30 seconds cache

    const refreshProducts = useCallback(async (force = false) => {
        const now = Date.now();

        // Use cache if available and not forced
        if (!force && now - lastFetch < CACHE_DURATION && products.length > 0) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getProducts();
            setProducts(data);
            setLastFetch(now);
        } catch (err) {
            console.error('Failed to load products', err);
            setError('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [lastFetch, products.length]);

    useEffect(() => {
        refreshProducts();
    }, []);

    const addProductOptimistic = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
        try {
            // Add to database
            await addProduct(productData);

            // Refresh to get the enriched product with status
            await refreshProducts(true);
        } catch (err) {
            console.error('Failed to add product', err);
            throw err;
        }
    };

    const updateProductOptimistic = async (id: string, data: Partial<Product>) => {
        // Optimistic update
        const oldProducts = [...products];
        setProducts(prev =>
            prev.map(p => p.id === id ? { ...p, ...data } as ProductWithStatus : p)
        );

        try {
            await updateProduct(id, data);
            // Refresh to get accurate status calculation
            await refreshProducts(true);
        } catch (err) {
            // Rollback on error
            setProducts(oldProducts);
            console.error('Failed to update product', err);
            throw err;
        }
    };

    const deleteProductOptimistic = async (id: string) => {
        // Optimistic delete
        const oldProducts = [...products];
        setProducts(prev => prev.filter(p => p.id !== id));

        try {
            await deleteProduct(id);
        } catch (err) {
            // Rollback on error
            setProducts(oldProducts);
            console.error('Failed to delete product', err);
            throw err;
        }
    };

    return (
        <ProductsContext.Provider
            value={{
                products,
                loading,
                error,
                refreshProducts: () => refreshProducts(true),
                addProductOptimistic,
                updateProductOptimistic,
                deleteProductOptimistic,
            }}
        >
            {children}
        </ProductsContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error('useProducts must be used within ProductsProvider');
    }
    return context;
}
