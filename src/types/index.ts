export type ProductType = string;

export type ExpiryStatus = 'safe' | 'warning' | 'expired';

export interface ProductTypeDefinition {
    id: string;
    name: string;
    createdAt: Date;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    socialLinks: {
        facebook?: string;
        zalo?: string;
        telegram?: string;
    };
    email?: string;
    address?: string;
    notes?: string;
    createdAt: Date;
}

export interface Product {
    id: string;
    type: ProductType;
    name: string;
    description?: string;
    batchNumber?: string;
    source?: string;
    // purchaseDate: Date; // Removed as per request
    soldDate: Date;
    expiryDate: Date;
    customerInfo: string; // Merged field
    // Legacy fields (optional for backward compatibility)
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;

    notes?: string;
    createdAt: Date;
}

export interface ProductWithStatus extends Product {
    daysRemaining: number;
    status: ExpiryStatus;
}
