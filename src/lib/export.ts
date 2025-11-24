import * as XLSX from 'xlsx';
import type { Product } from '@/types';

export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string) {
    if (!data || data.length === 0) {
        alert("Không có dữ liệu để xuất.");
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(","), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle strings with commas, quotes, or newlines
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                // Handle dates
                if (value instanceof Date) {
                    return value.toISOString().split('T')[0];
                }
                return value;
            }).join(",")
        )
    ].join("\n");

    // Create blob and download
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Export template Excel file with example data
 */
export function exportExcelTemplate() {
    const templateData = [
        {
            "Loại sản phẩm": "Mỹ phẩm",
            "Tên sản phẩm": "Kem dưỡng da",
            "Mô tả": "Kem dưỡng da ban đêm",
            "Số lô": "LOT123",
            "Nơi nhập hàng": "Công ty ABC",
            "Ngày bán (dd/MM/yyyy)": "01/01/2025",
            "Hạn sử dụng (dd/MM/yyyy)": "01/01/2027",
            "Thông tin khách hàng": "Nguyễn Văn A - 0901234567",
            "Ghi chú": "Khách hàng VIP"
        },
        {
            "Loại sản phẩm": "Thực phẩm",
            "Tên sản phẩm": "Bánh quy",
            "Mô tả": "Bánh quy bơ",
            "Số lô": "LOT456",
            "Nơi nhập hàng": "Nhà máy XYZ",
            "Ngày bán (dd/MM/yyyy)": "15/03/2025",
            "Hạn sử dụng (dd/MM/yyyy)": "15/09/2025",
            "Thông tin khách hàng": "Trần Thị B - 0912345678",
            "Ghi chú": ""
        }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    worksheet['!cols'] = [
        { wch: 15 }, // Loại sản phẩm
        { wch: 20 }, // Tên sản phẩm
        { wch: 25 }, // Mô tả
        { wch: 12 }, // Số lô
        { wch: 20 }, // Nơi nhập hàng
        { wch: 20 }, // Ngày bán
        { wch: 20 }, // Hạn sử dụng
        { wch: 30 }, // Thông tin khách hàng
        { wch: 25 }  // Ghi chú
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mẫu sản phẩm");
    
    XLSX.writeFile(workbook, "mau-nhap-san-pham.xlsx");
}

/**
 * Parse Excel file and return array of products
 */
export async function importProductsFromExcel(file: File): Promise<Omit<Product, 'id' | 'createdAt'>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                
                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
                
                if (jsonData.length === 0) {
                    reject(new Error("File Excel không có dữ liệu"));
                    return;
                }
                
                // Parse and validate data
                const products: Omit<Product, 'id' | 'createdAt'>[] = jsonData.map((row, index) => {
                    // Parse dates in dd/MM/yyyy format
                    const parseSoldDate = (dateStr: string): Date => {
                        if (!dateStr) throw new Error(`Dòng ${index + 2}: Thiếu ngày bán`);
                        const parts = dateStr.toString().split('/');
                        if (parts.length !== 3) throw new Error(`Dòng ${index + 2}: Định dạng ngày bán không hợp lệ (dd/MM/yyyy)`);
                        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    };
                    
                    const parseExpiryDate = (dateStr: string): Date => {
                        if (!dateStr) throw new Error(`Dòng ${index + 2}: Thiếu hạn sử dụng`);
                        const parts = dateStr.toString().split('/');
                        if (parts.length !== 3) throw new Error(`Dòng ${index + 2}: Định dạng hạn sử dụng không hợp lệ (dd/MM/yyyy)`);
                        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    };
                    
                    const type = row["Loại sản phẩm"];
                    const name = row["Tên sản phẩm"];
                    const soldDateStr = row["Ngày bán (dd/MM/yyyy)"];
                    const expiryDateStr = row["Hạn sử dụng (dd/MM/yyyy)"];
                    
                    if (!type) throw new Error(`Dòng ${index + 2}: Thiếu loại sản phẩm`);
                    if (!name) throw new Error(`Dòng ${index + 2}: Thiếu tên sản phẩm`);
                    
                    return {
                        type: type.toString(),
                        name: name.toString(),
                        description: row["Mô tả"]?.toString() || "",
                        batchNumber: row["Số lô"]?.toString() || "",
                        source: row["Nơi nhập hàng"]?.toString() || "",
                        soldDate: parseSoldDate(soldDateStr),
                        expiryDate: parseExpiryDate(expiryDateStr),
                        customerInfo: row["Thông tin khách hàng"]?.toString() || "",
                        notes: row["Ghi chú"]?.toString() || ""
                    };
                });
                
                resolve(products);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error("Không thể đọc file"));
        };
        
        reader.readAsBinaryString(file);
    });
}
