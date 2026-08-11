import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

import { CustomerLayout } from './layouts/CustomerLayout'
import { ProtectedRoute, AdminRoute } from './components/RouteGuards'

import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { CartPage } from './pages/CartPage'
import { WishlistPage } from './pages/WishlistPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { AccountPage } from './pages/AccountPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { NotFoundPage } from './pages/NotFoundPage'

// The admin panel (and its charting library) is only ever needed by admins,
// so it's split into its own chunk rather than shipping in the storefront
// bundle every customer downloads.
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminDashboardPage = lazy(() => import('./admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminOrdersPage = lazy(() => import('./admin/pages/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })))
const AdminOrderDetailPage = lazy(() => import('./admin/pages/AdminOrderDetailPage').then((m) => ({ default: m.AdminOrderDetailPage })))
const AdminRefundsPage = lazy(() => import('./admin/pages/AdminRefundsPage').then((m) => ({ default: m.AdminRefundsPage })))
const AdminProductsPage = lazy(() => import('./admin/pages/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })))
const AdminProductFormPage = lazy(() => import('./admin/pages/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage })))
const AdminCategoriesPage = lazy(() => import('./admin/pages/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })))
const AdminInventoryPage = lazy(() => import('./admin/pages/AdminInventoryPage').then((m) => ({ default: m.AdminInventoryPage })))
const AdminCustomersPage = lazy(() => import('./admin/pages/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })))
const AdminPaymentsPage = lazy(() => import('./admin/pages/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })))
const AdminCouponsPage = lazy(() => import('./admin/pages/AdminCouponsPage').then((m) => ({ default: m.AdminCouponsPage })))
const AdminReviewsPage = lazy(() => import('./admin/pages/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage })))
const AdminBannersPage = lazy(() => import('./admin/pages/AdminBannersPage').then((m) => ({ default: m.AdminBannersPage })))
const AdminReportsPage = lazy(() => import('./admin/pages/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })))
const AdminSettingsPage = lazy(() => import('./admin/pages/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })))

function AdminLoadingFallback() {
  return <div className="p-10 text-sm text-stone">Loading admin panel…</div>
}

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
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
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

      {/* Admin panel — lazy-loaded as its own bundle */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminLayout />
            </Suspense>
          </AdminRoute>
        }
      >
        <Route index element={<Suspense fallback={<AdminLoadingFallback />}><AdminDashboardPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<AdminLoadingFallback />}><AdminOrdersPage /></Suspense>} />
        <Route path="orders/:id" element={<Suspense fallback={<AdminLoadingFallback />}><AdminOrderDetailPage /></Suspense>} />
        <Route path="returns" element={<Suspense fallback={<AdminLoadingFallback />}><AdminRefundsPage /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<AdminLoadingFallback />}><AdminProductsPage /></Suspense>} />
        <Route path="products/new" element={<Suspense fallback={<AdminLoadingFallback />}><AdminProductFormPage /></Suspense>} />
        <Route path="products/:id/edit" element={<Suspense fallback={<AdminLoadingFallback />}><AdminProductFormPage /></Suspense>} />
        <Route path="categories" element={<Suspense fallback={<AdminLoadingFallback />}><AdminCategoriesPage /></Suspense>} />
        <Route path="inventory" element={<Suspense fallback={<AdminLoadingFallback />}><AdminInventoryPage /></Suspense>} />
        <Route path="customers" element={<Suspense fallback={<AdminLoadingFallback />}><AdminCustomersPage /></Suspense>} />
        <Route path="payments" element={<Suspense fallback={<AdminLoadingFallback />}><AdminPaymentsPage /></Suspense>} />
        <Route path="coupons" element={<Suspense fallback={<AdminLoadingFallback />}><AdminCouponsPage /></Suspense>} />
        <Route path="reviews" element={<Suspense fallback={<AdminLoadingFallback />}><AdminReviewsPage /></Suspense>} />
        <Route path="banners" element={<Suspense fallback={<AdminLoadingFallback />}><AdminBannersPage /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<AdminLoadingFallback />}><AdminReportsPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<AdminLoadingFallback />}><AdminSettingsPage /></Suspense>} />
      </Route>
    </Routes>
  )
}
