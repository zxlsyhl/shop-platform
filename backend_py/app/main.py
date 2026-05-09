import os
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc, func, text
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import AdminUser, OrderItem, Orders, Product, User, UserAddress
from .schemas import LoginRequest, SubmitOrderRequest, ok

Base.metadata.create_all(bind=engine)

app = FastAPI(title="shop-platform backend_py")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _d(v: Any):
    if isinstance(v, Decimal):
        return float(v)
    return v


def _product_out(p: Product):
    return {
        "id": p.id,
        "name": p.name,
        "spec": p.spec,
        "ingredient": p.ingredient,
        "originalPrice": _d(p.original_price),
        "salePrice": _d(p.sale_price),
        "imageUrl": p.image_url,
        "maintainer": p.maintainer,
        "launchDate": p.launch_date.isoformat() if p.launch_date else None,
    }


def _user_out(u: User):
    return {"id": u.id, "username": u.username, "password": u.password, "phone": u.phone}


def _admin_user_out(u: AdminUser):
    return {"id": u.id, "username": u.username, "password": u.password}


def _order_out(o: Orders):
    return {
        "id": o.id,
        "orderNo": o.order_no,
        "orderAmount": _d(o.order_amount),
        "paidAmount": _d(o.paid_amount),
        "orderDate": o.order_date.isoformat() if o.order_date else None,
        "orderTime": o.order_time.isoformat() if o.order_time else None,
        "orderStatus": o.order_status,
        "paymentId": o.payment_id,
        "paymentStatus": o.payment_status,
        "logisticsId": o.logistics_id,
        "logisticsStatus": o.logistics_status,
        "userId": o.user_id,
        "shippingAddress": o.shipping_address,
    }


def _address_out(a: UserAddress):
    return {
        "id": a.id,
        "userId": a.user_id,
        "receiver": a.receiver,
        "phone": a.phone,
        "address": a.address,
    }


def _pick(data: Dict[str, Any], snake: str, camel: str):
    return data.get(snake, data.get(camel))


@app.get("/api/health")
def health():
    return ok("ok")


