import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "antd-mobile";
import http from "../api/http";

export default function ProductDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<any>();

  useEffect(() => {
    http.get(`/products/${id}`).then((r) => setItem(r.data.data));
  }, [id]);

  return (
    <Card title={item?.name}>
      <img
        src={item?.imageUrl}
        alt={item?.name}
        style={{
          width: "100%",
          borderRadius: 8,
          objectFit: "cover",
          marginBottom: 12
        }}
      />
      规格：{item?.spec}
      <br />
      成分：{item?.ingredient}
      <br />
      售价：{item?.salePrice}
    </Card>
  );
}
