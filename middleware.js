function dec2hex(dec) {
  return ("0" + dec.toString(16)).substr(-2)
}

function generateNonce() {
  const arr = new Uint8Array(12)
  crypto.getRandomValues(arr)
  const values = Array.from(arr, dec2hex)
  return [
    btoa(values.slice(0, 5).join("")).substr(0, 14),
    btoa(values.slice(5).join("")),
  ].join("/")
}

export default async function handleRequest(request) {
	const nonce = generateNonce()
	let response = await fetch(request)

  let imageResponse = await fetch(request)
  let type = imageResponse.headers.get("Content-Type") || ""
  if (!type.startsWith("text/")) {
    // Not text. Don't modify.
    let newHeaders = new Headers(imageResponse.headers)
    newHeaders.set("Cache-Control", "public, max-age=2678400, immutable")
    newHeaders.set("CDN-Cache-Control", "public, max-age=2678400, immutable")
    newHeaders.set("x-BW-test", "Non-text item - headers edited!")
    // newHeaders.set("Permissions-Policy", "interest-cohort=()")
    newHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
    newHeaders.set("X-Frame-Options", "SAMEORIGIN")
    newHeaders.set("X-Content-Type-Options", "nosniff")
    newHeaders.set("Referrer-Policy", "no-referrer, strict-origin-when-cross-origin")
    newHeaders.set("cf-nonce-generator", "HIT")
    return new Response(imageResponse.body, {
      status: imageResponse.status,
      statusText: imageResponse.statusText,
      headers: newHeaders
    })
  }

  const html = (await response.text())
    .replace(/DhcnhD3khTMePgXw/gi, nonce)
    .replace(
      'src="https://ajax.cloudflare.com',
      `nonce="${nonce}" src="https://ajax.cloudflare.com`
    )
    .replace(
      `src='https://static.cloudflareinsights.com`,
      `nonce="${nonce}" src='https://static.cloudflareinsights.com`
    )
    .replace(
      `src="https://static.cloudflareinsights.com`,
      `nonce="${nonce}" src="https://static.cloudflareinsights.com`
    )
    .replace(
      'cloudflare-static/email-decode.min.js"',
      `cloudflare-static/email-decode.min.js" nonce="${nonce}"`
    )
    .replace(
      'rel="stylesheet"',
      `rel="stylesheet" nonce="${nonce}"`
    )
    .replace(/<link rel="preload"/g, `<link nonce="${nonce}" rel="preload"`)
    .replace(
      'guitar-thriving.brycewray.com/script.js"',
      `guitar-thriving.brycewray.com/script.js" nonce="${nonce}"`
    )
    .replace(
      'src="/assets/js/lite-yt-embed_',
      `nonce="${nonce}" src="/assets/js/lite-yt-embed_`
    )
    .replace(/<style/g, `<style nonce="${nonce}"`)

	let url = new URL(request.url)
	let jsStuff = false
	let svgStuff = false
  const jsRegex = /(.*\.(js))$/
  const svgRegex = /(.*\.(svg))$/
  if (url.pathname.match(jsRegex)) {
    jsStuff = true
  }
  if (url.pathname.match(svgRegex)) {
    svgStuff = true
  }

	let newHeaders = new Headers(response.headers)
	newHeaders.set("Content-Security-Policy", `base-uri 'self' https://*.brycewray.com; connect-src 'self' https://*.brycewray.com https://*.cloudinary.com https://*.cloudflareinsights.com https://cloudflareinsights.com https://*.ytimg.com https://*.ggpht.com https://*.youtube-nocookie.com https://*.fosstodon.org https://*.mastodon.social https://*.mstdn.social; default-src 'self'; frame-ancestors 'self' https://*.brycewray.com https://*.youtube-nocookie.com; font-src 'self' https://*.brycewray.com https://*.gstatic.com data:; form-action 'self' https://*.duckduckgo.com https://duckduckgo.com; frame-src 'self' https://*.brycewray.com https://*.youtube-nocookie.com; img-src 'self' https://*.brycewray.com https://*.cloudinary.com https://*.ytimg.com https://*.ggpht.com https://*.youtube-nocookie.com https://*.gstatic.com https://*.twimg.com https://*.amazonaws.com https://*.fosstodon.org https://*.mastodon.social https://*.mstdn.social https://*.google.com https://translate.googleapis.com data:; media-src 'self' https://*.brycewray.com https://*.cloudinary.com https://*.ytimg.com https://*.ggpht.com https://*.youtube-nocookie.com https://*.gstatic.com https://*.twimg.com https://*.fosstodon.org https://*.mastodon.social https://*.mstdn.social data:; object-src 'none'; script-src 'self' 'nonce-${nonce}' 'unsafe-eval'; script-src-elem 'self' 'nonce-${nonce}'; style-src 'self' https://*.brycewray.com https://*.youtube-nocookie.com data: https://*.google.com https://translate.googleapis.com 'nonce-${nonce}'; report-uri https://brycewray.report-uri.com/r/d/csp/reportOnly;`)
  if (jsStuff) {
    newHeaders.set("Content-Type", "application/javascript; charset=utf-8")
  }
  if (svgStuff) {
    newHeaders.set("Content-Type", "image/svg+xml; charset=utf-8")
  }

	return new Response(html, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders
	})
}