@app.post("/api/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if payload.role == "admin":
        user = (
            db.query(AdminUser)
            .filter(AdminUser.username == payload.username, AdminUser.password == payload.password)
            .first()
        )
        if not user:
            return ok({"success": False, "token": "", "userId": None})
        return ok({"success": True, "token": f"admin-token-{user.id}", "userId": user.id})
    user = db.query(User).filter(User.username == payload.username, User.password == payload.password).first()
    if not user:
        return ok({"success": False, "token": "", "userId": None})
    return ok({"success": True, "token": f"user-token-{user.id}", "userId": user.id})


@app.get("/api/products")
def list_products(db: Session = Depends(get_db)):
    rows = db.query(Product).order_by(desc(Product.id)).all()
    return ok([_product_out(x) for x in rows])


@app.get("/api/products/{pid}")
def get_product(pid: int, db: Session = Depends(get_db)):
    row = db.query(Product).filter(Product.id == pid).first()
    return ok(_product_out(row) if row else None)


@app.post("/api/products")
def create_product(payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = Product(
        name=_pick(payload, "name", "name"),
        spec=_pick(payload, "spec", "spec"),
        ingredient=_pick(payload, "ingredient", "ingredient"),
        original_price=Decimal(str(_pick(payload, "original_price", "originalPrice") or 0)),
        sale_price=Decimal(str(_pick(payload, "sale_price", "salePrice") or 0)),
        image_url=_pick(payload, "image_url", "imageUrl"),
        maintainer=_pick(payload, "maintainer", "maintainer"),
        launch_date=_pick(payload, "launch_date", "launchDate"),
    )
    db.add(row)
    db.commit()
    return ok()


@app.put("/api/products/{pid}")
def update_product(pid: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = db.query(Product).filter(Product.id == pid).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    row.name = _pick(payload, "name", "name")
    row.spec = _pick(payload, "spec", "spec")
    row.ingredient = _pick(payload, "ingredient", "ingredient")
    row.original_price = Decimal(str(_pick(payload, "original_price", "originalPrice") or 0))
    row.sale_price = Decimal(str(_pick(payload, "sale_price", "salePrice") or 0))
    row.image_url = _pick(payload, "image_url", "imageUrl")
    row.maintainer = _pick(payload, "maintainer", "maintainer")
    row.launch_date = _pick(payload, "launch_date", "launchDate")
    db.commit()
    return ok()


@app.delete("/api/products/{pid}")
def delete_product(pid: int, db: Session = Depends(get_db)):
    db.query(Product).filter(Product.id == pid).delete()
    db.commit()
    return ok()


@app.get("/api/users")
def list_users(db: Session = Depends(get_db)):
    return ok([_user_out(x) for x in db.query(User).order_by(desc(User.id)).all()])


@app.post("/api/users")
def create_user(payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = User(
        username=_pick(payload, "username", "username"),
        password=_pick(payload, "password", "password"),
        phone=_pick(payload, "phone", "phone"),
    )
    db.add(row)
    db.commit()
    return ok()


@app.put("/api/users/{uid}")
def update_user(uid: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = db.query(User).filter(User.id == uid).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    row.username = _pick(payload, "username", "username")
    row.password = _pick(payload, "password", "password")
    row.phone = _pick(payload, "phone", "phone")
    db.commit()
    return ok()


@app.delete("/api/users/{uid}")
def delete_user(uid: int, db: Session = Depends(get_db)):
    db.query(User).filter(User.id == uid).delete()
    db.commit()
    return ok()


@app.get("/api/admin-users")
def list_admin_users(db: Session = Depends(get_db)):
    return ok([_admin_user_out(x) for x in db.query(AdminUser).order_by(desc(AdminUser.id)).all()])


@app.post("/api/admin-users")
def create_admin_user(payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = AdminUser(
        username=_pick(payload, "username", "username"),
        password=_pick(payload, "password", "password"),
    )
    db.add(row)
    db.commit()
    return ok()


@app.put("/api/admin-users/{uid}")
def update_admin_user(uid: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = db.query(AdminUser).filter(AdminUser.id == uid).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    row.username = _pick(payload, "username", "username")
    row.password = _pick(payload, "password", "password")
    db.commit()
    return ok()


@app.delete("/api/admin-users/{uid}")
def delete_admin_user(uid: int, db: Session = Depends(get_db)):
    db.query(AdminUser).filter(AdminUser.id == uid).delete()
    db.commit()
    return ok()


@app.get("/api/user-addresses")
def list_addresses(userId: int = Query(...), db: Session = Depends(get_db)):
    rows = db.query(UserAddress).filter(UserAddress.user_id == userId).order_by(desc(UserAddress.id)).all()
    return ok([_address_out(x) for x in rows])


@app.post("/api/user-addresses")
def create_address(payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = UserAddress(
        user_id=int(_pick(payload, "user_id", "userId")),
        receiver=_pick(payload, "receiver", "receiver"),
        phone=_pick(payload, "phone", "phone"),
        address=_pick(payload, "address", "address"),
    )
    db.add(row)
    db.commit()
    return ok()


@app.put("/api/user-addresses/{aid}")
def update_address(aid: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = db.query(UserAddress).filter(UserAddress.id == aid).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    row.user_id = int(_pick(payload, "user_id", "userId"))
    row.receiver = _pick(payload, "receiver", "receiver")
    row.phone = _pick(payload, "phone", "phone")
    row.address = _pick(payload, "address", "address")
    db.commit()
    return ok()


@app.delete("/api/user-addresses/{aid}")
def delete_address(aid: int, db: Session = Depends(get_db)):
    db.query(UserAddress).filter(UserAddress.id == aid).delete()
    db.commit()
    return ok()


@app.get("/api/orders")
def list_orders(userId: int | None = None, db: Session = Depends(get_db)):
    q = db.query(Orders)
    if userId is not None:
        q = q.filter(Orders.user_id == userId)
    rows = q.order_by(desc(Orders.id)).all()
    return ok([_order_out(x) for x in rows])


@app.get("/api/orders/{oid}")
def get_order_detail(oid: int, db: Session = Depends(get_db)):
    order = db.query(Orders).filter(Orders.id == oid).first()
    if not order:
        return ok({"order": None, "items": []})
    items = (
        db.query(OrderItem, Product)
        .join(Product, Product.id == OrderItem.product_id)
        .filter(OrderItem.order_id == oid)
        .all()
    )
    detail_items: List[Dict[str, Any]] = []
    for item, product in items:
        detail_items.append(
            {
                "productId": item.product_id,
                "productName": product.name if product else None,
                "quantity": item.quantity,
                "productWeight": _d(item.product_weight),
                "productOriginalAmount": _d(item.product_original_amount),
                "productSaleAmount": _d(item.product_sale_amount),
            }
        )
    return ok({"order": _order_out(order), "items": detail_items})


@app.post("/api/orders")
def create_order(payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = Orders(
        order_no=_pick(payload, "order_no", "orderNo"),
        order_amount=Decimal(str(_pick(payload, "order_amount", "orderAmount") or 0)),
        paid_amount=Decimal(str(_pick(payload, "paid_amount", "paidAmount") or 0)),
        order_date=_pick(payload, "order_date", "orderDate"),
        order_time=_pick(payload, "order_time", "orderTime"),
        order_status=_pick(payload, "order_status", "orderStatus"),
        payment_id=_pick(payload, "payment_id", "paymentId"),
        payment_status=_pick(payload, "payment_status", "paymentStatus"),
        logistics_id=_pick(payload, "logistics_id", "logisticsId"),
        logistics_status=_pick(payload, "logistics_status", "logisticsStatus"),
        user_id=int(_pick(payload, "user_id", "userId")),
        shipping_address=_pick(payload, "shipping_address", "shippingAddress"),
    )
    db.add(row)
    db.commit()
    return ok()


@app.put("/api/orders/{oid}")
def update_order(oid: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    row = db.query(Orders).filter(Orders.id == oid).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    row.order_no = _pick(payload, "order_no", "orderNo")
    row.order_amount = Decimal(str(_pick(payload, "order_amount", "orderAmount") or 0))
    row.paid_amount = Decimal(str(_pick(payload, "paid_amount", "paidAmount") or 0))
    row.order_date = _pick(payload, "order_date", "orderDate")
    row.order_time = _pick(payload, "order_time", "orderTime")
    row.order_status = _pick(payload, "order_status", "orderStatus")
    row.payment_id = _pick(payload, "payment_id", "paymentId")
    row.payment_status = _pick(payload, "payment_status", "paymentStatus")
    row.logistics_id = _pick(payload, "logistics_id", "logisticsId")
    row.logistics_status = _pick(payload, "logistics_status", "logisticsStatus")
    row.user_id = int(_pick(payload, "user_id", "userId"))
    row.shipping_address = _pick(payload, "shipping_address", "shippingAddress")
    db.commit()
    return ok()


@app.delete("/api/orders/{oid}")
def delete_order(oid: int, db: Session = Depends(get_db)):
    db.query(OrderItem).filter(OrderItem.order_id == oid).delete()
    db.query(Orders).filter(Orders.id == oid).delete()
    db.commit()
    return ok()


@app.post("/api/orders/submit")
def submit_order(payload: SubmitOrderRequest, db: Session = Depends(get_db)):
    if not payload.userId or not payload.items:
        return ok(None)
    product_ids = [x.productId for x in payload.items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    pmap = {p.id: p for p in products}
    total = Decimal("0")
    for x in payload.items:
        p = pmap.get(x.productId)
        if not p or x.quantity <= 0:
            continue
        total += Decimal(str(p.sale_price)) * x.quantity

    now = datetime.now()
    order = Orders(
        order_no=f"SO{int(now.timestamp() * 1000)}",
        order_amount=total,
        paid_amount=Decimal("0"),
        order_date=date.today(),
        order_time=now,
        order_status="待支付",
        payment_status="未支付",
        user_id=payload.userId,
        shipping_address=payload.shippingAddress,
    )
    db.add(order)
    db.flush()
    for x in payload.items:
        p = pmap.get(x.productId)
        if not p or x.quantity <= 0:
            continue
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=p.id,
                quantity=x.quantity,
                product_weight=Decimal("0"),
                product_original_amount=p.original_price,
                product_sale_amount=p.sale_price,
            )
        )
    db.commit()
    return ok(order.id)


@app.get("/api/dashboard/rankings")
def dashboard_rankings(db: Session = Depends(get_db)):
    product_sales_rank = db.execute(
        text(
            """
            SELECT p.id AS productId, p.name AS productName, COALESCE(SUM(oi.quantity), 0) AS totalQuantity
            FROM product p
            LEFT JOIN order_item oi ON p.id = oi.product_id
            GROUP BY p.id, p.name
            ORDER BY totalQuantity DESC
            LIMIT 10
            """
        )
    ).mappings().all()
    user_order_rank = db.execute(
        text(
            """
            SELECT u.id AS userId, u.username AS username, COALESCE(SUM(o.order_amount), 0) AS totalAmount
            FROM user u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id, u.username
            ORDER BY totalAmount DESC
            LIMIT 10
            """
        )
    ).mappings().all()
    return ok({"productSalesRank": [dict(x) for x in product_sales_rank], "userOrderRank": [dict(x) for x in user_order_rank]})


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PY_BACKEND_PORT", "8081"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
