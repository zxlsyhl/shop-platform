import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, List } from "antd-mobile";
import http from "../api/http";

export default function Orders() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    http
      .get("/orders", { params: { userId: localStorage.getItem("userId") } })
      .then((r) => setList(r.data.data || []));
  }, []);

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
    </>
  );
}
