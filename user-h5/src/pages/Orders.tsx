import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Input, List, Toast } from "antd-mobile";
import http from "../api/http";
import AddressMapPicker from "../components/AddressMapPicker";

export default function Orders() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [addressList, setAddressList] = useState<any[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapKeyword, setMapKeyword] = useState("");
  const [form] = Form.useForm();
  const userId = Number(localStorage.getItem("userId") || 0);

  useEffect(() => {
    http
      .get("/orders", { params: { userId: localStorage.getItem("userId") } })
      .then((r) => setList(r.data.data || []));
    fetchAddresses();
  }, []);

  const fetchAddresses = () => {
    if (!userId) return;
    http
      .get("/user-addresses", { params: { userId } })
      .then((r) => setAddressList(r.data.data || []));
  };

  const saveAddress = async () => {
    if (!userId) return;
    const values = await form.validateFields();
    if (!values.address) {
      Toast.show({ icon: "fail", content: "请通过地图组件选择收货地址" });
      return;
    }
    if (editingAddressId) {
      await http.put(`/user-addresses/${editingAddressId}`, { ...values, userId });
      Toast.show({ icon: "success", content: "地址已更新" });
    } else {
      await http.post("/user-addresses", { ...values, userId });
      Toast.show({ icon: "success", content: "地址已添加" });
    }
    setEditingAddressId(null);
    form.resetFields();
    fetchAddresses();
  };

  const startEditAddress = (item: any) => {
    setEditingAddressId(item.id);
    form.setFieldsValue({
      receiver: item.receiver,
      phone: item.phone,
      address: item.address
    });
    setMapKeyword(item.address || "");
    setMapVisible(true);
  };

  const cancelEdit = () => {
    setEditingAddressId(null);
    form.resetFields();
  };

  const removeAddress = async (id: number) => {
    await http.delete(`/user-addresses/${id}`);
    Toast.show({ icon: "success", content: "地址已删除" });
    fetchAddresses();
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--adm-border-color)"
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 600 }}>我的</span>
        <Button
          size="small"
          color="danger"
          fill="outline"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          退出
        </Button>
      </div>
      <List header="我的订单">
        {list.map((item) => (
          <List.Item key={item.id}>
            <Link to={`/order/${item.id}`}>
              {item.orderNo} - {item.orderStatus}
            </Link>
          </List.Item>
        ))}
      </List>

      <List header="地址管理" style={{ marginTop: 12 }}>
        {addressList.map((item) => (
          <List.Item
            key={item.id}
            description={`${item.receiver || ""} ${item.phone || ""}`.trim()}
            extra={
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  size="mini"
                  onClick={() => startEditAddress(item)}
                >
                  编辑
                </Button>
                <Button
                  size="mini"
                  color="danger"
                  fill="outline"
                  onClick={() => removeAddress(item.id)}
                >
                  删除
                </Button>
              </div>
            }
          >
            {item.address}
          </List.Item>
        ))}
      </List>
      <div style={{ padding: "12px 16px" }}>
        <Form
          form={form}
          layout="horizontal"
          footer={
            <div style={{ display: "flex", gap: 8 }}>
              <Button block color="primary" onClick={saveAddress}>
                {editingAddressId ? "保存地址" : "新增地址"}
              </Button>
              {editingAddressId ? (
                <Button block fill="outline" onClick={cancelEdit}>
                  取消
                </Button>
              ) : null}
            </div>
          }
        >
          <Form.Item name="receiver" label="收件人" rules={[{ required: true }]}>
            <Input placeholder="请输入收件人" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="address" label="收货地址" rules={[{ required: true }]}>
            <Input
              readOnly
              placeholder="请使用下方地图组件选择地址"
              onClick={() => {
                const addr = form.getFieldValue("address") || "";
                setMapKeyword(addr);
                setMapVisible(true);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              block
              fill="outline"
              onClick={() => {
                const addr = form.getFieldValue("address") || "";
                setMapKeyword(addr);
                setMapVisible(true);
              }}
            >
              地图选择地址
            </Button>
          </Form.Item>
        </Form>
      </div>
      <AddressMapPicker
        visible={mapVisible}
        initialKeyword={mapKeyword}
        onClose={() => setMapVisible(false)}
        onConfirm={(address) => {
          form.setFieldsValue({ address });
          setMapKeyword(address);
        }}
      />
    </>
  );
}
