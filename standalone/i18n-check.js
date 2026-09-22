const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..")
const source = fs.readFileSync(path.join(root, "index.js"), "utf8")
const zh = require(path.join(root, "i18n/zh-CN.json"))
const ja = require(path.join(root, "i18n/ja-JP.json"))
const kcDevData = require(path.join(root, "data/kc_dev_data.json"))

function quotedStrings(text) {
  const values = []
  const re = /"((?:\\.|[^"\\])*)"/g
  let match
  while ((match = re.exec(text))) values.push(JSON.parse('"' + match[1] + '"'))
  return values
}

function between(start, end) {
  const from = source.indexOf(start)
  const to = source.indexOf(end, from)
  if (from < 0 || to < 0) throw new Error("i18n source marker missing: " + start)
  return source.slice(from, to)
}

const required = new Set()
const literalCall = /\bt\(\s*"((?:\\.|[^"\\])*)"/g
let match
while ((match = literalCall.exec(source))) required.add(JSON.parse('"' + match[1] + '"'))

for (const value of quotedStrings(between("const HELP_UPDATE_NOTES", "const LEVEL_ONE_ROWS"))) {
  if (/\p{Script=Han}/u.test(value)) required.add(value)
}
for (const value of quotedStrings(between("const WEEKDAY_LABELS", "const ALL_DAYS_KEY"))) required.add(value)
for (const value of quotedStrings(between("const KC_DEV_POOL_TYPE_LABELS", "const CATEGORY_ALIASES"))) required.add(value)
for (const value of quotedStrings(between("function HelpModal", "class KoushuRateApp"))) {
  if (/\p{Script=Han}/u.test(value) && value !== "更新") required.add(value)
}
for (const value of [
  "正在更新明石数据...",
  "明石数据已是最新",
  "明石数据已更新",
  "明石数据更新失败，使用缓存",
  "明石数据更新失败",
  "未知素材",
  "该素材不是装备，没有开发配方",
]) required.add(value)
const poolNames = Array.from(new Set((kcDevData.pools || []).map((pool) => pool.开发池名称).filter(Boolean)))
for (const value of poolNames) required.add(value)

const zhKeys = Object.keys(zh)
const jaKeys = Object.keys(ja)
const missingZh = Array.from(required).filter((key) => !Object.prototype.hasOwnProperty.call(zh, key))
const missingJa = Array.from(required).filter((key) => !Object.prototype.hasOwnProperty.call(ja, key))
const onlyZh = zhKeys.filter((key) => !Object.prototype.hasOwnProperty.call(ja, key))
const onlyJa = jaKeys.filter((key) => !Object.prototype.hasOwnProperty.call(zh, key))

function placeholders(text) {
  return Array.from(String(text).matchAll(/{{\s*([^}\s]+)\s*}}/g), (item) => item[1]).sort().join(",")
}
const placeholderErrors = zhKeys.filter((key) => placeholders(key) !== placeholders(zh[key]) || placeholders(key) !== placeholders(ja[key]))
const normalizeKey = (key) => String(key).replace(/\.\W/g, "").replace(/\.$/, "").replace(/:\s/g, "").replace(/:$/, "")
const normalizedKeys = zhKeys.map(normalizeKey)
const keyCollisions = normalizedKeys.filter((key, index) => normalizedKeys.indexOf(key) !== index)
const untranslatedPoolNames = poolNames.filter((key) => ja[key] === key)

if (missingZh.length || missingJa.length || onlyZh.length || onlyJa.length || placeholderErrors.length || keyCollisions.length || untranslatedPoolNames.length) {
  console.error(JSON.stringify({ missingZh, missingJa, onlyZh, onlyJa, placeholderErrors, keyCollisions, untranslatedPoolNames }, null, 2))
  process.exit(1)
}

const extraKeys = zhKeys.filter((key) => !required.has(key))
console.log(JSON.stringify({ ok: true, requiredKeys: required.size, dictionaryKeys: zhKeys.length, extraKeys }))
