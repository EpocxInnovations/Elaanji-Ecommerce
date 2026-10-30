from typing import Optional

from pydantic import BaseModel


class StoreInfoSettings(BaseModel):
    store_name: str = "Elaanji"
    logo_url: Optional[str] = "/brand/logo.png"
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None


class ShippingSettings(BaseModel):
    default_shipping_fee: float = 79
    express_shipping_fee: float = 149
    free_shipping_threshold: float = 999
    estimated_delivery_days_standard: int = 7
    estimated_delivery_days_express: int = 2
    delivery_zones: Optional[str] = None  # comma-separated pin code prefixes or region names


class TaxSettings(BaseModel):
    default_tax_percent: float = 5


class PaymentSettings(BaseModel):
    cod_enabled: bool = True
    online_payments_enabled: bool = True


class NotificationSettings(BaseModel):
    email_notifications_enabled: bool = True
    order_notifications_enabled: bool = True


class AllSettingsOut(BaseModel):
    store_info: StoreInfoSettings
    shipping: ShippingSettings
    tax: TaxSettings
    payment: PaymentSettings
    notifications: NotificationSettings
