export class HeartRate {
  static calculate(peaks: number[], sampleRate = 250) {
    if (peaks.length < 2) return 0;

    const intervals = peaks
      .slice(1)
      .map((peak, index) => (peak - peaks[index]) / sampleRate);

    const validIntervals = intervals.filter(
      (interval) => interval >= 0.25 && interval <= 2.5,
    );

    if (validIntervals.length === 0) return 0;

    const sorted = [...validIntervals].sort((a, b) => a - b);
    const trimCount = Math.floor(sorted.length * 0.1);
    const trimmed =
      sorted.length > 2
        ? sorted.slice(trimCount, sorted.length - trimCount)
        : sorted;

    const averageInterval =
      trimmed.reduce((sum, value) => sum + value, 0) / trimmed.length;

    const bpm = 60 / averageInterval;
    return Math.round(Math.max(30, Math.min(220, bpm)));
  }
}
