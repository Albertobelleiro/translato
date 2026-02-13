import homepage from "./index.html";

const port = process.env.PORT || 3000;

Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);
    
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Serve homepage
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(homepage.toString(), {
        headers: {
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 404 for other routes
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${port}`);
