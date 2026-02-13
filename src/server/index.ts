import index from "../ui/index.html";

Bun.serve({
  routes: {
    "/": index,
  },
  development: { hmr: true, console: true },
});

console.log("Translato running on http://localhost:3000");
