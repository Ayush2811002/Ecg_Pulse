// let port: any = null;
// let reader: ReadableStreamDefaultReader<string> | null = null;

// export async function connectArduino(onData: (data: string) => void) {
//   const serial = (navigator as any).serial;

//   if (!serial) {
//     throw new Error("Web Serial API is not supported.");
//   }

//   port = await serial.requestPort();

//   await port.open({
//     baudRate: 115200,
//   });

//   if (!port.readable) {
//     throw new Error("Serial port is not readable.");
//   }

//   const decoder = new TextDecoderStream() as unknown as TransformStream<
//     Uint8Array,
//     string
//   >;
//   const decodedStream = (
//     port.readable as ReadableStream<Uint8Array>
//   ).pipeThrough(decoder);

//   reader = decodedStream.getReader();

//   // Start reading in background
//   readLoop(onData);
// }
// async function readLoop(onData: (data: string) => void) {
//   while (reader) {
//     try {
//       const { value, done } = await reader.read();

//       if (done) break;

//       if (value) {
//         onData(value);
//       }
//     } catch (err) {
//       console.error(err);
//       break;
//     }
//   }
// }
// //   const decodedStream = (
// //     port.readable as ReadableStream<Uint8Array>
// //   ).pipeThrough(decoder);

// //   reader = decodedStream.getReader();

// //   while (true) {
// //     const { value, done } = await reader.read();

// //     if (done) break;

// //     if (value) {
// //       onData(value.trim());
// //     }
// //   }
// // }

// export async function disconnectArduino() {
//   if (reader) {
//     await reader.cancel();
//     reader = null;
//   }

//   if (port) {
//     await port.close();
//     port = null;
//   }
// }
let port: any = null;
let reader: ReadableStreamDefaultReader<string> | null = null;
let disconnectHandler: ((event: any) => void) | null = null;

function cleanupSerial() {
  if (disconnectHandler) {
    try {
      (navigator as any).serial.removeEventListener(
        "disconnect",
        disconnectHandler,
      );
    } catch (err) {
      console.error("Failed to remove disconnect listener:", err);
    }
    disconnectHandler = null;
  }

  reader = null;
  port = null;
}

function notifyDisconnect(onDisconnect?: () => void) {
  cleanupSerial();
  if (onDisconnect) {
    try {
      onDisconnect();
    } catch (err) {
      console.error("Disconnect callback error:", err);
    }
  }
}

/**
 * Connect to Arduino
 */
export async function connectArduino(
  onData: (data: string) => void,
  onDisconnect?: () => void,
) {
  const serial = (navigator as any).serial;

  if (!serial) {
    throw new Error("Web Serial API is not supported.");
  }

  // Prevent multiple connections
  if (port) {
    return;
  }

  // Open browser COM port picker
  port = await serial.requestPort();

  await port.open({
    baudRate: 115200,
  });

  if (!port.readable) {
    throw new Error("Serial port is not readable.");
  }

  disconnectHandler = (event: any) => {
    if (event.port !== port) {
      return;
    }

    console.warn("Serial disconnect event received", event);
    notifyDisconnect(onDisconnect);
  };

  try {
    (navigator as any).serial.addEventListener("disconnect", disconnectHandler);
  } catch (err) {
    console.warn("Serial disconnect event not supported:", err);
    disconnectHandler = null;
  }

  const decoder = new TextDecoderStream() as unknown as TransformStream<
    Uint8Array,
    string
  >;

  const decodedStream = (
    port.readable as ReadableStream<Uint8Array>
  ).pipeThrough(decoder);

  reader = decodedStream.getReader();

  // Start reading in background
  readLoop(onData, onDisconnect);

  // Return immediately
  return;
}

/**
 * Background Serial Reader
 */
async function readLoop(
  onData: (data: string) => void,
  onDisconnect?: () => void,
) {
  let buffer = "";

  while (reader) {
    try {
      const { value, done } = await reader.read();

      if (done) break;

      if (!value) {
        continue;
      }

      buffer += value;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          onData(trimmed);
        }
      }
    } catch (err) {
      console.error("Serial Read Error:", err);
      notifyDisconnect(onDisconnect);
      return;
    }
  }

  const finalLine = buffer.trim();
  if (finalLine) {
    onData(finalLine);
  }

  if (port !== null) {
    notifyDisconnect(onDisconnect);
  }
}

/**
 * Disconnect Arduino
 */
export async function disconnectArduino() {
  try {
    if (reader) {
      await reader.cancel();
    }
  } catch (err) {
    console.error(err);
  }

  try {
    if (port) {
      await port.close();
    }
  } catch (err) {
    console.error(err);
  }

  cleanupSerial();
}

/**
 * Check connection status
 */
export function isArduinoConnected() {
  return port !== null;
}
