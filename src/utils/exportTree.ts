/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Trigger print dialog
 */
export function printTree(): void {
  window.print();
}

/**
 * Export tree canvas container as PNG
 */
export function exportTreeToPNG(containerElement: HTMLElement | null, filename: string = 'shamsitree-export.png'): void {
  if (!containerElement) return;

  const svgElement = containerElement.querySelector('svg');
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  // Add xmlns if missing
  if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URLObj = window.URL || window.webkitURL || window;
  const blobURL = URLObj.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const scale = 2; // high resolution export
    const bbox = svgElement.getBoundingClientRect();
    canvas.width = (bbox.width || 1200) * scale;
    canvas.height = (bbox.height || 800) * scale;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(image, 0, 0, bbox.width || 1200, bbox.height || 800);

      const pngURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngURL;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
    URLObj.revokeObjectURL(blobURL);
  };
  image.src = blobURL;
}

/**
 * Export JSON backup of family data
 */
export function exportFamilyDataJSON(data: any, filename: string = 'shamsitree-database.json'): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
