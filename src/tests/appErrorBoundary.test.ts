import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppErrorFallback } from "../app/AppErrorBoundary";

test("application error fallback is safe, useful, and keeps fictional status visible", () => {
  const markup = renderToStaticMarkup(createElement(AppErrorFallback));
  assert.match(markup, /could not be displayed/i);
  assert.match(markup, /Reload page/i);
  assert.match(markup, /fictional tutorial community/i);
  assert.doesNotMatch(markup, /stack|componentDidCatch|Error:/i);
});
