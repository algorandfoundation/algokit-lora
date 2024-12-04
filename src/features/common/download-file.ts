import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'

export const downloadFile = async (filename: string, blob: Blob) => {
  if (window.__TAURI_INTERNALS__) {
    const filePath = await save({ defaultPath: filename })
    if (filePath) {
      await writeFile(filePath, new Uint8Array(await blob.arrayBuffer()))
    }
  } else {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', filename)
    link.click()
  }
}
