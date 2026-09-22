const fs = require("fs")
const path = require("path")
const { JSDOM, VirtualConsole } = require("jsdom")
const ja = require("../i18n/ja-JP.json")
const kcDevData = require("../data/kc_dev_data.json")

const poolNames = Array.from(new Set((kcDevData.pools || []).map((pool) => pool.开发池名称).filter(Boolean)))
if (poolNames.some((name) => !Object.prototype.hasOwnProperty.call(ja, name) || ja[name] === name)) {
  throw new Error("Japanese pool-name translation missing")
}
if (
  ja["炮战系-金刚级"] !== "砲戦系・金剛型" ||
  ja["炮战系-大和级(大和改二重除外)"] !== "砲戦系・大和型（大和改二重を除く）" ||
  ja["水雷系-阿贺野级"] !== "水雷系・阿賀野型" ||
  ja["水雷系-秋月级"] !== "水雷系・秋月型" ||
  ja["池类型"] !== "資材テーブル" ||
  ja["铝开发"] !== "ボーキサイト" ||
  ja["弹开发"] !== "弾薬" ||
  ja["油钢开发"] !== "鋼材（燃料）"
) {
  throw new Error("Japanese development-pool terminology mismatch")
}

const bundleSource = fs.readFileSync(path.join(__dirname, "bundle.js"), "utf8")
const virtualConsole = new VirtualConsole()
virtualConsole.on("jsdomError", (...args) => console.error("VC jsdomError:", ...args))
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: "http://localhost/",
  pretendToBeVisual: true,
  runScripts: "outside-only",
  virtualConsole,
})
const { window } = dom
window.__KR2_LOCALE__ = "ja-JP"
global.window = window
global.document = window.document
global.navigator = window.navigator
global.localStorage = window.localStorage
global.location = window.location
global.fetch = () => Promise.reject(new Error("offline"))

window.eval(bundleSource)

setTimeout(() => {
  const text = window.document.body.textContent
  const nav = Array.from(window.document.querySelectorAll(".kr2-nav-btn"), (node) => node.textContent.trim())
  const help = window.document.querySelector(".kr2-help-modal")
  const recoLabel = window.document.querySelector(".kr2-reco-label")
  const styleText = Array.from(window.document.querySelectorAll("style"), (node) => node.textContent).join("\n")
  const assertions = [
    [text.includes("ネジ計算機"), "Japanese title missing"],
    [nav.join("|") === "改修一覧|素材計算|強くなった！", "Japanese tabs missing: " + nav.join("|")],
    [help && help.textContent.includes("使い方") && help.textContent.includes("機能ガイド"), "Japanese help missing"],
    [help && help.textContent.includes("開発資材消費期待値"), "development material terminology missing"],
    [recoLabel && /\.kr2-reco-label\s*\{[^}]*width:\s*auto;[^}]*min-width:\s*4\.4em;/s.test(styleText), "recommendation label sizing is not content-aware"],
    [/\.kr2-dev-scroll\s*\{[^}]*overflow-x:\s*auto;/s.test(styleText), "development recipe horizontal scrolling is disabled"],
    [/\.kr2-table td\.kr2-dev-secretary\s*\{[^}]*white-space:\s*normal;[^}]*word-break:\s*keep-all;[^}]*overflow-wrap:\s*normal;/s.test(styleText) && bundleSource.includes('className: "kr2-dev-secretary"'), "development recipe secretary wrapping is missing"],
    [!text.includes("螺丝计算器") && !text.includes("改修列表") && !text.includes("我变强了！"), "Chinese UI text remained in Japanese smoke test"],
  ]
  const failed = assertions.find(([ok]) => !ok)
  if (failed) {
    console.error(failed[1])
    process.exit(1)
  }
  console.log(JSON.stringify({ ok: true, locale: "ja-JP", nav }))
  process.exit(0)
}, 1600)
