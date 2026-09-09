import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDashboardKpis, useRecentOrders, useLowStockAlert } from '../../hooks/admin/useAdminReports'
import { formatINR } from '../../utils/format'

function KpiCard({ label, value }) {
  return (
    <div className="border border-stone/20 p-3 sm:p-4 bg-paper rounded-lg shadow-sm">
      <p className="text-[10px] sm:text-xs tracking-widest2 uppercase text-stone mb-1">{label}</p>
      <p className="text-lg sm:text-xl font-semibold text-ink truncate">{value}</p>
    </div>
  )
}

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis()
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(5)
  const { data: lowStock, isLoading: lowStockLoading } = useLowStockAlert(5)

  return (
    <div className="max-w-6xl pb-10">
      <h1 className="font-display text-2xl sm:text-3xl mb-1 text-ink">Dashboard</h1>
      <p className="text-stone text-xs sm:text-sm mb-6 sm:mb-8">Welcome back, {user?.name}.</p>

      {kpisLoading && <p className="text-stone text-xs sm:text-sm">Loading KPIs…</p>}

      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 mb-8 sm:mb-10">
          <KpiCard label="Total Sales" value={formatINR(kpis.total_sales)} />
          <KpiCard label="Today's Sales" value={formatINR(kpis.today_sales)} />
          <KpiCard label="Monthly Sales" value={formatINR(kpis.monthly_sales)} />
          <KpiCard label="Total Orders" value={kpis.total_orders} />
          <KpiCard label="Pending Orders" value={kpis.pending_orders} />
          <KpiCard label="Completed Orders" value={kpis.completed_orders} />
          <KpiCard label="Total Customers" value={kpis.total_customers} />
          <KpiCard label="Total Products" value={kpis.total_products} />
          <KpiCard label="Low Stock Items" value={kpis.low_stock_products} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10">
        <Link to="/admin/products/new" className="btn-secondary text-xs sm:text-sm !py-2 !px-3 sm:!px-4">Add Product</Link>
        <Link to="/admin/orders" className="btn-secondary text-xs sm:text-sm !py-2 !px-3 sm:!px-4">Manage Orders</Link>
        <Link to="/admin/categories" className="btn-secondary text-xs sm:text-sm !py-2 !px-3 sm:!px-4">Add Category</Link>
        <Link to="/admin/coupons" className="btn-secondary text-xs sm:text-sm !py-2 !px-3 sm:!px-4">Create Coupon</Link>
        <Link to="/admin/banners" className="btn-secondary text-xs sm:text-sm !py-2 !px-3 sm:!px-4">Add Banner</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div>
          <h2 className="text-xs sm:text-sm tracking-widest2 uppercase mb-3 font-semibold text-ink">Recent Orders</h2>
          {ordersLoading && <p className="text-stone text-xs sm:text-sm">Loading…</p>}
          <div className="border border-stone/20 divide-y divide-stone/10 rounded-lg overflow-hidden bg-paper shadow-sm">
            {recentOrders?.map((o) => (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 text-xs sm:text-sm hover:bg-beige/40 gap-1 sm:gap-2">
                <span className="font-medium text-ink">{o.order_number}</span>
                <span className="text-stone">{formatINR(o.total_amount)} · <span className="capitalize">{o.status.replace(/_/g, ' ')}</span></span>
              </Link>
            ))}
            {recentOrders?.length === 0 && <p className="p-3 text-stone text-xs sm:text-sm">No orders yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-xs sm:text-sm tracking-widest2 uppercase mb-3 font-semibold text-ink">Low Stock Alert</h2>
          {lowStockLoading && <p className="text-stone text-xs sm:text-sm">Loading…</p>}
          <div className="border border-stone/20 divide-y divide-stone/10 rounded-lg overflow-hidden bg-paper shadow-sm">
            {lowStock?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 text-xs sm:text-sm">
                <span className="text-ink truncate mr-2">{item.product_name} ({item.color})</span>
                <span className="text-oxblood shrink-0 font-medium">{item.available_quantity} left</span>
              </div>
            ))}
            {lowStock?.length === 0 && <p className="p-3 text-stone text-xs sm:text-sm">Nothing low on stock.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
