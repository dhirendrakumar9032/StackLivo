import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const SEARCH_LIMIT = 12;

router.get(
  "/search",
  asyncHandler(async (request, response) => {
    const query = String(request.query.q || "").trim();

    if (query.length < 2) {
      response.json({ packages: [] });
      return;
    }

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

    response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    response.json({ packages });
  })
);

router.get(
  "/resolve",
  asyncHandler(async (request, response) => {
    const packageName = String(request.query.name || "").trim();

    if (!packageName) {
      response.status(400).json({ message: "Package name is required." });
      return;
    }

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

    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.json({
      name: payload.name || packageName,
      version: `^${latest}`,
    });
  })
);

export default router;
