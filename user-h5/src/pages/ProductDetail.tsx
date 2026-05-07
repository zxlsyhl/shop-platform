import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Toast } from "antd-mobile";
import http from "../api/http";
import { addToCart } from "../store/cart";

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
      <div style={{ marginTop: 12 }}>
        <Button
          color="primary"
          block
          onClick={() => {
            if (!item) return;
            addToCart({
              id: item.id,
              name: item.name,
              salePrice: Number(item.salePrice),
              imageUrl: item.imageUrl
            });
            Toast.show({ content: "已加入购物车" });
          }}
        >
          加入购物车
        </Button>
      </div>
    </Card>
  );
}
