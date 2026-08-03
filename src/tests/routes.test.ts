import assert from "node:assert/strict";
import test from "node:test";
import { NAVIGATION_ROUTES, ROUTE_PATHS, SITE_ROUTES, isSafeSiteHref } from "../config/site";

test("route table paths are unique and every navigation entry is a defined route", () => {
  const paths = SITE_ROUTES.map((route) => route.path);
  assert.equal(new Set(paths).size, paths.length);
  const defined = new Set(paths);
  assert.ok(NAVIGATION_ROUTES.every((route) => defined.has(route.path)));
  assert.equal(NAVIGATION_ROUTES.length, 5);
});

test("site links accept known paths and anchors but reject external or protocol-relative paths", () => {
  assert.equal(isSafeSiteHref(ROUTE_PATHS.meetings), true);
  assert.equal(isSafeSiteHref(`${ROUTE_PATHS.meetings}#local-schedule`), true);
  assert.equal(isSafeSiteHref("//example.com"), false);
  assert.equal(isSafeSiteHref("javascript:alert(1)"), false);
  assert.equal(isSafeSiteHref("/missing"), false);
});
