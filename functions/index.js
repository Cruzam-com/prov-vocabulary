// Cloudflare Pages Function: content negotiation for root path
// GET https://prov.cruzam.com/
//
// Accept: text/turtle          → vocabulary.ttl
// Accept: application/ld+json  → context.jsonld
// Accept: text/html (default)  → index.html

export async function onRequest(context) {
  const accept = context.request.headers.get("Accept") || "";

  if (accept.includes("text/turtle") || accept.includes("application/x-turtle")) {
    const res = await context.env.ASSETS.fetch(new URL("/vocabulary.ttl", context.request.url));
    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": "text/turtle; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  if (accept.includes("application/ld+json") || accept.includes("application/json")) {
    const res = await context.env.ASSETS.fetch(new URL("/context.jsonld", context.request.url));
    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": "application/ld+json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // Default: serve HTML
  return context.next();
}
