import assert from "node:assert/strict";
import test from "node:test";
import {
  ROUTE_TRANSITION_OWNER,
  routeTransitionMotion,
} from "../components/layout/routeTransition";

test("the layout owns one restrained incoming route transition", () => {
  assert.equal(ROUTE_TRANSITION_OWNER, "layout-incoming-only");
  assert.equal(routeTransitionMotion.initial.opacity, 0.97);
  assert.equal(routeTransitionMotion.initial.y, 3);
  assert.equal(routeTransitionMotion.transition.duration, 0.14);
  assert.equal("exit" in routeTransitionMotion, false);
});
