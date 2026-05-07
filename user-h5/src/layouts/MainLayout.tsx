import { TabBar } from "antd-mobile";
import { AppOutline, UserOutline } from "antd-mobile-icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const ordersActive =
    pathname === "/orders" || pathname.startsWith("/order/");
  const activeKey = ordersActive ? "orders" : "home";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--adm-color-background)"
      }}
    >
      <div style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </div>
      <TabBar
        activeKey={activeKey}
        onChange={(key) => {
          if (key === "home") navigate("/");
          else navigate("/orders");
        }}
        safeArea
      >
        <TabBar.Item
          key="home"
          title="首页"
          icon={(active) =>
            active ? (
              <AppOutline fontSize={24} />
            ) : (
              <AppOutline fontSize={24} style={{ opacity: 0.55 }} />
            )
          }
        />
        <TabBar.Item
          key="orders"
          title="我的"
          icon={(active) =>
            active ? (
              <UserOutline fontSize={24} />
            ) : (
              <UserOutline fontSize={24} style={{ opacity: 0.55 }} />
            )
          }
        />
      </TabBar>
    </div>
  );
}
