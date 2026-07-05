// GET /api/geo — visitor geolocation from Netlify's edge context (free).
// Used to personalize the map, placeholders, and marquee. No PII stored.

export default (req, context) => {
  const g = context.geo || {};
  return Response.json({
    city: g.city || "",
    state: (g.subdivision && (g.subdivision.name || g.subdivision.code)) || "",
    country: (g.country && g.country.code) || "",
    lat: (g.latitude ?? null),
    lon: (g.longitude ?? null),
  }, { headers: { "cache-control": "private, max-age=3600" } });
};

export const config = { path: "/api/geo" };
