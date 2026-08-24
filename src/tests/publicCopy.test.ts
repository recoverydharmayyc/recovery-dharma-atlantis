import assert from "node:assert/strict";
import test from "node:test";
import { SITE_CONFIG } from "../config/site";
import { ABOUT_CONTENT } from "../content/about";
import { CONNECT_CONTENT } from "../content/connect";
import { HOME_CONTENT } from "../content/home";
import { LOCAL_MEETINGS, MEETINGS_PAGE_CONTENT } from "../content/meetings";
import { NEWCOMERS_CONTENT } from "../content/newcomers";
import { RESOURCES_CONTENT } from "../content/resources";
import { SITE } from "../content/site";

test("starter facts remain fictional and contain two recurring local meetings", () => {
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

test("public wording rejects retired slogans, filler, and outcome claims", () => {
  const publicCopy = JSON.stringify({
    SITE,
    HOME_CONTENT,
    MEETINGS_PAGE_CONTENT,
    ABOUT_CONTENT,
    NEWCOMERS_CONTENT,
    RESOURCES_CONTENT,
    CONNECT_CONTENT,
  });
  for (const phrase of [
    "sit together",
    "come sit with us",
    "no gurus",
    "shared practice",
    "one ordinary step at a time",
    "two ways into the week",
    "find a time to sit together",
    "people exploring recovery",
    "hold space",
    "healing journey",
    "sacred",
    "transformational",
    "path together",
    "community of belonging",
    "supportive space",
    "wherever you are on your journey",
    "connect, grow, heal",
  ]) {
    assert.doesNotMatch(publicCopy, new RegExp(phrase, "i"), phrase);
  }
  assert.doesNotMatch(
    publicCopy,
    /guarantee(?:d|s)? (?:recovery|outcomes?)|cure(?:s|d)? addiction|medical treatment/i,
  );
});

test("New Here and Connect state fictional and contact limits concisely", () => {
  const newcomerText = JSON.stringify(NEWCOMERS_CONTENT);
  assert.equal((newcomerText.match(/fictional/gi) ?? []).length, 1);

  const connectText = JSON.stringify(CONNECT_CONTENT);
  assert.equal((connectText.match(/no public contact method/gi) ?? []).length, 1);
  assert.doesNotMatch(connectText, /accepts? messages|contact channel|inbox/i);
});

test("official resource links remain the verified Recovery Dharma configuration", () => {
  assert.deepEqual(
    RESOURCES_CONTENT.items.map(({ title, href }) => ({ title, href })),
    [
      {
        title: "Read the Recovery Dharma book",
        href: "https://recoverydharma.org/book/",
      },
      {
        title: "Find a Recovery Dharma meeting",
        href: "https://recoverydharma.org/meetings/",
      },
      {
        title: "Meeting materials",
        href: "https://recoverydharma.org/resources/meeting-materials/",
      },
      {
        title: "Meditation resources",
        href: "https://recoverydharma.org/resources/meditations/",
      },
      {
        title: "The Recovery Dharma practice",
        href: "https://recoverydharma.org/project/the-practice/",
      },
    ],
  );
});
