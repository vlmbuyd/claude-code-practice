const isChromeExtension =
  typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined'

export function storageGet(key) {
  if (isChromeExtension) {
    return new Promise((resolve) =>
      chrome.storage.local.get(key, (result) => resolve(result[key] ?? null))
    )
  }
  return Promise.resolve(JSON.parse(localStorage.getItem(key) ?? 'null'))
}

export function storageSet(key, value) {
  if (isChromeExtension) {
    return new Promise((resolve) =>
      chrome.storage.local.set({ [key]: value }, resolve)
    )
  }
  localStorage.setItem(key, JSON.stringify(value))
  return Promise.resolve()
}
