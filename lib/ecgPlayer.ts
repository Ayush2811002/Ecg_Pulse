export class ECGPlayer {
  private samples: number[] = [];
  private timer: NodeJS.Timeout | null = null;
  private index = 0;

  async load(file: string) {
    const response = await fetch(file);

    const text = await response.text();

    const lines = text.split("\n").slice(1);

    this.samples = [];

    for (const line of lines) {
      const cols = line.split(",");

      // Change this later depending on CSV format
      const value = Number(cols[1]);

      if (!isNaN(value)) {
        this.samples.push(value);
      }
    }

    this.index = 0;
  }

  //   play(callback: (value: number) => void) {
  //     this.stop();

  //     this.timer = setInterval(() => {
  //       if (this.index >= this.samples.length) {
  //         this.index = 0;
  //       }

  //       callback(this.samples[this.index]);

  //       this.index++;
  //     }, 4); // 250Hz
  //   }
  play(callback: (value: number) => void) {
    this.stop();

    const intervalMs = 1000 / 250;

    this.timer = setInterval(() => {
      if (this.index >= this.samples.length) {
        this.index = 0;
      }

      callback(this.samples[this.index]);
      this.index++;
    }, intervalMs);
  }
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  reset() {
    this.index = 0;
  }

  isPlaying() {
    return this.timer !== null;
  }
}
