import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// 高德要求：在首次 AMapLoader.load 之前设置，且 securityJsCode 须与 Key 为控制台「同一应用」内的一对。
// 参考：https://lbs.amap.com/api/javascript-api-v2/guide/abc/amap-react
const amapSecurityJsCode = import.meta.env.VITE_AMAP_SECURITY_CODE;
console.log(
  "main amapSecurityJsCode:",
  amapSecurityJsCode ? `len=${String(amapSecurityJsCode).length}` : "(empty)"
);
if (amapSecurityJsCode) {
  (window as unknown as { _AMapSecurityConfig?: { securityJsCode: string } })._AMapSecurityConfig = {
    securityJsCode: amapSecurityJsCode
  };
  console.log("main _AMapSecurityConfig set:", Boolean((window as any)._AMapSecurityConfig?.securityJsCode));
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
);
