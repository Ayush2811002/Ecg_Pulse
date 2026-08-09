export class ECGFilters {
  // 5-point moving average
  static movingAverage(samples: number[], window = 5): number[] {
    const filtered: number[] = [];

    for (let i = 0; i < samples.length; i++) {
      let sum = 0;
      let count = 0;

      for (let j = i - window + 1; j <= i; j++) {
        if (j >= 0) {
          sum += samples[j];
          count++;
        }
      }

      filtered.push(sum / count);
    }

    return filtered;
  }
}
