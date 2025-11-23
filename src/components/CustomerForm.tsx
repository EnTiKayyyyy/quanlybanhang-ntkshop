import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Customer } from "@/types";
import { useEffect } from "react";

const customerSchema = z.object({
    name: z.string().min(1, "Tên khách hàng là bắt buộc"),
    phone: z.string().min(1, "Số điện thoại là bắt buộc"),
    email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
    address: z.string().optional(),
    socialLinks: z.object({
        facebook: z.string().optional(),
        zalo: z.string().optional(),
        telegram: z.string().optional(),
    }).optional(),
    notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CustomerFormValues) => Promise<void>;
    initialData?: Customer | null;
}

export function CustomerForm({ open, onOpenChange, onSubmit, initialData }: CustomerFormProps) {
    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            address: "",
            socialLinks: {
                facebook: "",
                zalo: "",
                telegram: "",
            },
            notes: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                phone: initialData.phone,
                email: initialData.email || "",
                address: initialData.address || "",
                socialLinks: {
                    facebook: initialData.socialLinks?.facebook || "",
                    zalo: initialData.socialLinks?.zalo || "",
                    telegram: initialData.socialLinks?.telegram || "",
                },
                notes: initialData.notes || "",
            });
        } else {
            form.reset({
                name: "",
                phone: "",
                email: "",
                address: "",
                socialLinks: {
                    facebook: "",
                    zalo: "",
                    telegram: "",
                },
                notes: "",
            });
        }
    }, [initialData, form, open]);

    const handleSubmit = async (data: CustomerFormValues) => {
        await onSubmit(data);
        onOpenChange(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Sửa Khách Hàng" : "Thêm Khách Hàng"}</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin khách hàng mới vào bên dưới.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Tên *
                        </Label>
                        <div className="col-span-3">
                            <Input id="name" {...form.register("name")} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            SĐT *
                        </Label>
                        <div className="col-span-3">
                            <Input id="phone" {...form.register("phone")} />
                            {form.formState.errors.phone && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input id="email" className="col-span-3" {...form.register("email")} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                            Địa chỉ
                        </Label>
                        <Input id="address" className="col-span-3" {...form.register("address")} />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="facebook" className="text-right">
                            Facebook
                        </Label>
                        <Input id="facebook" className="col-span-3" {...form.register("socialLinks.facebook")} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="zalo" className="text-right">
                            Zalo
                        </Label>
                        <Input id="zalo" className="col-span-3" {...form.register("socialLinks.zalo")} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
