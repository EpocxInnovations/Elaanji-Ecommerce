from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class DashboardKPIsOut(BaseModel):
    total_sales: float
    today_sales: float
    monthly_sales: float
    total_orders: int
    pending_orders: int
    completed_orders: int
    total_customers: int
    total_products: int
    low_stock_products: int


class RecentOrderOut(BaseModel):
    id: str
    order_number: str
    customer_name: str
    total_amount: float
    status: str
    created_at: datetime


class LowStockItemOut(BaseModel):
    product_name: str
    sku: str
    color: str
    available_quantity: int
    low_stock_threshold: int


class SalesPointOut(BaseModel):
    period: str
    revenue: float
    order_count: int


class ProductPerformanceOut(BaseModel):
    product_id: str
    product_name: str
    units_sold: int
    revenue: float


class CategoryPerformanceOut(BaseModel):
    category_name: str
    revenue: float
    order_count: int


class CustomerReportOut(BaseModel):
    new_customers: int
    returning_customers: int
    top_customers: list[dict]


class OrderStatusBreakdownOut(BaseModel):
    status: str
    count: int
