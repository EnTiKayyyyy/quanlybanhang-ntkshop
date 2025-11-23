import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Phone, Download } from "lucide-react";
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "@/services/db";
import type { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerForm } from "@/components/CustomerForm";
import { exportToCSV } from "@/lib/export";
import { format } from "date-fns";

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to load customers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (data: any) => {
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, data);
            } else {
                await addCustomer(data);
            }
            loadCustomers();
            setEditingCustomer(null);
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to save customer", error);
            alert("Có lỗi xảy ra khi lưu khách hàng.");
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xoá khách hàng này?")) {
            try {
                await deleteCustomer(id);
                loadCustomers();
            } catch (error) {
                console.error("Failed to delete customer", error);
            }
        }
    };

    const handleExport = () => {
        const dataToExport = filteredCustomers.map(c => ({
            "Tên Khách Hàng": c.name,
            "Số Điện Thoại": c.phone,
            "Email": c.email || "",
            "Địa Chỉ": c.address || "",
            "Facebook": c.socialLinks?.facebook || "",
            "Zalo": c.socialLinks?.zalo || "",
            "Telegram": c.socialLinks?.telegram || "",
            "Ghi Chú": c.notes || "",
            "Ngày Tạo": format(c.createdAt, "dd/MM/yyyy")
        }));
        exportToCSV(dataToExport, "danh-sach-khach-hang");
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <h2 className="text-2xl font-bold tracking-tight">Danh Sách Khách Hàng</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Xuất Excel
                    </Button>
                    <Button onClick={() => { setEditingCustomer(null); setIsFormOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm Khách Hàng
                    </Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-8">Đang tải...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(customer)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(customer.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex justify-between items-start mb-2 pr-16">
                                <h3 className="font-semibold text-lg">{customer.name}</h3>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>SĐT: {customer.phone}</p>
                                {customer.email && <p>Email: {customer.email}</p>}
                                {customer.address && <p>Đ/c: {customer.address}</p>}
                                <div className="flex gap-2 mt-2">
                                    {customer.socialLinks?.facebook && <a href={customer.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">FB</a>}
                                    {customer.socialLinks?.zalo && <span className="text-blue-500">Zalo: {customer.socialLinks.zalo}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredCustomers.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                            Không tìm thấy khách hàng nào.
                        </div>
                    )}
                </div>
            )}

            <CustomerForm
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingCustomer(null);
                }}
                onSubmit={handleAddCustomer}
                initialData={editingCustomer}
            />
        </div>
    );
}
