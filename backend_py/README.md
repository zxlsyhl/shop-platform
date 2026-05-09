# backend_py

Python 版本后端，提供与 `backend` 基本一致的接口能力（`/api/auth`、`/api/users`、`/api/products`、`/api/orders`、`/api/user-addresses`、`/api/dashboard/rankings`）。

## 1. 安装依赖

```bash
cd backend_py
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 2. 配置环境变量

复制 `.env.example` 为 `.env.development`（或直接 `.env`）后填写：

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `PY_BACKEND_PORT`（默认 `8081`）

## 3. 启动

```bash
cd backend_py
python -m app.main
```

默认启动地址：`http://localhost:8081`

接口文档：`http://localhost:8081/docs`

## 4. 说明

- 返回结构与 Java 后端保持一致：`{ code, message, data }`
- 登录 token 规则保持一致：`{role}-token-{userId}`
- 该实现未引入完整鉴权中间件，与当前 Java 版行为一致（前端可直接请求业务接口）
