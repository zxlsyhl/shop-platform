import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { List } from "antd-mobile";
import http from "../api/http";

export default function Home() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    http.get("/products").then((r) => setList(r.data.data || []));
  }, []);

  return (
    <List header="商品列表">
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
        >
          <Link to={`/product/${item.id}`}>
            {item.name} - {item.salePrice}
          </Link>
        </List.Item>
      ))}
    </List>
  );
}
