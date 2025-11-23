import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { ProductWithStatus } from "@/types";
import { format } from "date-fns";
import { Package, Calendar, User, FileText, MapPin, AlertCircle, Tag, ShoppingCart } from "lucide-react";

interface ProductDetailDialogProps {
    product: ProductWithStatus | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
    if (!product) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'safe': return 'text-green-600 bg-green-50 border-green-200';
            case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'expired': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Package className="h-6 w-6 text-purple-600" />
                        Chi tiết sản phẩm
                    </DialogTitle>
                    <DialogDescription>
                        Thông tin đầy đủ về sản phẩm
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Product Name & Type */}
                    <div className="space-y-3 pb-4 border-b">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Tên sản phẩm</div>
                            <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                                <Tag className="h-3 w-3 inline mr-1" />
                                {product.type}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(product.status)}`}>
                                {getStatusText(product.status)}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FileText className="h-4 w-4 text-purple-600" />
                                Mô tả
                            </div>
                            <p className="text-gray-600 pl-6 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                                {product.description}
                            </p>
                        </div>
                    )}

                    {/* Source */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            Nơi nhập hàng
                        </div>
                        <p className="text-gray-600 pl-6 bg-blue-50 p-3 rounded-lg">
                            {product.source || "Chưa cập nhật"}
                        </p>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <User className="h-4 w-4 text-purple-600" />
                            Thông tin khách hàng
                        </div>
                        <p className="text-gray-600 pl-6 whitespace-pre-wrap bg-green-50 p-3 rounded-lg">
                            {product.customerInfo || product.customerName || "Không có thông tin"}
                        </p>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="h-4 w-4 text-orange-600" />
                                Ngày bán
                            </div>
                            <p className="text-gray-900 font-medium text-lg pl-6">
                                {format(product.soldDate, "dd/MM/yyyy")}
                            </p>
                        </div>
                        <div className="space-y-2 bg-red-50 p-4 rounded-lg border border-red-100">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar className="h-4 w-4 text-red-600" />
                                Hạn sử dụng
                            </div>
                            <p className="text-gray-900 font-medium text-lg pl-6">
                                {format(product.expiryDate, "dd/MM/yyyy")}
                            </p>
                        </div>
                    </div>

                    {/* Days Remaining */}
                    <div className="space-y-2 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <AlertCircle className="h-4 w-4 text-purple-600" />
                            Thời gian còn lại
                        </div>
                        <p className={`text-4xl font-bold pl-6 ${product.daysRemaining <= 7 ? 'text-red-600' :
                                product.daysRemaining <= 30 ? 'text-yellow-600' :
                                    'text-green-600'
                            }`}>
                            {product.daysRemaining} ngày
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <FileText className="h-4 w-4 text-purple-600" />
                            Ghi chú
                        </div>
                        <p className="text-gray-600 pl-6 whitespace-pre-wrap bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            {product.notes || "Không có ghi chú"}
                        </p>
                    </div>

                    {/* Batch Number */}
                    {product.batchNumber && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <ShoppingCart className="h-4 w-4 text-purple-600" />
                                Số lô hàng
                            </div>
                            <p className="text-gray-600 pl-6 bg-gray-50 p-3 rounded-lg">
                                {product.batchNumber}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
