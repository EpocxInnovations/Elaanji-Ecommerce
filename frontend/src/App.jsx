import { Routes, Route } from 'react-router-dom'

import { CustomerLayout } from './layouts/CustomerLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute, AdminRoute } from './components/RouteGuards'

import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { CartPage } from './pages/CartPage'
import { WishlistPage } from './pages/WishlistPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrdersPage } from './pages/OrdersPage'
import { AccountPage } from './pages/AccountPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { NotFoundPage } from './pages/NotFoundPage'

import { AdminDashboardPage } from './admin/pages/AdminDashboardPage'
import { AdminOrdersPage } from './admin/pages/AdminOrdersPage'
import { AdminProductsPage } from './admin/pages/AdminProductsPage'
import { AdminCategoriesPage } from './admin/pages/AdminCategoriesPage'
import { AdminInventoryPage } from './admin/pages/AdminInventoryPage'
import { AdminCustomersPage } from './admin/pages/AdminCustomersPage'
import { AdminPaymentsPage } from './admin/pages/AdminPaymentsPage'
import { AdminCouponsPage } from './admin/pages/AdminCouponsPage'
import { AdminReviewsPage } from './admin/pages/AdminReviewsPage'
import { AdminBannersPage } from './admin/pages/AdminBannersPage'
import { AdminReportsPage } from './admin/pages/AdminReportsPage'
import { AdminSettingsPage } from './admin/pages/AdminSettingsPage'

export default function App() {
  return (
    <Routes>
      {/* Customer storefront */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin panel */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  )
}
