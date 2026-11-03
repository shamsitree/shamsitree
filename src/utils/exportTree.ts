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
export async function exportTreeToPNG(containerElement: HTMLElement | null, filename = 'shamsitree-export.png'): Promise<void> {
 if(!containerElement)throw new Error('Open a tree before exporting.');
 const {toPng}=await import('html-to-image');
 const content=containerElement.firstElementChild as HTMLElement|null;
 if(!content)throw new Error('No tree is available to export.');
 const width=Math.ceil(Math.max(content.scrollWidth,content.getBoundingClientRect().width));
 const height=Math.ceil(Math.max(content.scrollHeight,content.getBoundingClientRect().height));
 // Keep browser canvas allocations bounded; export stays entirely on-device.
 const ratio=Math.min(2,Math.sqrt(16000000/Math.max(1,width*height)),16384/Math.max(width,height));
 await document.fonts.ready;
 const data=await toPng(content,{width,height,pixelRatio:ratio,skipFonts:true,backgroundColor:'#ffffff',style:{transform:'none',width:width+'px',height:height+'px',overflow:'visible'}});
 const link=document.createElement('a');link.download=filename;link.href=data;link.click();
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
