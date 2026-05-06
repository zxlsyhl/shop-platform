import { Button } from "antd-mobile";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";

export default function App() {
  const navigate = useNavigate();

  return (
    <>
      <div style={{ padding: 12, display: "flex", gap: 8 }}>
        <Button size="small" onClick={() => navigate("/")}>
          首页
        </Button>
        <Button size="small" onClick={() => navigate("/orders")}>
          订单
        </Button>
        <Button
          size="small"
          color="danger"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          退出
        </Button>
      </div>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
      </Routes>
    </>
  );
}
