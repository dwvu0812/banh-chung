import { calculateSM2 } from "../../lib/srs";

describe("SRS Algorithm (SM-2)", () => {
  describe("calculateSM2", () => {
    it("should reset interval and repetitions for quality < 3", () => {
      const result = calculateSM2(2, 3, 10, 2.5);

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it("should decrease ease factor for wrong answers", () => {
      const result = calculateSM2(1, 2, 5, 2.5);

      expect(result.easeFactor).toBe(2.3); // 2.5 - 0.2
    });

    it("should not let ease factor go below 1.3", () => {
      const result = calculateSM2(0, 5, 15, 1.3);

      expect(result.easeFactor).toBe(1.3);
    });

    it("should set interval to 1 for first repetition (quality >= 3)", () => {
      const result = calculateSM2(3, 0, 1, 2.5);

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should set interval to 6 for second repetition", () => {
      const result = calculateSM2(4, 1, 1, 2.5);

      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should calculate interval using ease factor for subsequent repetitions", () => {
      const result = calculateSM2(4, 2, 6, 2.5);

      expect(result.interval).toBe(Math.round(6 * 2.5)); // 15
      expect(result.repetitions).toBe(3);
      expect(result.easeFactor).toBe(2.5); // Quality 4 keeps ease factor same
    });

    it("should increase ease factor for higher quality answers", () => {
      const result = calculateSM2(5, 2, 6, 2.5);

      expect(result.easeFactor).toBeGreaterThan(2.5);
      expect(result.repetitions).toBe(3);
    });

    it("should maintain ease factor for medium quality answers", () => {
      const result = calculateSM2(3, 2, 6, 2.5);

      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.repetitions).toBe(3);
    });
  });
});
