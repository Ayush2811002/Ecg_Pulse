export interface ECGSample {
  sample: number;
  timeMs: number;
  value: number;
}

function biquadLowPass(
  samples: number[],
  sampleRate: number,
  cutoff: number,
): number[] {
  const Q = Math.SQRT1_2;

  const w0 = (2 * Math.PI * cutoff) / sampleRate;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const alpha = sin / (2 * Q);

  let b0 = (1 - cos) / 2;
  let b1 = 1 - cos;
  let b2 = (1 - cos) / 2;
  const a0 = 1 + alpha;
  let a1 = -2 * cos;
  let a2 = 1 - alpha;

  b0 /= a0;
  b1 /= a0;
  b2 /= a0;
  a1 /= a0;
  a2 /= a0;

  const output: number[] = [];

  let x1 = samples[0] ?? 0;
  let x2 = x1;
  let y1 = x1;
  let y2 = x1;

  for (const x of samples) {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

    output.push(y);

    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
  }

  return output;
}

function biquadHighPass(
  samples: number[],
  sampleRate: number,
  cutoff: number,
): number[] {
  const Q = Math.SQRT1_2;

  const w0 = (2 * Math.PI * cutoff) / sampleRate;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const alpha = sin / (2 * Q);

  let b0 = (1 + cos) / 2;
  let b1 = -(1 + cos);
  let b2 = (1 + cos) / 2;
  const a0 = 1 + alpha;
  let a1 = -2 * cos;
  let a2 = 1 - alpha;

  b0 /= a0;
  b1 /= a0;
  b2 /= a0;
  a1 /= a0;
  a2 /= a0;

  const output: number[] = [];

  let x1 = samples[0] ?? 0;
  let x2 = x1;
  let y1 = x1;
  let y2 = x1;

  for (const x of samples) {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

    output.push(y);

    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
  }

  return output;
}

function biquadNotch(
  samples: number[],
  sampleRate: number,
  frequency: number,
  Q = 30,
): number[] {
  const w0 = (2 * Math.PI * frequency) / sampleRate;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const alpha = sin / (2 * Q);

  let b0 = 1;
  let b1 = -2 * cos;
  let b2 = 1;

  const a0 = 1 + alpha;
  let a1 = -2 * cos;
  let a2 = 1 - alpha;

  b0 /= a0;
  b1 /= a0;
  b2 /= a0;
  a1 /= a0;
  a2 /= a0;

  const output: number[] = [];

  let x1 = samples[0] ?? 0;
  let x2 = x1;
  let y1 = x1;
  let y2 = x1;

  for (const x of samples) {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

    output.push(y);

    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
  }

  return output;
}

export function filterECG(samples: ECGSample[], sampleRate = 250): ECGSample[] {
  if (samples.length < 10) {
    return samples;
  }

  const raw = samples.map((s) => s.value);

  // Remove DC offset first.
  const mean = raw.reduce((sum, value) => sum + value, 0) / raw.length;

  const centered = raw.map((value) => value - mean);

  // Remove 50 Hz mains interference.
  const notched = biquadNotch(centered, sampleRate, 50, 30);

  // Remove slow baseline drift.
  const highPassed = biquadHighPass(notched, sampleRate, 0.5);

  // Keep the main ECG frequency range.
  const filtered = biquadLowPass(highPassed, sampleRate, 40);

  return samples.map((sample, index) => ({
    ...sample,
    value: filtered[index],
  }));
}
