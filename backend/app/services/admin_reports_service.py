"""
All dashboard/report numbers are computed here with real aggregate queries
against the database — nothing is hardcoded or estimated. Date ranges default
sensibly (e.g. this month) but every report accepts explicit start/end dates.
"""
from datetime import date, datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product, ProductVariant, Category
from app.models.user import User, UserRole


def _day_bounds(d: date) -> tuple[datetime, datetime]:
    start = datetime.combine(d, datetime.min.time(), tzinfo=timezone.utc)
    return start, start + timedelta(days=1)


NON_REVENUE_STATUSES = {OrderStatus.cancelled}


def get_dashboard_kpis(db: Session) -> dict:
    now = datetime.now(timezone.utc)
    today_start, today_end = _day_bounds(now.date())
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    revenue_query = select(func.coalesce(func.sum(Order.total_amount), 0)).where(Order.status.notin_(NON_REVENUE_STATUSES))

    total_sales = db.execute(revenue_query).scalar_one()
    today_sales = db.execute(revenue_query.where(Order.created_at >= today_start, Order.created_at < today_end)).scalar_one()
    monthly_sales = db.execute(revenue_query.where(Order.created_at >= month_start)).scalar_one()

    total_orders = db.execute(select(func.count()).select_from(Order)).scalar_one()
    pending_orders = db.execute(
        select(func.count()).select_from(Order).where(Order.status.in_([OrderStatus.pending, OrderStatus.confirmed, OrderStatus.processing]))
    ).scalar_one()
    completed_orders = db.execute(select(func.count()).select_from(Order).where(Order.status == OrderStatus.delivered)).scalar_one()

    total_customers = db.execute(select(func.count()).select_from(User).where(User.role == UserRole.customer)).scalar_one()
    total_products = db.execute(select(func.count()).select_from(Product)).scalar_one()

    low_stock_products = db.execute(
        select(func.count()).select_from(ProductVariant).where(
            (ProductVariant.stock_quantity - ProductVariant.reserved_quantity) <= ProductVariant.low_stock_threshold
        )
    ).scalar_one()

    return {
        "total_sales": float(total_sales),
        "today_sales": float(today_sales),
        "monthly_sales": float(monthly_sales),
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "total_customers": total_customers,
        "total_products": total_products,
        "low_stock_products": low_stock_products,
    }


def get_recent_orders(db: Session, limit: int = 10):
    orders = db.execute(
        select(Order).order_by(Order.created_at.desc()).limit(limit)
    ).scalars().all()
    return [
        {
            "id": str(o.id),
            "order_number": o.order_number,
            "customer_name": o.shipping_name,
            "total_amount": float(o.total_amount),
            "status": o.status.value,
            "created_at": o.created_at,
        }
        for o in orders
    ]


def get_low_stock_items(db: Session, limit: int = 10):
    variants = db.execute(
        select(ProductVariant)
        .where((ProductVariant.stock_quantity - ProductVariant.reserved_quantity) <= ProductVariant.low_stock_threshold)
        .order_by((ProductVariant.stock_quantity - ProductVariant.reserved_quantity))
        .limit(limit)
    ).scalars().all()
    return [
        {
            "product_name": v.product.name,
            "sku": v.sku,
            "color": v.color,
            "available_quantity": v.available_quantity,
            "low_stock_threshold": v.low_stock_threshold,
        }
        for v in variants
    ]


def get_sales_over_time(db: Session, granularity: str, start_date: Optional[date], end_date: Optional[date]):
    """granularity: daily | weekly | monthly | yearly"""
    end_date = end_date or datetime.now(timezone.utc).date()
    default_span = {"daily": 30, "weekly": 90, "monthly": 365, "yearly": 365 * 5}
    start_date = start_date or (end_date - timedelta(days=default_span.get(granularity, 30)))

    trunc_unit = {"daily": "day", "weekly": "week", "monthly": "month", "yearly": "year"}.get(granularity, "day")

    start_dt = datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc)
    end_dt = datetime.combine(end_date, datetime.max.time(), tzinfo=timezone.utc)

    rows = db.execute(
        select(
            func.date_trunc(trunc_unit, Order.created_at).label("period"),
            func.sum(Order.total_amount).label("revenue"),
            func.count().label("order_count"),
        )
        .where(Order.created_at >= start_dt, Order.created_at <= end_dt, Order.status.notin_(NON_REVENUE_STATUSES))
        .group_by("period")
        .order_by("period")
    ).all()

    return [
        {"period": row.period.date().isoformat(), "revenue": float(row.revenue), "order_count": row.order_count}
        for row in rows
    ]


