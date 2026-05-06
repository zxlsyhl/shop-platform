import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, List } from "antd-mobile";
import http from "../api/http";

export default function OrderDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<any>();

  useEffect(() => {
    http.get(`/orders/${id}`).then((r) => setItem(r.data.data));
  }, [id]);

  return (
    <Card title={item?.order?.orderNo}>
      订单金额：{item?.order?.orderAmount}
      <br />
      实付：{item?.order?.paidAmount}
      <br />
      状态：{item?.order?.orderStatus}
      <div style={{ marginTop: 12 }}>
        <b>订单明细</b>
        <List>
          {(item?.items || []).map((detail: any, index: number) => (
            <List.Item key={`${detail.productId}-${index}`}>
              {detail.productName} x {detail.quantity}，售价小计：{detail.productSaleAmount}
            </List.Item>
          ))}
        </List>
      </div>
    </Card>
  );
}
