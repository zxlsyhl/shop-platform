import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Button, Form, Input, InputNumber, Layout, Menu, Modal, Space, Table, message } from "antd";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";

const http = axios.create({ baseURL: "http://localhost:8080/api" });
const { Header, Sider, Content } = Layout;

type Field = { name: string; label: string; type?: "string" | "number" };

function Login() {
  const nav = useNavigate();
  const onFinish = async (values: any) => {
    const res = await http.post("/auth/login", { ...values, role: "admin" });
    if (res.data.data?.success) {
      localStorage.setItem("adminToken", res.data.data.token);
      nav("/");
    }
  };
  return <div style={{ maxWidth: 320, margin: "120px auto" }}><Form onFinish={onFinish}>
    <Form.Item name="username" rules={[{ required: true }]}><Input placeholder="用户名" /></Form.Item>
    <Form.Item name="password" rules={[{ required: true }]}><Input.Password placeholder="密码" /></Form.Item>
    <Button htmlType="submit" type="primary" block>登录</Button>
  </Form></div>;
}

function Dashboard() {
  const [rank, setRank] = useState<{ productSalesRank: any[]; userOrderRank: any[] }>({ productSalesRank: [], userOrderRank: [] });
  useEffect(() => {
    http.get("/dashboard/rankings").then((r) => setRank(r.data.data || { productSalesRank: [], userOrderRank: [] }));
  }, []);
  return <>
    <h3>商品销售排行</h3>
    <Table rowKey="id" pagination={false} dataSource={rank.productSalesRank} columns={[
      { title: "商品ID", dataIndex: "id" },
      { title: "商品名称", dataIndex: "name" },
      { title: "销量", dataIndex: "totalQty" }
    ]} />
    <h3 style={{ marginTop: 24 }}>用户订单排行</h3>
    <Table rowKey="id" pagination={false} dataSource={rank.userOrderRank} columns={[
      { title: "用户ID", dataIndex: "id" },
      { title: "用户名", dataIndex: "username" },
      { title: "订单总额", dataIndex: "totalOrderAmount" }
    ]} />
  </>;
}

function CrudPage({
  url,
  fields,
  listColumns
}: {
  url: string;
  fields: Field[];
  listColumns?: ColumnsType<any>;
}) {
  const [data, setData] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = () => http.get(url).then(r => setData(r.data.data || []));
  useEffect(() => { fetchData(); }, [url]);

  const create = () => {
    form.resetFields();
    setEditingId(null);
    setOpen(true);
  };

  const edit = (row: any) => {
    form.setFieldsValue(row);
    setEditingId(row.id);
    setOpen(true);
  };

  const save = async () => {
    const values = await form.validateFields();
    if (editingId) {
      await http.put(`${url}/${editingId}`, values);
      message.success("更新成功");
    } else {
      await http.post(url, values);
      message.success("新增成功");
    }
    setOpen(false);
    fetchData();
  };

  const remove = async (id: number) => {
    await http.delete(`${url}/${id}`);
    message.success("删除成功");
    fetchData();
  };

  const tableColumns: ColumnsType<any> = [
    ...(listColumns || [
      { title: "ID", dataIndex: "id" },
      { title: "主要信息", render: (_, row) => row.username || row.name || row.orderNo }
    ]),
    {
      title: "操作", render: (_, row) => <Space>
        <Button onClick={() => edit(row)}>编辑</Button>
        <Button danger onClick={() => remove(row.id)}>删除</Button>
      </Space>
    }
  ];

  return <>
    <Button type="primary" onClick={create} style={{ marginBottom: 12 }}>新增</Button>
    <Table rowKey="id" dataSource={data} columns={tableColumns} />
    <Modal title={editingId ? "编辑" : "新增"} open={open} onOk={save} onCancel={() => setOpen(false)}>
      <Form form={form} layout="vertical">
        {fields.map((f) => (
          <Form.Item key={f.name} name={f.name} label={f.label} rules={[{ required: true }]}>
            {f.type === "number" ? <InputNumber style={{ width: "100%" }} /> : <Input />}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  </>;
}

function HomeLayout() {
  const nav = useNavigate();
  const [key, setKey] = useState("dashboard");
  return <Layout style={{ minHeight: "100vh" }}>
    <Sider>
      <Menu theme="dark" selectedKeys={[key]} onClick={(e) => setKey(e.key)} items={[
        { key: "dashboard", label: "首页Dashboard" },
        { key: "users", label: "用户管理" },
        { key: "products", label: "商品管理" },
        { key: "orders", label: "订单管理" }
      ]} />
    </Sider>
    <Layout>
      <Header style={{ color: "#fff" }}>管理后台 <Button size="small" onClick={() => { localStorage.clear(); nav("/login"); }}>退出</Button></Header>
      <Content style={{ padding: 16 }}>
        {key === "dashboard" && <Dashboard />}
        {key === "users" && <CrudPage url="/users" fields={[
          { name: "username", label: "用户名" },
          { name: "password", label: "密码" },
          { name: "phone", label: "手机号" }
        ]} listColumns={[
          { title: "ID", dataIndex: "id" },
          { title: "用户名", dataIndex: "username" },
          { title: "手机号", dataIndex: "phone" }
        ]} />}
        {key === "products" && <CrudPage url="/products" fields={[
          { name: "name", label: "名称" },
          { name: "spec", label: "规格" },
          { name: "ingredient", label: "成分" },
          { name: "originalPrice", label: "原价", type: "number" },
          { name: "salePrice", label: "售价", type: "number" },
          { name: "imageUrl", label: "图片地址" },
          { name: "maintainer", label: "维护人员" },
          { name: "launchDate", label: "上市时间(yyyy-mm-dd)" }
        ]} />}
        {key === "orders" && <CrudPage url="/orders" fields={[
          { name: "orderNo", label: "订单编号" },
          { name: "orderAmount", label: "订单金额", type: "number" },
          { name: "paidAmount", label: "实际支付金额", type: "number" },
          { name: "orderDate", label: "订单日期(yyyy-mm-dd)" },
          { name: "orderTime", label: "订单时间(HH:mm:ss)" },
          { name: "orderStatus", label: "订单状态" },
          { name: "paymentId", label: "支付单ID" },
          { name: "paymentStatus", label: "支付状态" },
          { name: "logisticsId", label: "物流单ID" },
          { name: "logisticsStatus", label: "物流状态" },
          { name: "userId", label: "用户ID", type: "number" },
          { name: "shippingAddress", label: "用户收货地址" }
        ]} />}
      </Content>
    </Layout>
  </Layout>;
}

function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<HomeLayout />} />
  </Routes>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
);
