export function printPdfBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  iframe.src = url

  const cleanup = () => {
    URL.revokeObjectURL(url)
    iframe.remove()
    window.removeEventListener('focus', onFocus)
  }

  const onFocus = () => {
    window.setTimeout(cleanup, 500)
  }

  iframe.onload = () => {
    const win = iframe.contentWindow
    if (!win) {
      cleanup()
      return
    }

    win.addEventListener('afterprint', cleanup)
    window.addEventListener('focus', onFocus)
    win.focus()
    win.print()
  }

  document.body.appendChild(iframe)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
