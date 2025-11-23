import { Link, Outlet, useLocation } from "react-router-dom";
import { Package, LayoutDashboard, Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getProducts } from "@/services/db";

export default function Layout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { toast } = useToast();

    useEffect(() => {
        checkExpiringProducts();
    }, []);

    const checkExpiringProducts = async () => {
        try {
            const products = await getProducts();
            const expiringCount = products.filter(p => p.daysRemaining <= 7).length;

            if (expiringCount > 0) {
                toast({
                    title: "Cảnh báo hạn sử dụng",
                    description: `Có ${expiringCount} sản phẩm sắp hết hạn hoặc đã hết hạn!`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Failed to check expiring products", error);
        }
    };

    const navItems = [
        { href: "/", label: "Tổng quan", icon: LayoutDashboard },
        { href: "/products", label: "Sản phẩm", icon: Package },
        { href: "/types", label: "Loại SP", icon: Sparkles },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg gradient-primary group-hover:scale-110 transition-transform">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Quản Lý Sản Phẩm
                            </h1>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        isActive
                                            ? "gradient-primary text-white shadow-md"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <nav className="md:hidden border-t p-4 flex flex-col gap-2 bg-white shadow-lg">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                        isActive
                                            ? "gradient-primary text-white shadow-md"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>

        </div>
    );
}
