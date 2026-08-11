import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useSalesReport, useBestSellingProducts, useOrderStatusBreakdown, useCustomerReport, useCsvExport } from '../../hooks/admin/useAdminReports'
import { formatINR } from '../../utils/format'

const COLORS = ['#6E2430', '#8A8578', '#14120F', '#C9962C', '#0B5D3B', '#1B3A6B']

export function AdminReportsPage() {
  const [granularity, setGranularity] = useState('daily')
  const { data: sales, isLoading: salesLoading } = useSalesReport({ granularity })
  const { data: bestSelling } = useBestSellingProducts({ limit: 5 })
  const { data: statusBreakdown } = useOrderStatusBreakdown()
  const { data: customerReport } = useCustomerReport({})
  const exportCsv = useCsvExport()

  return (
    <div>
      <p className="label-eyebrow mb-2">Phase 6</p>
      <h1 className="font-display text-3xl mb-8">Reports &amp; Analytics</h1>

      <div className="flex items-center justify-between mb-6">
        <select value={granularity} onChange={(e) => setGranularity(e.target.value)} className="input max-w-xs">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <button
          onClick={() => exportCsv.mutate({ granularity })}
          disabled={exportCsv.isPending}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      <div className="border border-stone/20 p-4 mb-10">
        <h2 className="text-sm tracking-widest2 uppercase text-stone mb-4">Sales Over Time</h2>
        {salesLoading && <p className="text-stone text-sm">Loading…</p>}
        {sales && sales.length > 0 && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E1D3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatINR(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#6E2430" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {sales && sales.length === 0 && <p className="text-stone text-sm">No sales in this period yet.</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="border border-stone/20 p-4">
          <h2 className="text-sm tracking-widest2 uppercase text-stone mb-4">Best-Selling Products</h2>
          {bestSelling && bestSelling.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bestSelling} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="product_name" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatINR(value)} />
                <Bar dataKey="revenue" fill="#6E2430" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-stone text-sm">No sales data yet.</p>
          )}
        </div>

        <div className="border border-stone/20 p-4">
          <h2 className="text-sm tracking-widest2 uppercase text-stone mb-4">Order Status Breakdown</h2>
          {statusBreakdown && statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="count" nameKey="status" outerRadius={80} label>
                  {statusBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-stone text-sm">No orders yet.</p>
          )}
        </div>
      </div>

      {customerReport && (
        <div className="border border-stone/20 p-4">
          <h2 className="text-sm tracking-widest2 uppercase text-stone mb-4">Customers (last 30 days)</h2>
          <div className="flex gap-8 mb-4 text-sm">
            <p>New: <span className="font-medium">{customerReport.new_customers}</span></p>
            <p>Returning: <span className="font-medium">{customerReport.returning_customers}</span></p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs tracking-widest2 uppercase text-stone">
              <tr><th className="text-left pb-2">Customer</th><th className="text-right pb-2">Orders</th><th className="text-right pb-2">Spend</th></tr>
            </thead>
            <tbody>
              {customerReport.top_customers.map((c, idx) => (
                <tr key={idx} className="border-t border-stone/10">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-right">{c.order_count}</td>
                  <td className="py-2 text-right">{formatINR(c.total_spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
