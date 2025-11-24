import { useState } from "react";
import { Plus, Trash2, Edit, X, Check } from "lucide-react";
import type { ProductTypeDefinition } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useProductTypes } from "@/contexts/ProductTypesContext";

export default function ProductTypes() {
    const { productTypes, loading, addProductTypeOptimistic, updateProductTypeOptimistic, deleteProductTypeOptimistic } = useProductTypes();
    const [newTypeName, setNewTypeName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const { toast } = useToast();

    const handleAddType = async () => {
        if (!newTypeName.trim()) return;

        try {
            await addProductTypeOptimistic(newTypeName.trim());
            setNewTypeName("");
            toast({
                title: "✅ Thành công",
                description: "Đã thêm loại sản phẩm mới.",
                className: "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50",
            });
        } catch (error) {
            console.error("Failed to add product type", error);
            toast({
                title: "❌ Lỗi",
                description: "Không thể thêm loại sản phẩm.",
                className: "border-red-200 bg-gradient-to-r from-red-50 to-orange-50",
            });
        }
    };

    const handleStartEdit = (type: ProductTypeDefinition) => {
        setEditingId(type.id);
        setEditingName(type.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editingName.trim()) return;

        try {
            await updateProductTypeOptimistic(editingId, editingName.trim());
            setEditingId(null);
            setEditingName("");
            toast({
                title: "✅ Thành công",
                description: "Đã cập nhật loại sản phẩm.",
                className: "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50",
            });
        } catch (error) {
            console.error("Failed to update product type", error);
            toast({
                title: "❌ Lỗi",
                description: "Không thể cập nhật loại sản phẩm.",
                className: "border-red-200 bg-gradient-to-r from-red-50 to-orange-50",
            });
        }
    };

    const handleDeleteType = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xoá loại sản phẩm này?")) return;

        try {
            await deleteProductTypeOptimistic(id);
            toast({
                title: "✅ Thành công",
                description: "Đã xoá loại sản phẩm.",
                className: "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50",
            });
        } catch (error) {
            console.error("Failed to delete product type", error);
            toast({
                title: "❌ Lỗi",
                description: "Không thể xoá loại sản phẩm.",
                className: "border-red-200 bg-gradient-to-r from-red-50 to-orange-50",
            });
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Quản Lý Loại Sản Phẩm</h2>
            </div>

            <div className="flex gap-4 items-end bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex-1 space-y-2">
                    <label htmlFor="newType" className="text-sm font-medium">Thêm loại mới</label>
                    <Input
                        id="newType"
                        placeholder="Nhập tên loại sản phẩm..."
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                    />
                </div>
                <Button onClick={handleAddType}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                </Button>
            </div>

            {loading ? (
                <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                    <div className="bg-muted h-12"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-t p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên Loại Sản Phẩm</TableHead>
                                <TableHead className="w-[150px] text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                        Chưa có loại sản phẩm nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                productTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell className="font-medium">
                                            {editingId === type.id ? (
                                                <Input
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveEdit();
                                                        if (e.key === 'Escape') handleCancelEdit();
                                                    }}
                                                    autoFocus
                                                    className="max-w-md"
                                                />
                                            ) : (
                                                type.name
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {editingId === type.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={handleSaveEdit}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleStartEdit(type)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteType(type.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
