import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getProductTypes, addProductType, updateProductType, deleteProductType } from '@/services/db';
import type { ProductTypeDefinition } from '@/types';

interface ProductTypesContextType {
    productTypes: ProductTypeDefinition[];
    loading: boolean;
    error: string | null;
    refreshProductTypes: () => Promise<void>;
    addProductTypeOptimistic: (name: string) => Promise<void>;
    updateProductTypeOptimistic: (id: string, name: string) => Promise<void>;
    deleteProductTypeOptimistic: (id: string) => Promise<void>;
}

const ProductTypesContext = createContext<ProductTypesContextType | undefined>(undefined);

export function ProductTypesProvider({ children }: { children: ReactNode }) {
    const [productTypes, setProductTypes] = useState<ProductTypeDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<number>(0);

    const CACHE_DURATION = 60000; // 60 seconds cache (product types change less frequently)

    const refreshProductTypes = useCallback(async (force = false) => {
        const now = Date.now();

        // Use cache if available and not forced
        if (!force && now - lastFetch < CACHE_DURATION && productTypes.length > 0) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getProductTypes();
            setProductTypes(data);
            setLastFetch(now);
        } catch (err) {
            console.error('Failed to load product types', err);
            setError('Không thể tải danh sách loại sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [lastFetch, productTypes.length]);

    useEffect(() => {
        refreshProductTypes();
    }, []);

    const addProductTypeOptimistic = async (name: string) => {
        try {
            await addProductType(name);
            await refreshProductTypes(true);
        } catch (err) {
            console.error('Failed to add product type', err);
            throw err;
        }
    };

    const updateProductTypeOptimistic = async (id: string, name: string) => {
        // Optimistic update
        const oldTypes = [...productTypes];
        setProductTypes(prev =>
            prev.map(t => t.id === id ? { ...t, name } : t)
        );

        try {
            await updateProductType(id, name);
        } catch (err) {
            // Rollback on error
            setProductTypes(oldTypes);
            console.error('Failed to update product type', err);
            throw err;
        }
    };

    const deleteProductTypeOptimistic = async (id: string) => {
        // Optimistic delete
        const oldTypes = [...productTypes];
        setProductTypes(prev => prev.filter(t => t.id !== id));

        try {
            await deleteProductType(id);
        } catch (err) {
            // Rollback on error
            setProductTypes(oldTypes);
            console.error('Failed to delete product type', err);
            throw err;
        }
    };

    return (
        <ProductTypesContext.Provider
            value={{
                productTypes,
                loading,
                error,
                refreshProductTypes: () => refreshProductTypes(true),
                addProductTypeOptimistic,
                updateProductTypeOptimistic,
                deleteProductTypeOptimistic,
            }}
        >
            {children}
        </ProductTypesContext.Provider>
    );
}

export function useProductTypes() {
    const context = useContext(ProductTypesContext);
    if (!context) {
        throw new Error('useProductTypes must be used within ProductTypesProvider');
    }
    return context;
}
