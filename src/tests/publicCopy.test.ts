import assert from "node:assert/strict";
import test from "node:test";
import { SITE_CONFIG } from "../config/site";
import { LOCAL_MEETINGS } from "../content/meetings";
import { SITE } from "../content/site";

test("starter facts remain fictional and contain two recurring local meetings", () => {
  assert.equal(SITE_CONFIG.demoMode, true);
  assert.equal(SITE_CONFIG.demoState, "fictional");
  assert.match(SITE.footerNotice, /fictional tutorial community/i);
  assert.equal(LOCAL_MEETINGS.length, 2);
  assert.deepEqual(
    LOCAL_MEETINGS.map((meeting) => meeting.id),
    ["wednesday-evening", "sunday-morning"],
  );
  assert.ok(LOCAL_MEETINGS.every((meeting) => meeting.venue === "Atlantis Community Room"));
});

test("local content contains no YYC or Calgary identity", () => {
  const localText = JSON.stringify({ SITE, LOCAL_MEETINGS });
  assert.doesNotMatch(localText, /\bcalgary\b|\byyc\b/i);
});
