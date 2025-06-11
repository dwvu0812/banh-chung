/**
 * Tính toán các thông số SM-2 tiếp theo.
 * @param quality Chất lượng câu trả lời (0-5).
 * @param repetitions Số lần lặp lại trước đó.
 * @param previousInterval Khoảng thời gian ôn tập trước (ngày).
 * @param previousEaseFactor Hệ số dễ dàng trước đó.
 * @returns { interval, easeFactor, repetitions } mới.
 */
export function calculateSM2(
  quality: number,
  repetitions: number,
  previousInterval: number,
  previousEaseFactor: number
) {
  if (quality < 3) {
    // Trả lời sai, reset
    return {
      interval: 1,
      repetitions: 0,
      easeFactor: Math.max(1.3, previousEaseFactor - 0.2), // Giảm độ dễ
    };
  }

  // Trả lời đúng
  let newEaseFactor: number;
  let newInterval: number;

  if (repetitions === 0) {
    newInterval = 1;
    newEaseFactor = previousEaseFactor;
  } else if (repetitions === 1) {
    newInterval = 6;
    newEaseFactor = previousEaseFactor;
  } else {
    newInterval = Math.round(previousInterval * previousEaseFactor);
    newEaseFactor =
      previousEaseFactor +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  }

  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  return {
    interval: newInterval,
    repetitions: repetitions + 1,
    easeFactor: newEaseFactor,
  };
}
