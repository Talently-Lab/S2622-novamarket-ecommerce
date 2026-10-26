import { Navigate, Route, Routes } from 'react-router';
import Layout from '../components/Layout.tsx';
import AdminLayout from '../components/admin/AdminLayout.tsx';
import HomePage from '../pages/HomePage.tsx';
import CartPage from '../pages/CartPage.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';
import ProductDetailPage from '../pages/ProductDetailPage.tsx';
import ProductsPage from '../pages/ProductsPage.tsx';
import RegisterPage from '../pages/RegisterPage.tsx';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage.tsx';
import AdminProductsPage from '../pages/admin/AdminProductsPage.tsx';
import ProductFormPage from '../pages/admin/ProductFormPage.tsx';
import PrivateRoute from './PrivateRoute.tsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      {/* The admin area has its own shell (AdminLayout) instead of the
          storefront Navbar/Footer. `/admin` lands on the products section; the
          design has no separate dashboard. */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<AdminProductsPage />} />
          <Route path="productos/nuevo" element={<ProductFormPage />} />
          <Route path="productos/:id/editar" element={<ProductFormPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
