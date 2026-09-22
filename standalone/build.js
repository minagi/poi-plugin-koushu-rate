const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
let source = fs.readFileSync(path.join(root, "index.js"), "utf8");
const dataRequire = 'return require("./data/" + name)';
const dataNext = 'return require("./standalone/data-map.js").get(name)';
const kaiRequire = 'return require("poi-plugin-kai-planner/src/data/static/" + name)';
if (!source.includes(dataRequire) || !source.includes(kaiRequire)) {
  throw new Error("standalone source markers missing, index.js may have changed");
}
source = source.split(dataRequire).join(dataNext);
source = source.split(kaiRequire).join("return null");

const stubs = {
  "views/components/etc/window-env": path.join(__dirname, "stubs", "window-env.js"),
  "views/components/etc/icon": path.join(__dirname, "stubs", "icon.js"),
  "views/env-parts/i18next": path.join(__dirname, "stubs", "i18next.js"),
  fs: path.join(__dirname, "stubs", "fs.js"),
  path: path.join(__dirname, "stubs", "path.js"),
  "@electron/remote": path.join(__dirname, "stubs", "electron.js"),
  electron: path.join(__dirname, "stubs", "electron.js"),
};

async function main() {
  await esbuild.build({
    entryPoints: [path.join(__dirname, "entry.js")],
    bundle: true,
    platform: "browser",
    format: "iife",
    outfile: path.join(__dirname, "bundle.js"),
    logLevel: "info",
    define: { __dirname: '"/"', "process.env.NODE_ENV": '"development"' },
    plugins: [
      {
        name: "virtual-index",
        setup(build) {
          build.onResolve({ filter: /^\.\.\/index\.js$/ }, (args) => {
            if (path.resolve(args.importer) !== path.join(__dirname, "entry.js")) return null;
            return { path: path.join(root, "index.js"), namespace: "virtual-index" };
          });
          build.onLoad({ filter: /.*/, namespace: "virtual-index" }, () => ({
            contents: source,
            loader: "js",
            resolveDir: root,
          }));
        },
      },
      {
        name: "poi-stubs",
        setup(build) {
          build.onResolve({ filter: /^(fs|path|views\/(components\/etc\/(window-env|icon)|env-parts\/i18next)|@electron\/remote|electron)$/ }, (args) => {
            const stub = stubs[args.path];
            if (!stub) return null;
            return { path: stub };
          });
        },
      },
    ],
  });
  console.log("standalone bundle written");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
