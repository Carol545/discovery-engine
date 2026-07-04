// Export: Word (.doc via Word-compatible HTML) and PDF (via the browser print dialog with a
// print stylesheet that isolates the minutes document). No dependencies.

const DOC_CSS = `
  body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #111; margin: 1in; }
  h1 { font-size: 16pt; text-align: center; margin-bottom: 2pt; }
  .doc-sub, .doc-sub2 { text-align: center; margin: 2pt 0; }
  .doc-sub { font-weight: bold; }
  h2 { font-size: 13pt; border-bottom: 1px solid #999; padding-bottom: 2pt; margin-top: 16pt; }
  p { line-height: 1.45; margin: 6pt 0; }
  .motion { background: #f2f2f2; padding: 8pt 10pt; border-left: 3pt solid #555; }
  .verbatim { font-style: italic; }
  table.actions { border-collapse: collapse; width: 100%; margin: 8pt 0; }
  table.actions th, table.actions td { border: 1px solid #888; padding: 5pt 8pt; text-align: left; font-size: 11pt; }
  table.actions th { background: #eee; }
  .signature { margin-top: 28pt; }
  .sig-line { border-bottom: 1px solid #111; width: 220pt; height: 18pt; }
  .approval { margin-top: 14pt; }
  .needs-review { color: #b00; font-weight: bold; }
  .watermark { margin-top: 24pt; text-align: center; color: #999; font-size: 9pt; border-top: 1px solid #ddd; padding-top: 6pt; }
`;

function watermarkHtml(settings) {
  // Free plan exports carry a watermark; paid removes it.
  return settings.plan === 'free'
    ? `<p class="watermark">Draft prepared with MinuteMaker (Free plan) — minutemaker.app</p>`
    : '';
}

export function exportWord(minutesHtml, filename, settings) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${filename}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>${DOC_CSS}</style></head>
<body>${minutesHtml}${watermarkHtml(settings)}</body></html>`;
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export function exportPdf(minutesHtml, filename, settings) {
  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow pop-ups to export as PDF.');
    return;
  }
  w.document.write(`<html><head><title>${filename}</title><style>${DOC_CSS}</style></head>
<body>${minutesHtml}${watermarkHtml(settings)}
<script>window.onload = () => { window.print(); };<\/script></body></html>`);
  w.document.close();
}
