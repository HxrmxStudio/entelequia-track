import { nowIso } from "@/utils/time";

it("nowIso returns ISO string", () => {
  const iso = nowIso();
  expect(typeof iso).toBe("string");
  expect(iso).toMatch(/\d{4}-\d{2}-\d{2}T/);
});


