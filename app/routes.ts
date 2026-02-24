import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("admin/login", "routes/admin.login.tsx"),
  route("admin/verify", "routes/admin.verify.tsx"),
  route("admin", "routes/admin._index.tsx"),
] satisfies RouteConfig;
