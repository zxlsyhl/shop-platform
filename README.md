# Shop Platform Monorepo

包含三个子项目：

- `backend`：Spring Boot 3 + MyBatis-Plus + MySQL 8
- `user-h5`：React + antd-mobile + TypeScript + Vite
- `admin-web`：React + Ant Design + TypeScript + Vite

## 快速启动

1. 初始化数据库：执行 `backend/sql/init.sql`
2. 启动后端：
   - `cd backend`
   - `mvn spring-boot:run`
3. 启动用户端：
   - `cd user-h5`
   - `npm install`
   - `npm run dev`
4. 启动管理后台：
   - `cd admin-web`
   - `npm install`
   - `npm run dev`

默认后端地址：`http://localhost:8080/api`
