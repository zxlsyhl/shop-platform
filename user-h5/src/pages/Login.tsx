import { useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd-mobile";
import http from "../api/http";

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const res = await http.post("/auth/login", { ...values, role: "user" });
    if (res.data.data?.success) {
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("userId", String(res.data.data.userId));
      navigate("/");
    }
  };

  return (
    <Form
      onFinish={onFinish}
      footer={
        <Button block type="submit" color="primary">
          登录
        </Button>
      }
    >
      <Form.Item name="username" label="用户名">
        <Input />
      </Form.Item>
      <Form.Item name="password" label="密码">
        <Input type="password" />
      </Form.Item>
    </Form>
  );
}
