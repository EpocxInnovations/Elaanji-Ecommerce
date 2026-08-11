import { useState } from 'react'
import { useAdminCustomers, useAdminCustomerActions } from '../../hooks/admin/useAdminOperations'
import { formatINR } from '../../utils/format'

export function AdminCustomersPage() {
  const [search, setSearch] = useState('')
  const { data: customers, isLoading } = useAdminCustomers(search || undefined)
  const { setStatus } = useAdminCustomerActions()

  return (
    <div>
      <p className="label-eyebrow mb-2">Phase 5</p>
      <h1 className="font-display text-3xl mb-6">Customers</h1>

      <input
        placeholder="Search by name, email, phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input max-w-sm mb-6"
      />

      {isLoading && <p className="text-stone text-sm">Loading…</p>}

      {!isLoading && (
        <div className="border border-stone/20 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-beige text-xs tracking-widest2 uppercase text-stone">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-right p-3">Orders</th>
                <th className="text-right p-3">Total Spend</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10">
              {customers?.map((c) => (
                <tr key={c.id}>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 text-stone">{c.email}</td>
                  <td className="p-3 text-right">{c.total_orders}</td>
                  <td className="p-3 text-right">{formatINR(c.total_spending)}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 ${c.is_active ? 'text-emerald-700' : 'text-oxblood'}`}>
                      {c.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setStatus.mutate({ id: c.id, isActive: !c.is_active })}
                      className="text-xs underline underline-offset-4 text-oxblood"
                    >
                      {c.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
              {customers?.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-stone">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
