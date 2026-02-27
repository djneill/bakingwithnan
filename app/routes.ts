import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("admin/login", "routes/admin.login.tsx"),
  route("admin/verify", "routes/admin.verify.tsx"),
  route("admin", "routes/admin._index.tsx"),
  route("/recipes/:slug", "routes/recipe.$slug.tsx"),
  route("/api/images/:key", "routes/api.images.$key.tsx"),
  route("admin/recipes/new", "routes/admin.recipes.new.tsx"),
] satisfies RouteConfig;
