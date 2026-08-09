import { jsPDF } from "jspdf";
import type { ECGSample } from "./ecgRecorder";
import { ECGFilters } from "./ecgFilters";
import { filterECG } from "./ecgSignalProcessing";
export function downloadECGCSV(samples: ECGSample[]) {
  const header = "Sample,Time_ms,ECG_Value\n";

  const rows = samples
    .map(
      (sample) =>
        `${sample.sample},${sample.timeMs.toFixed(2)},${sample.value}`,
    )
    .join("\n");

  const csv = header + rows;

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `PulseView_ECG_${Date.now()}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function downloadECGPDF(
  samples: ECGSample[],
  heartRate = 0,
  sampleRate = 250,
  leadLabel = "I",
  acquisitionLabel = "3-lead ECG",
) {
  if (samples.length === 0) return;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const graphWidth = Math.min(pageWidth - margin * 2 - 16, 198);
  // Use two smaller strips so the exported page stays within A4 height
  const graphHeight = 60;
  const graphLeft = margin + 8;
  const graphTop = 40;
  const graphBottom = graphTop + graphHeight;
  const secondTop = graphTop + graphHeight + 8;
  const secondBottom = secondTop + graphHeight;

  const reportDate = new Date();
  const totalDurationSeconds = (samples.length - 1) / sampleRate;
  const maxWindowSeconds = 10; // longer rhythm strip for clinical review
  const windowSeconds = Math.min(maxWindowSeconds, totalDurationSeconds);
  const windowSamples = Math.max(2, Math.floor(windowSeconds * sampleRate));
  let segmentSamples = samples.slice(-windowSamples);

  segmentSamples = filterECG(segmentSamples, sampleRate);

  const startTimeMs = segmentSamples[0]?.timeMs ?? 0;
  const endTimeMs = segmentSamples[segmentSamples.length - 1]?.timeMs ?? 0;
  const actualWindowSeconds = Math.max(0.001, (endTimeMs - startTimeMs) / 1000);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("PulseView ECG Report", graphLeft, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`Date: ${reportDate.toLocaleDateString()}`, graphLeft, 26);
  doc.text(`Time: ${reportDate.toLocaleTimeString()}`, graphLeft, 32);
  doc.text(`Patient: __________________________`, graphLeft, 38);
  doc.text(`ID: _______________________________`, graphLeft, 44);

  doc.text(acquisitionLabel, graphLeft + 120, 26);
  doc.text(`Lead: ${leadLabel}`, graphLeft + 120, 32);
  doc.text(`Paper speed: 25 mm/s`, graphLeft + 120, 38);
  doc.text(`Gain: 10 mm/mV`, graphLeft + 120, 44);
  doc.text(`Filter: 0.05 - 150 Hz`, graphLeft + 120, 50);

  doc.text(`Heart rate: ${heartRate || "--"} bpm`, graphLeft + 210, 26);
  doc.text(`Samples: ${samples.length}`, graphLeft + 210, 32);
  doc.text(`Rhythm window: ${windowSeconds.toFixed(1)} s`, graphLeft + 210, 38);

  doc.setLineWidth(0.35);
  doc.setDrawColor(0);
  doc.line(
    graphLeft - 4,
    graphTop - 4,
    graphLeft + graphWidth + 4,
    graphTop - 4,
  );

  const values = segmentSamples.map((sample) => sample.value);
  const baseline =
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const centerY = graphTop + graphHeight / 2;
  const yScale = 10; // 10 mm per mV
  const xScale = graphWidth / actualWindowSeconds;
  const pointStep = Math.max(
    1,
    Math.round(segmentSamples.length / (graphWidth * 3)),
  );

  doc.setDrawColor(255, 200, 200);
  doc.setLineWidth(0.08);
  const smallSquare = 1;
  for (let x = 0; x <= graphWidth; x += smallSquare) {
    doc.line(graphLeft + x, graphTop, graphLeft + x, graphBottom);
    doc.line(graphLeft + x, secondTop, graphLeft + x, secondBottom);
  }
  for (let y = 0; y <= graphHeight; y += smallSquare) {
    doc.line(graphLeft, graphTop + y, graphLeft + graphWidth, graphTop + y);
    doc.line(graphLeft, secondTop + y, graphLeft + graphWidth, secondTop + y);
  }

  doc.setDrawColor(215, 110, 110);
  doc.setLineWidth(0.15);
  const largeSquare = 5;
  for (let x = 0; x <= graphWidth; x += largeSquare) {
    doc.line(graphLeft + x, graphTop, graphLeft + x, graphBottom);
    doc.line(graphLeft + x, secondTop, graphLeft + x, secondBottom);
  }
  for (let y = 0; y <= graphHeight; y += largeSquare) {
    doc.line(graphLeft, graphTop + y, graphLeft + graphWidth, graphTop + y);
    doc.line(graphLeft, secondTop + y, graphLeft + graphWidth, secondTop + y);
  }

  doc.setDrawColor(0);
  doc.setLineWidth(0.35);
  doc.line(graphLeft, graphTop, graphLeft + graphWidth, graphTop);
  doc.line(graphLeft, graphBottom, graphLeft + graphWidth, graphBottom);
  doc.line(graphLeft, graphTop, graphLeft, graphBottom);
  // second strip border
  doc.line(graphLeft, secondTop, graphLeft + graphWidth, secondTop);
  doc.line(graphLeft, secondBottom, graphLeft + graphWidth, secondBottom);
  doc.line(graphLeft, secondTop, graphLeft, secondBottom);

  doc.setDrawColor(0);
  doc.setLineWidth(0.28);

  const clampValue = (value: number) => Math.max(-2, Math.min(2, value));
  // draw first strip
  let previousX = graphLeft;
  let previousY =
    centerY - (clampValue(segmentSamples[0].value) - baseline) * yScale;
  for (let i = pointStep; i < segmentSamples.length; i += pointStep) {
    const sample = segmentSamples[i];
    const elapsedSeconds = (sample.timeMs - startTimeMs) / 1000;
    const x = graphLeft + elapsedSeconds * xScale;
    const y = centerY - (clampValue(sample.value) - baseline) * yScale;
    doc.line(previousX, previousY, x, y);
    previousX = x;
    previousY = y;
  }

  // draw second strip (same data)
  const secondCenterY = secondTop + graphHeight / 2;
  previousX = graphLeft;
  previousY =
    secondCenterY - (clampValue(segmentSamples[0].value) - baseline) * yScale;
  for (let i = pointStep; i < segmentSamples.length; i += pointStep) {
    const sample = segmentSamples[i];
    const elapsedSeconds = (sample.timeMs - startTimeMs) / 1000;
    const x = graphLeft + elapsedSeconds * xScale;
    const y = secondCenterY - (clampValue(sample.value) - baseline) * yScale;
    doc.line(previousX, previousY, x, y);
    previousX = x;
    previousY = y;
  }

  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.text(`Lead ${leadLabel}`, graphLeft, graphTop - 6);
  doc.text("25 mm/s, 10 mm/mV", graphLeft + graphWidth - 44, graphTop - 6);

  doc.text("Time", graphLeft + graphWidth / 2 - 7, graphBottom + 10);
  doc.text("Amplitude", graphLeft - 13, graphTop + graphHeight / 2 + 3, {
    angle: 90,
  });

  doc.setLineWidth(0.4);
  doc.line(graphLeft + 4, graphBottom + 3, graphLeft + 14, graphBottom + 3);
  doc.text("0.2 s", graphLeft + 4, graphBottom + 8);
  doc.line(graphLeft - 8, centerY - 5, graphLeft - 8, centerY + 5);
  doc.text("1 mV", graphLeft - 14, centerY - 8, { angle: 90 });

  doc.setFontSize(8);
  doc.text(
    "Report generated by PulseView. Interpretation not included.",
    graphLeft,
    pageHeight - 12,
  );

  doc.save(`PulseView_ECG_Report_${Date.now()}.pdf`);
}
