/** Shrinks a photo to max 320px JPEG so many products fit in offline storage. */
export async function resizeImage(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const s = Math.min(1, 320 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error('Could not process image'))), 'image/jpeg', 0.8))
}