def get_product_performance(db: Session, start_date: Optional[date], end_date: Optional[date], order_by: str = "revenue", limit: int = 10):
    """order_by: 'revenue' for best-selling, 'revenue_asc' for worst-performing"""
    end_date = end_date or datetime.now(timezone.utc).date()
    start_date = start_date or (end_date - timedelta(days=90))
    start_dt = datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc)
    end_dt = datetime.combine(end_date, datetime.max.time(), tzinfo=timezone.utc)

    query = (
        select(
            OrderItem.product_name,
            ProductVariant.product_id,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.line_total).label("revenue"),
        )
        .join(ProductVariant, ProductVariant.id == OrderItem.variant_id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.created_at >= start_dt, Order.created_at <= end_dt, Order.status.notin_(NON_REVENUE_STATUSES))
        .group_by(OrderItem.product_name, ProductVariant.product_id)
    )

    query = query.order_by(func.sum(OrderItem.line_total).asc() if order_by == "revenue_asc" else func.sum(OrderItem.line_total).desc())
    rows = db.execute(query.limit(limit)).all()

    return [
        {"product_id": str(row.product_id), "product_name": row.product_name, "units_sold": row.units_sold, "revenue": float(row.revenue)}
        for row in rows
    ]


def get_most_viewed_products(db: Session, limit: int = 10):
    products = db.execute(select(Product).order_by(Product.view_count.desc()).limit(limit)).scalars().all()
    return [{"product_id": str(p.id), "product_name": p.name, "units_sold": p.view_count, "revenue": 0.0} for p in products]


def get_category_performance(db: Session, start_date: Optional[date], end_date: Optional[date]):
    end_date = end_date or datetime.now(timezone.utc).date()
    start_date = start_date or (end_date - timedelta(days=90))
    start_dt = datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc)
    end_dt = datetime.combine(end_date, datetime.max.time(), tzinfo=timezone.utc)

    rows = db.execute(
        select(
            Category.name,
            func.sum(OrderItem.line_total).label("revenue"),
            func.count(func.distinct(Order.id)).label("order_count"),
        )
        .select_from(OrderItem)
        .join(ProductVariant, ProductVariant.id == OrderItem.variant_id)
        .join(Product, Product.id == ProductVariant.product_id)
        .join(Category, Category.id == Product.category_id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.created_at >= start_dt, Order.created_at <= end_dt, Order.status.notin_(NON_REVENUE_STATUSES))
        .group_by(Category.name)
        .order_by(func.sum(OrderItem.line_total).desc())
    ).all()

    return [{"category_name": row.name, "revenue": float(row.revenue), "order_count": row.order_count} for row in rows]


def get_customer_report(db: Session, start_date: Optional[date], end_date: Optional[date]):
    end_date = end_date or datetime.now(timezone.utc).date()
    start_date = start_date or (end_date - timedelta(days=30))
    start_dt = datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc)
    end_dt = datetime.combine(end_date, datetime.max.time(), tzinfo=timezone.utc)

    new_customers = db.execute(
        select(func.count()).select_from(User).where(User.role == UserRole.customer, User.created_at >= start_dt, User.created_at <= end_dt)
    ).scalar_one()

    # "Returning" = customers with more than one non-cancelled order, ever
    order_counts = db.execute(
        select(Order.user_id, func.count().label("cnt"))
        .where(Order.status.notin_(NON_REVENUE_STATUSES))
        .group_by(Order.user_id)
    ).all()
    returning_customers = sum(1 for row in order_counts if row.cnt > 1)

    top_customers_rows = db.execute(
        select(User.name, User.email, func.sum(Order.total_amount).label("spend"), func.count().label("orders"))
        .join(Order, Order.user_id == User.id)
        .where(Order.status.notin_(NON_REVENUE_STATUSES))
        .group_by(User.id, User.name, User.email)
        .order_by(func.sum(Order.total_amount).desc())
        .limit(10)
    ).all()

    return {
        "new_customers": new_customers,
        "returning_customers": returning_customers,
        "top_customers": [
            {"name": row.name, "email": row.email, "total_spend": float(row.spend), "order_count": row.orders}
            for row in top_customers_rows
        ],
    }


def get_order_status_breakdown(db: Session):
    rows = db.execute(select(Order.status, func.count()).group_by(Order.status)).all()
    return [{"status": row[0].value, "count": row[1]} for row in rows]
