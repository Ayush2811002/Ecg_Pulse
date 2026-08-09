export class PeakDetector {
  private lastPeakIndex = -1000;

  detect(samples: number[], sampleRate = 250): number[] {
    const peaks: number[] = [];

    if (samples.length < 30) return peaks;

    const sorted = [...samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance =
      samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      samples.length;
    const std = Math.sqrt(variance);

    const threshold = median + Math.max(std * 0.7, 0.1 * Math.abs(median));
    const refractorySamples = Math.floor(sampleRate * 0.35);

    for (let i = 1; i < samples.length - 1; i++) {
      const isLocalMax =
        samples[i] > samples[i - 1] && samples[i] > samples[i + 1];
      if (!isLocalMax) continue;
      if (samples[i] < threshold) continue;
      if (i - this.lastPeakIndex < refractorySamples) continue;

      const windowStart = Math.max(0, i - 6);
      const windowEnd = Math.min(samples.length - 1, i + 6);
      let peakIndex = i;
      for (let j = windowStart; j <= windowEnd; j++) {
        if (samples[j] > samples[peakIndex]) {
          peakIndex = j;
        }
      }

      if (peakIndex !== i) continue;

      peaks.push(i);
      this.lastPeakIndex = i;
    }

    return peaks;
  }
}
