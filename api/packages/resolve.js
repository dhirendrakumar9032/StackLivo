const SUCCESS_CACHE = "s-maxage=86400, stale-while-revalidate=604800";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ message: "Method not allowed." });
    return;
  }

  const packageName = String(request.query.name || "").trim();

  if (!packageName) {
    response.status(400).json({ message: "Package name is required." });
    return;
  }

  try {
    const packageResponse = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`);

    if (packageResponse.status === 404) {
      response.status(404).json({ message: "Package not found." });
      return;
    }

    if (!packageResponse.ok) {
      response.status(502).json({ message: "Unable to resolve package version." });
      return;
    }

    const payload = await packageResponse.json();
    const latest = payload?.["dist-tags"]?.latest;

    if (!latest) {
      response.status(422).json({ message: "Latest version unavailable." });
      return;
    }

    response.setHeader("Cache-Control", SUCCESS_CACHE);
    response.status(200).json({
      name: payload.name || packageName,
      version: `^${latest}`,
    });
  } catch (error) {
    response.status(500).json({ message: "Dependency resolution error." });
  }
}
