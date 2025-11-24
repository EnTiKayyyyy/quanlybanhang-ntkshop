import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Products from "@/pages/Products";
import Dashboard from "@/pages/Dashboard";
import ProductTypes from "@/pages/ProductTypes";
import { Toaster } from "@/components/ui/toaster";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { ProductTypesProvider } from "@/contexts/ProductTypesContext";

function App() {
  return (
    <HashRouter>
      <ProductsProvider>
        <ProductTypesProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="types" element={<ProductTypes />} />
            </Route>
          </Routes>
          <Toaster />
        </ProductTypesProvider>
      </ProductsProvider>
    </HashRouter>
  );
}

export default App;
