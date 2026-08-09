export interface ECGSample {
  sample: number;
  timeMs: number;
  value: number;
}

export class ECGRecorder {
  private samples: ECGSample[] = [];
  private recording = false;
  private sampleIndex = 0;

  private readonly SAMPLE_RATE = 250;
  private readonly DURATION_SECONDS = 60;

  start() {
    this.samples = [];
    this.sampleIndex = 0;
    this.recording = true;
  }

  addSample(value: number, timeMs?: number) {
    if (!this.recording) return;

    const actualTimeMs =
      typeof timeMs === "number"
        ? timeMs
        : (this.sampleIndex / this.SAMPLE_RATE) * 1000;

    this.samples.push({
      sample: this.sampleIndex,
      timeMs: actualTimeMs,
      value,
    });

    this.sampleIndex++;
  }

  stop() {
    this.recording = false;

    return [...this.samples];
  }

  isRecording() {
    return this.recording;
  }

  getSamples() {
    return [...this.samples];
  }

  getSampleCount() {
    return this.samples.length;
  }

  getDurationSeconds() {
    return this.sampleIndex / this.SAMPLE_RATE;
  }

  clear() {
    this.samples = [];
    this.sampleIndex = 0;
    this.recording = false;
  }

  getSampleRate() {
    return this.SAMPLE_RATE;
  }

  getDurationLimit() {
    return this.DURATION_SECONDS;
  }
}
