import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDashboardKpis, useRecentOrders, useLowStockAlert } from '../../hooks/admin/useAdminReports'
import { formatINR } from '../../utils/format'

function KpiCard({ label, value }) {
  return (
    <div className="border border-stone/20 p-4">
      <p className="text-xs tracking-widest2 uppercase text-stone mb-1">{label}</p>
      <p className="text-xl font-medium">{value}</p>
    </div>
  )
}

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis()
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(5)
  const { data: lowStock, isLoading: lowStockLoading } = useLowStockAlert(5)

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Dashboard</h1>
      <p className="text-stone text-sm mb-8">Welcome back, {user?.name}.</p>

      {kpisLoading && <p className="text-stone text-sm">Loading KPIs…</p>}

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
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

      <div className="flex flex-wrap gap-3 mb-10">
        <Link to="/admin/products/new" className="btn-secondary text-sm">Add Product</Link>
        <Link to="/admin/orders" className="btn-secondary text-sm">Manage Orders</Link>
        <Link to="/admin/categories" className="btn-secondary text-sm">Add Category</Link>
        <Link to="/admin/coupons" className="btn-secondary text-sm">Create Coupon</Link>
        <Link to="/admin/banners" className="btn-secondary text-sm">Add Banner</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm tracking-widest2 uppercase mb-3">Recent Orders</h2>
          {ordersLoading && <p className="text-stone text-sm">Loading…</p>}
          <div className="border border-stone/20 divide-y divide-stone/10">
            {recentOrders?.map((o) => (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex justify-between p-3 text-sm hover:bg-beige/40">
                <span>{o.order_number}</span>
                <span className="text-stone">{formatINR(o.total_amount)} · {o.status.replace(/_/g, ' ')}</span>
              </Link>
            ))}
            {recentOrders?.length === 0 && <p className="p-3 text-stone text-sm">No orders yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-sm tracking-widest2 uppercase mb-3">Low Stock Alert</h2>
          {lowStockLoading && <p className="text-stone text-sm">Loading…</p>}
          <div className="border border-stone/20 divide-y divide-stone/10">
            {lowStock?.map((item, idx) => (
              <div key={idx} className="flex justify-between p-3 text-sm">
                <span>{item.product_name} ({item.color})</span>
                <span className="text-oxblood">{item.available_quantity} left</span>
              </div>
            ))}
            {lowStock?.length === 0 && <p className="p-3 text-stone text-sm">Nothing low on stock.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
