import { validatePagination, getPaginationMeta } from "../../utils/pagination";

describe("Pagination Utilities", () => {
  describe("validatePagination", () => {
    it("should return default values when no parameters provided", () => {
      const result = validatePagination(undefined, undefined);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        skip: 0,
      });
    });

    it("should parse valid page and limit", () => {
      const result = validatePagination("2", "50");

      expect(result).toEqual({
        page: 2,
        limit: 50,
        skip: 50,
      });
    });

    it("should handle invalid page numbers", () => {
      const testCases = [
        { page: "abc", expected: 1 },
        { page: "-1", expected: 1 },
        { page: "0", expected: 1 },
        { page: "NaN", expected: 1 },
        { page: "", expected: 1 },
      ];

      testCases.forEach(({ page, expected }) => {
        const result = validatePagination(page, "20");
        expect(result.page).toBe(expected);
      });
    });

    it("should handle invalid limit values", () => {
      const testCases = [
        { limit: "abc", expected: 20 },
        { limit: "-1", expected: 20 },
        { limit: "0", expected: 20 },
        { limit: "NaN", expected: 20 },
        { limit: "", expected: 20 },
      ];

      testCases.forEach(({ limit, expected }) => {
        const result = validatePagination("1", limit);
        expect(result.limit).toBe(expected);
      });
    });

    it("should cap limit at maximum", () => {
      const result = validatePagination("1", "200", 100);

      expect(result.limit).toBe(100);
    });

    it("should allow custom maximum limit", () => {
      const result = validatePagination("1", "50", 200);

      expect(result.limit).toBe(50);
    });

    it("should calculate skip correctly", () => {
      const testCases = [
        { page: "1", limit: "20", expectedSkip: 0 },
        { page: "2", limit: "20", expectedSkip: 20 },
        { page: "3", limit: "10", expectedSkip: 20 },
        { page: "5", limit: "25", expectedSkip: 100 },
      ];

      testCases.forEach(({ page, limit, expectedSkip }) => {
        const result = validatePagination(page, limit);
        expect(result.skip).toBe(expectedSkip);
      });
    });

    it("should handle edge case: limit=0", () => {
      const result = validatePagination("1", "0");

      expect(result.limit).toBe(20); // Falls back to default
      expect(result.skip).toBe(0);
    });

    it("should handle edge case: very large numbers", () => {
      const result = validatePagination("999999999", "999999999", 100);

      expect(result.page).toBe(999999999);
      expect(result.limit).toBe(100); // Capped at max
      expect(result.skip).toBe((999999999 - 1) * 100);
    });
  });

  describe("getPaginationMeta", () => {
    it("should calculate pagination metadata correctly", () => {
      const result = getPaginationMeta(100, 1, 20);

      expect(result).toEqual({
        current: 1,
        total: 5,
        totalItems: 100,
        hasNext: true,
        hasPrev: false,
      });
    });

    it("should handle last page", () => {
      const result = getPaginationMeta(100, 5, 20);

      expect(result).toEqual({
        current: 5,
        total: 5,
        totalItems: 100,
        hasNext: false,
        hasPrev: true,
      });
    });

    it("should handle middle page", () => {
      const result = getPaginationMeta(100, 3, 20);

      expect(result).toEqual({
        current: 3,
        total: 5,
        totalItems: 100,
        hasNext: true,
        hasPrev: true,
      });
    });

    it("should handle single page", () => {
      const result = getPaginationMeta(10, 1, 20);

      expect(result).toEqual({
        current: 1,
        total: 1,
        totalItems: 10,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle empty results", () => {
      const result = getPaginationMeta(0, 1, 20);

      expect(result).toEqual({
        current: 1,
        total: 0,
        totalItems: 0,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle limit=0 edge case", () => {
      const result = getPaginationMeta(100, 1, 0);

      expect(result).toEqual({
        current: 1,
        total: 0,
        totalItems: 100,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should ceil total pages correctly", () => {
      const result = getPaginationMeta(95, 1, 20);

      expect(result.total).toBe(5); // Math.ceil(95/20) = 5
    });
  });
});

