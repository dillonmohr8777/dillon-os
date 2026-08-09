import "./hub.css";

const routes = document.querySelectorAll(".lab-route");

for (const route of routes) {
  route.addEventListener("pointerenter", () => {
    const href = route.getAttribute("href");
    if (!href || document.head.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.append(link);
  }, { once: true });
}
