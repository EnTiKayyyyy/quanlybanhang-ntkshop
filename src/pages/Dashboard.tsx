import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, AlertTriangle, XCircle, ArrowRight, TrendingUp, Clock, Eye, Edit } from "lucide-react";
import type { Product, ProductWithStatus } from "@/types";
import { format } from "date-fns";
import { useProducts } from "@/contexts/ProductsContext";
import { ProductDetailDialog } from "@/components/ProductDetailDialog";
import { ProductForm } from "@/components/ProductForm";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
    const { products, loading, updateProductOptimistic } = useProducts();
    const [stats, setStats] = useState({
        totalProducts: 0,
        expiringSoon: 0,
        expired: 0,
    });
    const [expiringProducts, setExpiringProducts] = useState<ProductWithStatus[]>([]);
    const [detailProduct, setDetailProduct] = useState<ProductWithStatus | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (!loading && products.length > 0) {
            const critical = products.filter(p => p.daysRemaining <= 7);
            const warning = products.filter(p => p.daysRemaining > 7 && p.daysRemaining <= 30);

            setStats({
                totalProducts: products.length,
                expiringSoon: warning.length,
                expired: critical.length,
            });

            setExpiringProducts(critical.slice(0, 5));
        }
    }, [products, loading]);

    const handleViewDetail = (product: ProductWithStatus) => {
        setDetailProduct(product);
        setIsDetailOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleUpdateProduct = async (data: any) => {
        if (!editingProduct) return;
        try {
            await updateProductOptimistic(editingProduct.id, data);
            setEditingProduct(null);
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Có lỗi xảy ra khi lưu sản phẩm.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Tổng Quan
                    </h2>
                    <p className="text-muted-foreground mt-1">Theo dõi sản phẩm và hạn sử dụng</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(), "dd/MM/yyyy")}</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Total Products Card */}
                <div className="relative overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-lg card-hover">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                    <div className="p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-primary">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Tổng Sản Phẩm</h3>
                        <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground mt-2">Đang quản lý</p>
                    </div>
                </div>

                {/* Warning Card */}
                <div className="relative overflow-hidden rounded-2xl bg-white border border-amber-100 shadow-lg card-hover">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                    <div className="p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-warning">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                7-30 ngày
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Sắp Hết Hạn</h3>
                        <div className="text-3xl font-bold text-amber-600">{stats.expiringSoon}</div>
                        <p className="text-xs text-muted-foreground mt-2">Cần chú ý</p>
                    </div>
                </div>

                {/* Critical Card */}
                <div className="relative overflow-hidden rounded-2xl bg-white border border-red-100 shadow-lg card-hover">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                    <div className="p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-danger">
                                <XCircle className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                ≤ 7 ngày
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Nguy Cấp</h3>
                        <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
                        <p className="text-xs text-muted-foreground mt-2">Cần xử lý ngay</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">
                <div className="p-6 border-b bg-gradient-to-r from-red-50 to-orange-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-danger rounded-full"></div>
                                Cần Chú Ý Ngay
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">Sản phẩm còn ≤ 7 ngày hết hạn</p>
                        </div>
                        <Link
                            to="/products"
                            className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors group"
                        >
                            Xem tất cả
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-3">
                        {expiringProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                    <Package className="h-8 w-8 text-green-600" />
                                </div>
                                <p className="text-lg font-medium text-gray-900">Tất cả sản phẩm đều an toàn</p>
                                <p className="text-sm text-muted-foreground mt-1">Không có sản phẩm nào cần chú ý</p>
                            </div>
                        ) : (
                            expiringProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-gradient-to-r from-red-50/50 to-orange-50/50 hover:shadow-md transition-all group"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{product.type}</div>
                                                <div className="text-sm text-muted-foreground mt-0.5">
                                                    {product.customerInfo || product.customerName || 'Khách lẻ'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-red-600">
                                                {product.daysRemaining}
                                            </div>
                                            <div className="text-xs text-red-500 font-medium">
                                                {product.daysRemaining === 0 ? 'Hôm nay' : 'ngày'}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => handleViewDetail(product)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 hover:bg-purple-50"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <ProductDetailDialog
                product={detailProduct}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />

            <ProductForm
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingProduct(null);
                }}
                onSubmit={handleUpdateProduct}
                initialData={editingProduct}
            />
        </div>
    );
}
