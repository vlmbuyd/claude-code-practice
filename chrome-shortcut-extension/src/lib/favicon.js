export function getFaviconUrl(url, size = 64) {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`
  } catch {
    return null
  }
}

export function getDirectFaviconUrl(url) {
  try {
    const { origin } = new URL(url)
    return `${origin}/favicon.ico`
  } catch {
    return null
  }
}

export function normalizeUrl(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function inferName(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
