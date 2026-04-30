import { expect, test } from "vitest";
import { app } from "./index.js";

test("app identifier is exposed", () => {
  expect(app).toBe("finew-app");
});
