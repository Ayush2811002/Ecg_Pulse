import { ECGFilters } from "./ecgFilters";
import { PeakDetector } from "./peakDetector";
import { HeartRate } from "./heartRate";
import { filterECG } from "./ecgSignalProcessing";

export class ECGProcessor {
  private readonly SAMPLE_RATE = 250;
  private readonly BUFFER_SIZE = 500;

  private rawSamples: number[] = [];
  private filteredSamples: number[] = [];
  private detector = new PeakDetector();

  private heartRate = 0;
  private peaks: number[] = [];

  addSample(value: number) {
    // Store raw ECG
    this.rawSamples.push(value);

    if (this.rawSamples.length > this.BUFFER_SIZE) {
      this.rawSamples.shift();
    }

    const rawSampleObjects = this.rawSamples.map((sample, index) => ({
      sample: index,
      timeMs: (index / this.SAMPLE_RATE) * 1000,
      value: sample,
    }));

    const filteredObjects = filterECG(rawSampleObjects, this.SAMPLE_RATE);
    this.filteredSamples = filteredObjects.map((item) => item.value);

    // Detect R Peaks
    this.peaks = this.detector.detect(this.filteredSamples, this.SAMPLE_RATE);

    // Calculate BPM
    this.heartRate = HeartRate.calculate(this.peaks, this.SAMPLE_RATE);
  }

  getRawSamples() {
    return [...this.rawSamples];
  }

  getFilteredSamples() {
    return [...this.filteredSamples];
  }

  getPeaks() {
    return [...this.peaks];
  }

  getHeartRate() {
    return this.heartRate;
  }
  getSampleRate() {
    return this.SAMPLE_RATE;
  }
  clear() {
    this.rawSamples = [];
    this.filteredSamples = [];
    this.peaks = [];
    this.heartRate = 0;
  }
}
