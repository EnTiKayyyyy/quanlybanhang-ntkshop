import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types";
import { useEffect } from "react";
import { format, addMonths } from "date-fns";
import { useProductTypes } from "@/contexts/ProductTypesContext";

const productSchema = z.object({
    type: z.string().min(1, "Loại sản phẩm là bắt buộc"),
    name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
    description: z.string().optional(),
    batchNumber: z.string().optional(),
    source: z.string().optional(),
    soldDate: z.string().min(1, "Ngày bán là bắt buộc"),
    expiryDate: z.string().min(1, "Ngày hết hạn là bắt buộc"),
    customerInfo: z.string().optional(),
    notes: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: Product | null;
}

export function ProductForm({ open, onOpenChange, onSubmit, initialData }: ProductFormProps) {
    const { productTypes } = useProductTypes();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            type: '',
            name: "",
            description: "",
            batchNumber: "",
            source: "",
            soldDate: format(new Date(), "yyyy-MM-dd"),
            expiryDate: "",
            customerInfo: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                type: initialData.type,
                name: initialData.name,
                description: initialData.description || "",
                batchNumber: initialData.batchNumber || "",
                source: initialData.source || "",
                soldDate: format(initialData.soldDate, "yyyy-MM-dd"),
                expiryDate: format(initialData.expiryDate, "yyyy-MM-dd"),
                customerInfo: initialData.customerInfo || initialData.customerName || "", // Fallback to legacy name if info missing
                notes: initialData.notes || "",
            });
        } else {
            form.reset({
                type: '',
                name: "",
                description: "",
                batchNumber: "",
                source: "",
                soldDate: format(new Date(), "yyyy-MM-dd"),
                expiryDate: "",
                customerInfo: "",
                notes: "",
            });
        }
    }, [initialData, form, open]);

    const handleSubmit = async (data: ProductFormValues) => {
        // Convert string dates back to Date objects
        const formattedData = {
            ...data,
            soldDate: new Date(data.soldDate),
            expiryDate: new Date(data.expiryDate),
        };
        await onSubmit(formattedData);
        onOpenChange(false);
        form.reset();
    };

    const handleQuickExpiry = (months: number) => {
        const soldDateStr = form.getValues("soldDate");
        const baseDate = soldDateStr ? new Date(soldDateStr) : new Date();
        const newExpiry = addMonths(baseDate, months);
        form.setValue("expiryDate", format(newExpiry, "yyyy-MM-dd"));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm"}</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin sản phẩm đã bán.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Loại sản phẩm</Label>
                            <Controller
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {productTypes.map(t => (
                                                <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                                            ))}
                                            <SelectItem value="Khác">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.type && (
                                <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên sản phẩm *</Label>
                            <Input id="name" {...form.register("name")} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customerInfo">Thông tin khách hàng</Label>
                        <Textarea
                            id="customerInfo"
                            {...form.register("customerInfo")}
                            placeholder="Link facebook, Zalo, SĐT, ..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả / Chi tiết</Label>
                        <Input id="description" {...form.register("description")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="source">Nơi nhập hàng</Label>
                        <Input id="source" {...form.register("source")} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="soldDate">Ngày bán</Label>
                            <Input type="date" id="soldDate" {...form.register("soldDate")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Hạn sử dụng *</Label>
                            <div className="flex gap-2 mb-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickExpiry(1)}>+1T</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickExpiry(3)}>+3T</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickExpiry(6)}>+6T</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickExpiry(12)}>+12T</Button>
                            </div>
                            <Input type="date" id="expiryDate" {...form.register("expiryDate")} />
                            {form.formState.errors.expiryDate && (
                                <p className="text-sm text-destructive">{form.formState.errors.expiryDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <Input id="notes" {...form.register("notes")} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {form.formState.isSubmitting ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
