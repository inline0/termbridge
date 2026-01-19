import { Y as searchSimple, Z as searchAdvanced } from "./router-wYwTSpQJ.mjs";
import { c as create, l as load } from "../_libs/@orama/orama.mjs";
import "../_libs/@tanstack/react-router.mjs";
import "../_libs/react.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/@tanstack/store.mjs";
import "../_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/@tanstack/react-store.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/@radix-ui/react-direction.mjs";
import "../_libs/next-themes.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./source-BvNINj46.mjs";
import "node:path";
import "../_libs/tailwind-merge.mjs";
import "../_libs/@radix-ui/react-collapsible.mjs";
import "../_libs/@radix-ui/primitive.mjs";
import "../_libs/@radix-ui/react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state.mjs";
import "../_libs/@radix-ui/react-use-layout-effect.mjs";
import "../_libs/@radix-ui/react-compose-refs.mjs";
import "../_libs/@radix-ui/react-primitive.mjs";
import "../_libs/@radix-ui/react-slot.mjs";
import "../_libs/@radix-ui/react-presence.mjs";
import "../_libs/@radix-ui/react-id.mjs";
import "../_libs/@radix-ui/react-scroll-area.mjs";
import "../_libs/@radix-ui/react-use-callback-ref.mjs";
import "../_libs/@radix-ui/number.mjs";
import "../_libs/scroll-into-view-if-needed.mjs";
import "../_libs/compute-scroll-into-view.mjs";
import "../_libs/@radix-ui/react-popover.mjs";
import "../_libs/@radix-ui/react-dismissable-layer.mjs";
import "../_libs/@radix-ui/react-use-escape-keydown.mjs";
import "../_libs/@radix-ui/react-focus-guards.mjs";
import "../_libs/@radix-ui/react-focus-scope.mjs";
import "../_libs/@radix-ui/react-popper.mjs";
import "../_libs/@floating-ui/react-dom.mjs";
import "../_libs/@floating-ui/dom.mjs";
import "../_libs/@floating-ui/core.mjs";
import "../_libs/@floating-ui/utils.mjs";
import "../_libs/@radix-ui/react-arrow.mjs";
import "../_libs/@radix-ui/react-use-size.mjs";
import "../_libs/@radix-ui/react-portal.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/@radix-ui/react-navigation-menu.mjs";
import "../_libs/@radix-ui/react-collection.mjs";
import "../_libs/@radix-ui/react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden.mjs";
import "../_libs/@radix-ui/react-tabs.mjs";
import "../_libs/@radix-ui/react-roving-focus.mjs";
import "./index.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
import "../_libs/@radix-ui/react-accordion.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/hast-util-to-jsx-runtime.mjs";
import "../_libs/comma-separated-tokens.mjs";
import "../_libs/devlop.mjs";
import "../_libs/property-information.mjs";
import "../_libs/space-separated-tokens.mjs";
import "../_libs/style-to-js.mjs";
import "../_libs/style-to-object.mjs";
import "../_libs/inline-style-parser.mjs";
import "../_libs/hast-util-whitespace.mjs";
import "../_libs/estree-util-is-identifier-name.mjs";
import "../_libs/vfile-message.mjs";
import "../_libs/unist-util-stringify-position.mjs";
import "../_libs/unist-util-position.mjs";
const cache = /* @__PURE__ */ new Map();
async function loadDB({ from = "/api/search", initOrama = (locale) => create({
  schema: { _: "string" },
  language: locale
}) }) {
  const cacheKey = from;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  async function init() {
    const res = await fetch(from);
    if (!res.ok) throw new Error(`failed to fetch exported search indexes from ${from}, make sure the search database is exported and available for client.`);
    const data = await res.json();
    const dbs = /* @__PURE__ */ new Map();
    if (data.type === "i18n") {
      await Promise.all(Object.entries(data.data).map(async ([k, v]) => {
        const db$1 = await initOrama(k);
        load(db$1, v);
        dbs.set(k, {
          type: v.type,
          db: db$1
        });
      }));
      return dbs;
    }
    const db = await initOrama();
    load(db, data);
    dbs.set("", {
      type: data.type,
      db
    });
    return dbs;
  }
  const result = init();
  cache.set(cacheKey, result);
  return result;
}
async function search(query, options) {
  const { tag, locale } = options;
  const db = (await loadDB(options)).get(locale ?? "");
  if (!db) return [];
  if (db.type === "simple") return searchSimple(db, query);
  return searchAdvanced(db.db, query, tag);
}
export {
  search
};
