from datetime import date, datetime
from decimal import Decimal
from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    code: int = 0
    message: str = "success"
    data: Optional[T] = None


def ok(data: Any = None) -> dict:
    return {"code": 0, "message": "success", "data": data}


class LoginRequest(BaseModel):
    username: str
    password: str
    role: str


class LoginResp(BaseModel):
    success: bool
    token: str
    userId: Optional[int] = None


class UserBase(BaseModel):
    username: str
    password: str
    phone: Optional[str] = None


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True


class AdminUserBase(BaseModel):
    username: str
    password: str


class AdminUserOut(AdminUserBase):
    id: int

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    spec: Optional[str] = None
    ingredient: Optional[str] = None
    original_price: Decimal
    sale_price: Decimal
    image_url: Optional[str] = None
    maintainer: Optional[str] = None
    launch_date: Optional[date] = None


class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True


class OrdersBase(BaseModel):
    order_no: str
    order_amount: Decimal
    paid_amount: Optional[Decimal] = None
    order_date: Optional[date] = None
    order_time: Optional[datetime] = None
    order_status: Optional[str] = None
    payment_id: Optional[str] = None
    payment_status: Optional[str] = None
    logistics_id: Optional[str] = None
    logistics_status: Optional[str] = None
    user_id: int
    shipping_address: Optional[str] = None


class OrdersOut(OrdersBase):
    id: int

    class Config:
        from_attributes = True


class OrderItemOut(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    product_weight: Optional[Decimal] = None
    product_original_amount: Optional[Decimal] = None
    product_sale_amount: Optional[Decimal] = None

    class Config:
        from_attributes = True


class OrderDetailItem(BaseModel):
    productId: int
    productName: Optional[str] = None
    quantity: int
    productWeight: Optional[Decimal] = None
    productOriginalAmount: Optional[Decimal] = None
    productSaleAmount: Optional[Decimal] = None


class OrderDetailResp(BaseModel):
    order: Optional[OrdersOut] = None
    items: List[OrderDetailItem] = []


class SubmitOrderItem(BaseModel):
    productId: int
    quantity: int


class SubmitOrderRequest(BaseModel):
    userId: Optional[int] = None
    shippingAddress: Optional[str] = None
    items: List[SubmitOrderItem] = []


class UserAddressBase(BaseModel):
    user_id: int
    receiver: Optional[str] = None
    phone: Optional[str] = None
    address: str


class UserAddressOut(UserAddressBase):
    id: int

    class Config:
        from_attributes = True
