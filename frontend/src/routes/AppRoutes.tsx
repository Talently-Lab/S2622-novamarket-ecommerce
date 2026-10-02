import { Route, Routes } from 'react-router';
import Layout from '../components/Layout.tsx';
import HomePage from '../pages/HomePage.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';
import ProductsPage from '../pages/ProductsPage.tsx';
import RegisterPage from '../pages/RegisterPage.tsx';
import AdminDashboard from '../pages/admin/AdminDashboard.tsx';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage.tsx';
import AdminProductsPage from '../pages/admin/AdminProductsPage.tsx';
import PrivateRoute from './PrivateRoute.tsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/admin" element={<PrivateRoute roles={['admin']} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProductsPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
