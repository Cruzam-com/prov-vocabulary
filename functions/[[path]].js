// Cloudflare Pages Function: catch-all for term and instance URIs
//
// Term paths (e.g., /score, /bedtimeStart):
//   303 redirect to HTML docs with anchor (e.g., /#score)
//
// Instance paths (e.g., /activity/..., /entity/..., /agent/...):
//   404 with informative message
//
// Static assets (vocabulary.ttl, context.jsonld):
//   Pass through to Pages static hosting

const STATIC_FILES = new Set([
  "vocabulary.ttl",
  "context.jsonld",
  "index.html",
]);

const INSTANCE_PREFIXES = ["activity/", "entity/", "agent/"];

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\//, "");

  // Let static files pass through
  if (STATIC_FILES.has(path)) {
    return context.next();
  }

  // Instance URIs — these are identifiers, not documents
  if (INSTANCE_PREFIXES.some((p) => path.startsWith(p))) {
    return new Response(
      JSON.stringify({
        "@context": "https://prov.cruzam.com/context.jsonld",
        error: "Instance URI",
        message: `${url.href} is an identifier for a provenance resource, not a dereferenceable document. See https://prov.cruzam.com/ for the vocabulary definition.`,
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  // Vocabulary term — redirect to HTML docs with anchor
  if (path && !path.includes("/")) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/#${path}`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Anything else — 404
  return new Response("Not found", { status: 404 });
}
