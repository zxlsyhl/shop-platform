import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Toast } from "antd-mobile";
import http from "../api/http";

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const res = await http.post("/auth/login", { ...values, role: "user" });
      if (res.data.data?.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("userId", String(res.data.data.userId));
        navigate("/");
        return;
      }

      Toast.show({
        icon: "fail",
        content: "用户名或密码错误"
      });
    } catch {
      Toast.show({
        icon: "fail",
        content: "登录失败，请稍后重试"
      });
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
      <Form.Item
        name="username"
        label="用户名"
        rules={[{ required: true, message: "请输入用户名" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[{ required: true, message: "请输入密码" }]}
      >
        <Input type="password" />
      </Form.Item>
    </Form>
  );
}
