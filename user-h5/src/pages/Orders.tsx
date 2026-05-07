import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Input, List, Popup, Toast } from "antd-mobile";
import AMapLoader from "@amap/amap-jsapi-loader";
import http from "../api/http";

const AMAP_KEY = "8e093c56b030f429df9a1b993deb198d";
const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE;

export default function Orders() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [addressList, setAddressList] = useState<any[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapKeyword, setMapKeyword] = useState("");
  const [pickedAddress, setPickedAddress] = useState("");
  const [candidateAddresses, setCandidateAddresses] = useState<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const amapApiRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placeSearchRef = useRef<any>(null);
  const [form] = Form.useForm();
  const userId = Number(localStorage.getItem("userId") || 0);

  useEffect(() => {
    http
      .get("/orders", { params: { userId: localStorage.getItem("userId") } })
      .then((r) => setList(r.data.data || []));
    fetchAddresses();
  }, []);

  const fetchAddresses = () => {
    if (!userId) return;
    http
      .get("/user-addresses", { params: { userId } })
      .then((r) => setAddressList(r.data.data || []));
  };

  const saveAddress = async () => {
    if (!userId) return;
    const values = await form.validateFields();
    if (!values.address) {
      Toast.show({ icon: "fail", content: "请通过地图组件选择收货地址" });
      return;
    }
    if (editingAddressId) {
      await http.put(`/user-addresses/${editingAddressId}`, { ...values, userId });
      Toast.show({ icon: "success", content: "地址已更新" });
    } else {
      await http.post("/user-addresses", { ...values, userId });
      Toast.show({ icon: "success", content: "地址已添加" });
    }
    setEditingAddressId(null);
    form.resetFields();
    fetchAddresses();
  };

  const startEditAddress = (item: any) => {
    setEditingAddressId(item.id);
    form.setFieldsValue({
      receiver: item.receiver,
      phone: item.phone,
      address: item.address
    });
    setMapKeyword(item.address || "");
    setMapVisible(true);
  };

  const cancelEdit = () => {
    setEditingAddressId(null);
    form.resetFields();
  };

  const removeAddress = async (id: number) => {
    await http.delete(`/user-addresses/${id}`);
    Toast.show({ icon: "success", content: "地址已删除" });
    fetchAddresses();
  };

  const applySelectedLocation = (lng: number, lat: number, address: string) => {
    if (!mapRef.current || !amapApiRef.current) return;
    mapRef.current.setCenter([lng, lat]);
    if (!markerRef.current) {
      markerRef.current = new amapApiRef.current.Marker({
        position: [lng, lat]
      });
      mapRef.current.add(markerRef.current);
    } else {
      markerRef.current.setPosition([lng, lat]);
    }
    setPickedAddress(address || "");
  };

  const initMap = async () => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;
    if (AMAP_SECURITY_CODE) {
      (window as any)._AMapSecurityConfig = {
        securityJsCode: AMAP_SECURITY_CODE
      };
    }
    const AMap = await AMapLoader.load({
      key: AMAP_KEY,
      version: "2.0",
      plugins: ["AMap.Geocoder", "AMap.PlaceSearch"]
    });
    amapApiRef.current = AMap;
    mapRef.current = new AMap.Map(mapContainerRef.current, {
      zoom: 12,
      center: [121.4737, 31.2304]
    });
    geocoderRef.current = new AMap.Geocoder({});
    placeSearchRef.current = new AMap.PlaceSearch({
      city: "全国"
    });
    mapRef.current.on("click", (e: any) => {
      const { lng, lat } = e.lnglat;
      setCandidateAddresses([]);
      applySelectedLocation(lng, lat, pickedAddress);
      geocoderRef.current.getAddress([lng, lat], (status: string, result: any) => {
        if (status === "complete" && result.regeocode) {
          const addr = result.regeocode.formattedAddress || "";
          setPickedAddress(addr);
        }
      });
    });
  };

  const locateByKeyword = () => {
    if (!mapKeyword || !geocoderRef.current || !mapRef.current) return;
    geocoderRef.current.getLocation(mapKeyword, (status: string, result: any) => {
      if (status === "complete" && result.geocodes?.length) {
        const location = result.geocodes[0].location;
        const lng = location.lng;
        const lat = location.lat;
        setCandidateAddresses([]);
        applySelectedLocation(lng, lat, result.geocodes[0].formattedAddress || mapKeyword);
      } else {
        if (!placeSearchRef.current) {
          Toast.show({ icon: "fail", content: "未找到该地址，请尝试点击地图选点" });
          return;
        }
        placeSearchRef.current.search(mapKeyword, (_pStatus: string, pResult: any) => {
          const pois = pResult?.poiList?.pois || [];
          if (!pois.length) {
            setCandidateAddresses([]);
            Toast.show({ icon: "fail", content: "未找到该地址，请尝试点击地图选点" });
            return;
          }
          setCandidateAddresses(
            pois.map((poi: any, idx: number) => ({
              id: `${poi.id || poi.name || "poi"}-${idx}`,
              name: poi.name,
              address: poi.address || poi.name || mapKeyword,
              lng: poi.location.lng,
              lat: poi.location.lat
            }))
          );
          const first = pois[0];
          const lng = first.location.lng;
          const lat = first.location.lat;
          applySelectedLocation(lng, lat, first.address || first.name || mapKeyword);
          Toast.show({ icon: "success", content: "已定位到匹配地点" });
        });
      }
    });
  };

  const locateCurrentPosition = () => {
    if (!navigator.geolocation || !geocoderRef.current || !mapRef.current) {
      Toast.show({ icon: "fail", content: "当前环境不支持定位" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        setCandidateAddresses([]);
        applySelectedLocation(lng, lat, pickedAddress);
        geocoderRef.current.getAddress([lng, lat], (status: string, result: any) => {
          if (status === "complete" && result.regeocode) {
            const addr = result.regeocode.formattedAddress || "";
            setPickedAddress(addr);
            setMapKeyword(addr);
          }
        });
      },
      () => {
        Toast.show({ icon: "fail", content: "定位失败，请检查定位权限" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!mapVisible) return;
    initMap().catch((err: any) => {
      const msg = String(err?.message || err || "");
      if (msg.includes("USERKEY_PLAT_NOMATCH")) {
        Toast.show({
          icon: "fail",
          content: "高德Key平台不匹配，请改为Web端JSAPI Key并配置白名单"
        });
        return;
      }
      Toast.show({ icon: "fail", content: "地图加载失败，请稍后重试" });
    });
  }, [mapVisible]);

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

      <List header="地址管理" style={{ marginTop: 12 }}>
        {addressList.map((item) => (
          <List.Item
            key={item.id}
            description={`${item.receiver || ""} ${item.phone || ""}`.trim()}
            extra={
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  size="mini"
                  onClick={() => startEditAddress(item)}
                >
                  编辑
                </Button>
                <Button
                  size="mini"
                  color="danger"
                  fill="outline"
                  onClick={() => removeAddress(item.id)}
                >
                  删除
                </Button>
              </div>
            }
          >
            {item.address}
          </List.Item>
        ))}
      </List>
      <div style={{ padding: "12px 16px" }}>
        <Form
          form={form}
          layout="horizontal"
          footer={
            <div style={{ display: "flex", gap: 8 }}>
              <Button block color="primary" onClick={saveAddress}>
                {editingAddressId ? "保存地址" : "新增地址"}
              </Button>
              {editingAddressId ? (
                <Button block fill="outline" onClick={cancelEdit}>
                  取消
                </Button>
              ) : null}
            </div>
          }
        >
          <Form.Item name="receiver" label="收件人" rules={[{ required: true }]}>
            <Input placeholder="请输入收件人" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="address" label="收货地址" rules={[{ required: true }]}>
            <Input
              readOnly
              placeholder="请使用下方地图组件选择地址"
              onClick={() => {
                const addr = form.getFieldValue("address") || "";
                setMapKeyword(addr);
                setPickedAddress(addr);
                setCandidateAddresses([]);
                setMapVisible(true);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              block
              fill="outline"
              onClick={() => {
                const addr = form.getFieldValue("address") || "";
                setMapKeyword(addr);
                setPickedAddress(addr);
                setCandidateAddresses([]);
                setMapVisible(true);
              }}
            >
              地图选择地址
            </Button>
          </Form.Item>
        </Form>
      </div>
      <Popup
        visible={mapVisible}
        onMaskClick={() => setMapVisible(false)}
        bodyStyle={{ height: "70vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ padding: 12, borderBottom: "1px solid var(--adm-border-color)" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>地图组件</div>
          <Input
            value={mapKeyword}
            onChange={setMapKeyword}
            placeholder="请输入地址关键字"
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button size="small" onClick={locateByKeyword}>
              定位
            </Button>
            <Button size="small" onClick={locateCurrentPosition}>
              我的位置
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={() => {
                const chosenAddress = (pickedAddress || mapKeyword || "").trim();
                if (!chosenAddress) {
                  Toast.show({ icon: "fail", content: "请先在地图中选中地址" });
                  return;
                }
                form.setFieldsValue({ address: chosenAddress });
                setPickedAddress(chosenAddress);
                setMapKeyword(chosenAddress);
                setMapVisible(false);
              }}
            >
              使用所选地址
            </Button>
            <Button size="small" fill="outline" onClick={() => setMapVisible(false)}>
              关闭
            </Button>
          </div>
          <div style={{ marginTop: 8, color: "var(--adm-color-weak)", fontSize: 12 }}>
            当前选中：{pickedAddress || "请点击地图选择"}
          </div>
          {candidateAddresses.length ? (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "var(--adm-color-weak)", marginBottom: 6 }}>
                候选地址（点击选择）
              </div>
              <div style={{ maxHeight: 140, overflow: "auto", border: "1px solid var(--adm-border-color)", borderRadius: 8 }}>
                {candidateAddresses.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "8px 10px",
                      borderBottom: "1px solid var(--adm-border-color)",
                      cursor: "pointer"
                    }}
                    onClick={() => applySelectedLocation(item.lng, item.lat, item.address)}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name || "候选地址"}</div>
                    <div style={{ fontSize: 12, color: "var(--adm-color-weak)" }}>{item.address}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div ref={mapContainerRef} style={{ width: "100%", flex: 1 }} />
      </Popup>
    </>
  );
}
