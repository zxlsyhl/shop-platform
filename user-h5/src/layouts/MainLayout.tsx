import { TabBar } from "antd-mobile";
import { AppOutline, ShopbagOutline, UserOutline } from "antd-mobile-icons";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CART_UPDATED_EVENT, getCartCount } from "../store/cart";

export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [cartCount, setCartCount] = useState(getCartCount());

  let activeKey = "home";
  if (pathname === "/cart") {
    activeKey = "cart";
  } else if (pathname === "/orders" || pathname.startsWith("/order/")) {
    activeKey = "orders";
  }

  useEffect(() => {
    const syncCount = () => setCartCount(getCartCount());
    window.addEventListener(CART_UPDATED_EVENT, syncCount);
    window.addEventListener("storage", syncCount);
    syncCount();
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

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
          else if (key === "cart") navigate("/cart");
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
          key="cart"
          title="购物车"
          badge={cartCount > 0 ? cartCount : undefined}
          icon={(active) =>
            active ? (
              <ShopbagOutline fontSize={24} />
            ) : (
              <ShopbagOutline fontSize={24} style={{ opacity: 0.55 }} />
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
