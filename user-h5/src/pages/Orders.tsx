import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { List } from "antd-mobile";
import http from "../api/http";

export default function Orders() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    http
      .get("/orders", { params: { userId: localStorage.getItem("userId") } })
      .then((r) => setList(r.data.data || []));
  }, []);

  return (
    <List header="我的订单">
      {list.map((item) => (
        <List.Item key={item.id}>
          <Link to={`/order/${item.id}`}>
            {item.orderNo} - {item.orderStatus}
          </Link>
        </List.Item>
      ))}
    </List>
  );
}
