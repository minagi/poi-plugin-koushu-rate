const zh = require("../../i18n/zh-CN.json")
const ja = require("../../i18n/ja-JP.json")

function normalizeKey(key) {
  return String(key).replace(/\.\W/g, "").replace(/\.$/, "").replace(/:\s/g, "").replace(/:$/, "")
}

function normalizeResources(resources) {
  return Object.fromEntries(Object.entries(resources).map(([key, value]) => [normalizeKey(key), value]))
}

const normalizedZh = normalizeResources(zh)
const normalizedJa = normalizeResources(ja)

function interpolate(value, options) {
  return String(value).replace(/{{\s*([^}\s]+)\s*}}/g, (_, key) =>
    options && options[key] != null ? String(options[key]) : "{{" + key + "}}"
  )
}

const i18next = {
  t(fullKey, options) {
    const key = String(fullKey).replace(/^poi-plugin-koushu-rate:/, "")
    const locale = typeof window !== "undefined" && window.__KR2_LOCALE__ === "ja-JP" ? "ja-JP" : "zh-CN"
    const resources = locale === "ja-JP" ? normalizedJa : normalizedZh
    const value = Object.prototype.hasOwnProperty.call(resources, key) ? resources[key] : ((options && options.defaultValue) || key)
    return interpolate(value, options)
  },
}

module.exports = i18next
module.exports.default = i18next
