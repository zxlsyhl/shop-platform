from sqlalchemy import Column, Date, DateTime, DECIMAL, ForeignKey, Integer, String

from .database import Base


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False)
    password = Column(String(128), nullable=False)
    phone = Column(String(20))


class AdminUser(Base):
    __tablename__ = "admin_user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False)
    password = Column(String(128), nullable=False)


class Product(Base):
    __tablename__ = "product"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), nullable=False)
    spec = Column(String(64))
    ingredient = Column(String(255))
    original_price = Column(DECIMAL(10, 2), nullable=False)
    sale_price = Column(DECIMAL(10, 2), nullable=False)
    image_url = Column(String(255))
    maintainer = Column(String(64))
    launch_date = Column(Date)


class Orders(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(64), nullable=False)
    order_amount = Column(DECIMAL(10, 2), nullable=False)
    paid_amount = Column(DECIMAL(10, 2))
    order_date = Column(Date)
    order_time = Column(DateTime)
    order_status = Column(String(32))
    payment_id = Column(String(64))
    payment_status = Column(String(32))
    logistics_id = Column(String(64))
    logistics_status = Column(String(32))
    user_id = Column(Integer, nullable=False)
    shipping_address = Column(String(255))


class OrderItem(Base):
    __tablename__ = "order_item"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    product_weight = Column(DECIMAL(10, 2))
    product_original_amount = Column(DECIMAL(10, 2))
    product_sale_amount = Column(DECIMAL(10, 2))


class UserAddress(Base):
    __tablename__ = "user_address"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    receiver = Column(String(64))
    phone = Column(String(20))
    address = Column(String(255), nullable=False)
