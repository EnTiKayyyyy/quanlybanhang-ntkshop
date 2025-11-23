import { useState } from "react";
import { Plus, Search, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, Download, Eye } from "lucide-react";
import type { Product, ProductWithStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductForm } from "@/components/ProductForm";
import { ProductDetailDialog } from "@/components/ProductDetailDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { exportToCSV } from "@/lib/export";
import { useProducts } from "@/contexts/ProductsContext";
import { useProductTypes } from "@/contexts/ProductTypesContext";

export default function Products() {
    const { products, loading, addProductOptimistic, updateProductOptimistic, deleteProductOptimistic } = useProducts();
    const { productTypes } = useProductTypes();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showExpiringOnly, setShowExpiringOnly] = useState(false);
    const [detailProduct, setDetailProduct] = useState<ProductWithStatus | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleAddProduct = async (data: any) => {
        try {
            if (editingProduct) {
                await updateProductOptimistic(editingProduct.id, data);
            } else {
                await addProductOptimistic(data);
            }
            setEditingProduct(null);
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Có lỗi xảy ra khi lưu sản phẩm.");
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) {
            try {
                await deleteProductOptimistic(id);
            } catch (error) {
                console.error("Failed to delete product", error);
            }
        }
    };

    const handleExport = () => {
        const dataToExport = filteredProducts.map(p => ({
            "Tên Sản Phẩm": p.name,
            "Loại": p.type,
            "Mô Tả": p.description || "",
            "Nơi Nhập Hàng": p.source || "",
            "Khách Hàng": p.customerInfo || p.customerName || "",
            "Ngày Bán": format(p.soldDate, "dd/MM/yyyy"),
            "Hạn Sử Dụng": format(p.expiryDate, "dd/MM/yyyy"),
            "Còn Lại (ngày)": p.daysRemaining,
            "Trạng Thái": p.status === 'safe' ? 'An toàn' : p.status === 'warning' ? 'Sắp hết hạn' : 'Hết hạn',
            "Ghi Chú": p.notes || ""
        }));
        exportToCSV(dataToExport, "danh-sach-san-pham");
    };

    const handleViewDetail = (product: ProductWithStatus) => {
        setDetailProduct(product);
        setIsDetailOpen(true);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.customerInfo || p.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.source || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "all" || p.status === filterStatus;

        const matchesType = filterType === "all" || p.type === filterType;

        const matchesExpiring = showExpiringOnly ? p.daysRemaining <= 7 : true;

        return matchesSearch && matchesStatus && matchesType && matchesExpiring;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'safe': return 'bg-green-100 text-green-800 border-green-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'expired': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'safe': return <CheckCircle className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'expired': return <XCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'safe': return 'An toàn';
            case 'warning': return 'Sắp hết hạn';
            case 'expired': return 'Hết hạn / Nguy cấp';
            default: return '';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <h2 className="text-2xl font-bold tracking-tight">Sản Phẩm Đã Bán</h2>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={showExpiringOnly ? "destructive" : "outline"}
                        onClick={() => setShowExpiringOnly(!showExpiringOnly)}
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {showExpiringOnly ? "Đang lọc: Sắp hết hạn" : "Lọc Sắp Hết Hạn"}
                    </Button>
                    <Button variant="success" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Xuất Excel
                    </Button>
                    <Button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm Sản Phẩm
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Tìm theo tên, khách hàng, mô tả, nơi nhập..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-[200px]">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Loại sản phẩm" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả loại</SelectItem>
                            {productTypes.map(type => (
                                <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-[200px]">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="safe">An toàn (&gt; 30 ngày)</SelectItem>
                            <SelectItem value="warning">Cảnh báo (7-30 ngày)</SelectItem>
                            <SelectItem value="expired">Nguy cấp (&le; 7 ngày)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {/* Desktop skeleton */}
                    <div className="hidden md:block border rounded-lg overflow-hidden">
                        <div className="bg-muted h-12"></div>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="border-t p-4 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Mobile skeleton */}
                    <div className="md:hidden grid gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="border rounded-lg p-4 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop Table View */}
                    <div className="hidden md:block border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-3">Loại sản phẩm</th>
                                    <th className="px-4 py-3">Nơi nhập hàng</th>
                                    <th className="px-4 py-3">Khách hàng</th>
                                    <th className="px-4 py-3">Ghi chú</th>
                                    <th className="px-4 py-3">Ngày hết hạn</th>
                                    <th className="px-4 py-3">Còn lại</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="bg-card hover:bg-accent/50 transition-colors">
                                        <td className="px-4 py-3 font-medium">
                                            {product.type}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-xs truncate text-sm" title={product.source}>
                                                {product.source || "-"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-xs truncate" title={product.customerInfo || product.customerName}>
                                                {product.customerInfo || product.customerName || "-"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-xs truncate text-sm text-muted-foreground" title={product.notes}>
                                                {product.notes || "-"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{format(product.expiryDate, "dd/MM/yyyy")}</td>
                                        <td className="px-4 py-3 font-bold">
                                            {product.daysRemaining} ngày
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(product.status))}>
                                                {getStatusIcon(product.status)}
                                                {getStatusText(product.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleViewDetail(product)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(product)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden grid gap-4">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className={cn("border rounded-lg p-4 bg-card shadow-sm relative", getStatusColor(product.status))}>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/50 hover:bg-white/80 text-blue-600" onClick={() => handleViewDetail(product)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/50 hover:bg-white/80" onClick={() => handleEdit(product)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/50 hover:bg-white/80 text-destructive" onClick={() => handleDelete(product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="mb-2 pr-32">
                                    <h3 className="font-bold text-lg">{product.type}</h3>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <p><span className="font-semibold">Nơi nhập:</span> {product.source || "-"}</p>
                                    <p><span className="font-semibold">Khách:</span> {product.customerInfo || product.customerName || "-"}</p>
                                    <p><span className="font-semibold">Ghi chú:</span> {product.notes || "-"}</p>
                                    <p><span className="font-semibold">Hết hạn:</span> {format(product.expiryDate, "dd/MM/yyyy")}</p>
                                    <p><span className="font-semibold">Còn lại:</span> {product.daysRemaining} ngày</p>
                                    <div className="mt-2 inline-flex items-center gap-1 font-medium">
                                        {getStatusIcon(product.status)}
                                        {getStatusText(product.status)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            Không tìm thấy sản phẩm nào phù hợp.
                        </div>
                    )}
                </div>
            )}

            <ProductForm
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingProduct(null);
                }}
                onSubmit={handleAddProduct}
                initialData={editingProduct}
            />

            <ProductDetailDialog
                product={detailProduct}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </div>
    );
}
