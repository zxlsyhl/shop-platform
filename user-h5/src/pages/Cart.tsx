import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Empty, List, Picker, Toast } from "antd-mobile";
import http from "../api/http";
import { clearCart, getCart, updateCartItemQuantity } from "../store/cart";

export default function Cart() {
  const navigate = useNavigate();
  const [list, setList] = useState(getCart());
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>();
  const [pickerVisible, setPickerVisible] = useState(false);

  const totalAmount = useMemo(
    () => list.reduce((sum, item) => sum + item.salePrice * item.quantity, 0),
    [list]
  );
  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const changeQuantity = (id: number, nextQty: number) => {
    updateCartItemQuantity(id, nextQty);
    setList(getCart());
  };

  const onClear = () => {
    clearCart();
    setList([]);
  };

  const fetchAddresses = async (userId: number) => {
    const res = await http.get("/user-addresses", { params: { userId } });
    const data = res.data.data || [];
    setAddresses(data);
    if (data.length) setSelectedAddressId(data[0].id);
  };

  const submitOrder = async () => {
    const userIdRaw = localStorage.getItem("userId");
    const userId = userIdRaw ? Number(userIdRaw) : NaN;
    if (!userId || Number.isNaN(userId)) {
      Toast.show({ icon: "fail", content: "请先登录" });
      navigate("/login");
      return;
    }
    if (!list.length) return;
    if (!addresses.length) {
      await fetchAddresses(userId);
      Toast.show({ icon: "fail", content: "请先在“我的”中添加收货地址" });
      return;
    }

    if (!selectedAddress) {
      Toast.show({ icon: "fail", content: "请选择收货地址" });
      return;
    }

    try {
      const res = await http.post("/orders/submit", {
        userId,
        shippingAddress: selectedAddress.address,
        items: list.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        }))
      });
      const orderId = res.data.data;
      clearCart();
      setList([]);
      Toast.show({ icon: "success", content: "下单成功" });
      if (orderId) navigate(`/order/${orderId}`);
      else navigate("/orders");
    } catch {
      Toast.show({ icon: "fail", content: "下单失败，请稍后重试" });
    }
  };

  useEffect(() => {
    const userId = Number(localStorage.getItem("userId") || 0);
    if (userId) {
      fetchAddresses(userId).catch(() => undefined);
    }
  }, []);

  if (!list.length) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="购物车为空" />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 12 }}>
      <List header="购物车">
        {list.map((item) => (
          <List.Item
            key={item.id}
            prefix={
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  objectFit: "cover"
                }}
              />
            }
            description={`单价：${item.salePrice}`}
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button
                  size="mini"
                  onClick={() => changeQuantity(item.id, item.quantity - 1)}
                >
                  -
                </Button>
                <span>{item.quantity}</span>
                <Button
                  size="mini"
                  onClick={() => changeQuantity(item.id, item.quantity + 1)}
                >
                  +
                </Button>
              </div>
            }
          >
            {item.name}
          </List.Item>
        ))}
      </List>

      <List header="收货地址" style={{ marginTop: 12 }}>
        {addresses.length ? (
          <List.Item
            description={
              selectedAddress
                ? `${selectedAddress.receiver || ""} ${selectedAddress.phone || ""}`.trim()
                : "请选择收货地址"
            }
            extra={
              <Button size="mini" onClick={() => setPickerVisible(true)}>
                选择地址
              </Button>
            }
          >
            {selectedAddress?.address || "未选择"}
          </List.Item>
        ) : (
          <List.Item>暂无地址，请先到“我的”页面添加</List.Item>
        )}
      </List>
      <Picker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        columns={[
          addresses.map((item) => ({
            label: `${item.address}（${`${item.receiver || ""} ${item.phone || ""}`.trim()}）`,
            value: item.id
          }))
        ]}
        value={selectedAddressId ? [selectedAddressId] : []}
        onConfirm={(val) => {
          setSelectedAddressId(Number(val[0]));
          setPickerVisible(false);
        }}
      />

      <div
        style={{
          marginTop: 12,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <b>合计：{totalAmount.toFixed(2)}</b>
        <div style={{ display: "flex", gap: 8 }}>
          <Button color="primary" size="small" onClick={submitOrder}>
            提交订单
          </Button>
          <Button color="danger" fill="outline" size="small" onClick={onClear}>
            清空
          </Button>
        </div>
      </div>
    </div>
  );
}
