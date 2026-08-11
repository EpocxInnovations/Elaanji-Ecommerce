import csv
import io
from datetime import date

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.services import admin_reports_service

router = APIRouter(prefix="/api/admin", tags=["admin-reports"])


@router.get("/dashboard/kpis")
def dashboard_kpis(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_reports_service.get_dashboard_kpis(db)


@router.get("/dashboard/recent-orders")
def dashboard_recent_orders(db: Session = Depends(get_db), current_admin: User = Depends(require_admin), limit: int = 10):
    return admin_reports_service.get_recent_orders(db, limit)


@router.get("/dashboard/low-stock")
def dashboard_low_stock(db: Session = Depends(get_db), current_admin: User = Depends(require_admin), limit: int = 10):
    return admin_reports_service.get_low_stock_items(db, limit)


@router.get("/reports/sales")
def sales_report(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
    granularity: str = Query(default="daily", pattern="^(daily|weekly|monthly|yearly)$"),
    start_date: date | None = None,
    end_date: date | None = None,
):
    return admin_reports_service.get_sales_over_time(db, granularity, start_date, end_date)


@router.get("/reports/products/best-selling")
def best_selling_products(db: Session = Depends(get_db), current_admin: User = Depends(require_admin), start_date: date | None = None, end_date: date | None = None, limit: int = 10):
    return admin_reports_service.get_product_performance(db, start_date, end_date, "revenue", limit)


@router.get("/reports/products/worst-performing")
def worst_performing_products(db: Session = Depends(get_db), current_admin: User = Depends(require_admin), start_date: date | None = None, end_date: date | None = None, limit: int = 10):
    return admin_reports_service.get_product_performance(db, start_date, end_date, "revenue_asc", limit)


@router.get("/reports/products/most-viewed")
def most_viewed_products(db: Session = Depends(get_db), current_admin: User = Depends(require_admin), limit: int = 10):
    return admin_reports_service.get_most_viewed_products(db, limit)


@router.get("/reports/categories")
def category_performance(db: Session = Depends(get_db), current_admin: User = Depends(require_admin), start_date: date | None = None, end_date: date | None = None):
    return admin_reports_service.get_category_performance(db, start_date, end_date)


@router.get("/reports/customers")
def customer_report(db: Session = Depends(get_db), current_admin: User = Depends(require_admin), start_date: date | None = None, end_date: date | None = None):
    return admin_reports_service.get_customer_report(db, start_date, end_date)


@router.get("/reports/orders/status-breakdown")
def order_status_breakdown(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_reports_service.get_order_status_breakdown(db)


@router.get("/reports/sales/export")
def export_sales_csv(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
    granularity: str = Query(default="daily", pattern="^(daily|weekly|monthly|yearly)$"),
    start_date: date | None = None,
    end_date: date | None = None,
):
    rows = admin_reports_service.get_sales_over_time(db, granularity, start_date, end_date)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Period", "Revenue", "Order Count"])
    for row in rows:
        writer.writerow([row["period"], row["revenue"], row["order_count"]])
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=sales-report-{granularity}.csv"},
    )
