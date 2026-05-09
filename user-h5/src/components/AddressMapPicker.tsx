import { useEffect, useRef, useState } from "react";
import { Button, Input, Popup, Toast } from "antd-mobile";
import AMapLoader from "@amap/amap-jsapi-loader";

// Key / 安全密钥由 vite.config 从 user-h5/.env* 与 仓库根目录 .env* 合并注入 import.meta.env
const AMAP_KEY =
  (import.meta.env.VITE_AMAP_KEY as string | undefined) || "";
const AMAP_SECURITY_CODE = (import.meta.env.VITE_AMAP_SECURITY_CODE as string | undefined) || "";

// console.log(
//   "AddressMapPicker env: VITE_AMAP_KEY len=",
//   String(import.meta.env.VITE_AMAP_KEY || "").length,
//   "VITE_AMAP_SECURITY_CODE len=",
//   String(import.meta.env.VITE_AMAP_SECURITY_CODE || "").length
// );

type CandidateAddress = {
  id: string;
  name: string;
  address: string;
  lng: number;
  lat: number;
};

type Props = {
  visible: boolean;
  initialKeyword?: string;
  onClose: () => void;
  onConfirm: (address: string) => void;
};

export default function AddressMapPicker({
  visible,
  initialKeyword = "",
  onClose,
  onConfirm
}: Props) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [pickedAddress, setPickedAddress] = useState(initialKeyword);
  const [candidates, setCandidates] = useState<CandidateAddress[]>([]);
  const [resolvingAddress, setResolvingAddress] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const amapApiRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placeSearchRef = useRef<any>(null);

  const setMarkerAt = (lng: number, lat: number) => {
    if (!mapRef.current || !amapApiRef.current) return;
    mapRef.current.setCenter([lng, lat]);
    if (!markerRef.current) {
      markerRef.current = new amapApiRef.current.Marker({ position: [lng, lat] });
      mapRef.current.add(markerRef.current);
    } else {
      markerRef.current.setPosition([lng, lat]);
    }
  };

  const resolveAddressFromPoint = (lng: number, lat: number) =>
    new Promise<{ address: string; scodeInvalid: boolean }>((resolve) => {
      console.log('resolveAddressFromPoint lng:'+lng);
      console.log('resolveAddressFromPoint lat:'+lat);
      if (!geocoderRef.current) {
        resolve({ address: "", scodeInvalid: false });
        return;
      }
      geocoderRef.current.getAddress([lng, lat], (status: string, result: any) => {
        console.log("geocoder getAddress status:", status);
        console.log("geocoder getAddress result:", result);
        if (status === "complete" && result?.regeocode?.formattedAddress) {
          resolve({ address: result.regeocode.formattedAddress, scodeInvalid: false });
          return;
        }
        const errorMsg = String(result || "");
        if (status === "error" && errorMsg.includes("INVALID_USER_SCODE")) {
          Toast.show({
            icon: "fail",
            content:
              "INVALID_USER_SCODE：请确认 .env 里 VITE_AMAP_SECURITY_CODE 与 VITE_AMAP_KEY 为控制台同一应用下的 Key 与安全密钥"
          });
          resolve({ address: "", scodeInvalid: true });
          return;
        }
        resolve({ address: "", scodeInvalid: false });
      });
    });

  const resolveAddressFromMarkerOrCenter = async () => {
    let pos = markerRef.current?.getPosition?.();
    if (!pos && mapRef.current?.getCenter) pos = mapRef.current.getCenter();
    if (!pos) return "";
    const lng = typeof pos.getLng === "function" ? pos.getLng() : pos.lng;
    const lat = typeof pos.getLat === "function" ? pos.getLat() : pos.lat;
    const { address, scodeInvalid } = await resolveAddressFromPoint(lng, lat);
    if (address) return address;
    if (scodeInvalid) return `经纬度(${lng.toFixed(6)}, ${lat.toFixed(6)})`;
    return "";
  };

  const initMap = async () => {
    console.log("initMap AMAP_KEY:", AMAP_KEY);
    console.log(
      "initMap AMAP_SECURITY_CODE:",
      AMAP_SECURITY_CODE ? `len=${AMAP_SECURITY_CODE.length}` : "(empty)"
    );
    console.log(
      "initMap window._AMapSecurityConfig:",
      (window as any)._AMapSecurityConfig
        ? `has securityJsCode=${Boolean((window as any)._AMapSecurityConfig.securityJsCode)}`
        : "(undefined)"
    );

    if (!mapContainerRef.current || mapRef.current) return;
    if (!AMAP_SECURITY_CODE?.trim()) {
      Toast.show({
        icon: "fail",
        content:
          "未读到 VITE_AMAP_SECURITY_CODE：请在 user-h5/.env.development 或 仓库根目录 .env.development 配置后重启 dev"
      });
      throw new Error("AMAP_SECURITY_CODE missing");
    }
    const AMap = await AMapLoader.load({
      key: AMAP_KEY,
      
      version: "2.0",
      plugins: ["AMap.Geocoder", "AMap.PlaceSearch"]
    });
    amapApiRef.current = AMap;
    mapRef.current = new AMap.Map(mapContainerRef.current, {
      zoom: 12,
      center: [114.396661, 30.507616]
    });
    geocoderRef.current = new AMap.Geocoder({});
    placeSearchRef.current = new AMap.PlaceSearch({ city: "全国" });
    mapRef.current.on("click", async (e: any) => {
      const { lng, lat } = e.lnglat;
      console.log('lng:'+lng);
      console.log('lat:'+lat);
      setCandidates([]);
      setMarkerAt(lng, lat);
      setResolvingAddress(true);
      try {
        const { address } = await resolveAddressFromPoint(lng, lat);
        if (address) setPickedAddress(address);
      } finally {
        setResolvingAddress(false);
      }
    });
  };

  const locateByKeyword = () => {
    if (!keyword.trim() || !geocoderRef.current || !mapRef.current) return;
    geocoderRef.current.getLocation(keyword, (status: string, result: any) => {
      if (status === "complete" && result.geocodes?.length) {
        const first = result.geocodes[0];
        setCandidates([]);
        setMarkerAt(first.location.lng, first.location.lat);
        setPickedAddress(first.formattedAddress || keyword);
        return;
      }

      placeSearchRef.current?.search(keyword, (_s: string, pResult: any) => {
        const pois = pResult?.poiList?.pois || [];
        if (!pois.length) {
          setCandidates([]);
          Toast.show({ icon: "fail", content: "未找到该地址，请尝试点击地图选点" });
          return;
        }
        const next: CandidateAddress[] = pois.map((poi: any, idx: number) => ({
          id: `${poi.id || poi.name || "poi"}-${idx}`,
          name: poi.name,
          address: poi.address || poi.name || keyword,
          lng: poi.location.lng,
          lat: poi.location.lat
        }));
        setCandidates(next);
        setMarkerAt(next[0].lng, next[0].lat);
        setPickedAddress(next[0].address);
        Toast.show({ icon: "success", content: "已定位到匹配地点" });
      });
    });
  };

  const locateCurrentPosition = () => {
    if (!navigator.geolocation) {
      Toast.show({ icon: "fail", content: "当前环境不支持定位" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        setCandidates([]);
        setMarkerAt(lng, lat);
        const { address } = await resolveAddressFromPoint(lng, lat);
        if (address) {
          setPickedAddress(address);
          setKeyword(address);
        }
      },
      () => Toast.show({ icon: "fail", content: "定位失败，请检查定位权限" }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const confirmPickedAddress = async () => {
    let chosen = (pickedAddress || keyword || "").trim();
    if (!chosen) chosen = (await resolveAddressFromMarkerOrCenter()).trim();
    if (!chosen) {
      Toast.show({ icon: "fail", content: "请先在地图中选中地址" });
      return;
    }
    onConfirm(chosen);
    onClose();
  };

  useEffect(() => {
    if (!visible) return;
    setKeyword(initialKeyword);
    setPickedAddress(initialKeyword);
    setCandidates([]);
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
  }, [visible, initialKeyword]);

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      bodyStyle={{ height: "70vh", display: "flex", flexDirection: "column" }}
    >
      <div style={{ padding: 12, borderBottom: "1px solid var(--adm-border-color)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>地图选址</div>
        <Input value={keyword} onChange={setKeyword} placeholder="请输入地址关键字" />
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
            onClick={confirmPickedAddress}
            loading={resolvingAddress}
            disabled={resolvingAddress}
          >
            使用所选地址
          </Button>
          <Button size="small" fill="outline" onClick={onClose}>
            关闭
          </Button>
        </div>
        <div style={{ marginTop: 8, color: "var(--adm-color-weak)", fontSize: 12 }}>
          当前选中：{pickedAddress || "请点击地图选择"}
          {resolvingAddress ? "（地址解析中...）" : ""}
        </div>
        {candidates.length ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: "var(--adm-color-weak)", marginBottom: 6 }}>
              候选地址（点击选择）
            </div>
            <div
              style={{
                maxHeight: 140,
                overflow: "auto",
                border: "1px solid var(--adm-border-color)",
                borderRadius: 8
              }}
            >
              {candidates.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "8px 10px",
                    borderBottom: "1px solid var(--adm-border-color)",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setMarkerAt(item.lng, item.lat);
                    setPickedAddress(item.address);
                  }}
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
  );
}

