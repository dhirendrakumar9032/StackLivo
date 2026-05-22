const SEARCH_LIMIT = 12;
const SUCCESS_CACHE = "s-maxage=3600, stale-while-revalidate=86400";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ message: "Method not allowed." });
    return;
  }

  const query = String(request.query.q || "").trim();

  if (query.length < 2) {
    response.status(200).json({ packages: [] });
    return;
  }

  try {
    const registryResponse = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${SEARCH_LIMIT}`
    );

    if (!registryResponse.ok) {
      response.status(502).json({ message: "NPM registry search failed." });
      return;
    }

    const payload = await registryResponse.json();

    const packages = Array.isArray(payload.objects)
      ? payload.objects
          .map((entry) => entry.package)
          .filter(Boolean)
          .map((pkg) => ({
            name: pkg.name,
            version: pkg.version,
            description: pkg.description || "",
          }))
      : [];

    response.setHeader("Cache-Control", SUCCESS_CACHE);
    response.status(200).json({ packages });
  } catch (error) {
    response.status(500).json({ message: "Package search error." });
  }
}
