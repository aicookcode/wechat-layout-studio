(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    global.LayoutStudioClipboard = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const ASSET_PREFIX = 'src/assets/';

  async function blobAsDataUrl(blob) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    return `data:${blob.type || 'application/octet-stream'};base64,${btoa(binary)}`;
  }

  async function inlineBundledAssets(html) {
    const references = new Set();
    for (const match of html.matchAll(/(?:src="|url\(')([^"')]+)(?:"|')/g)) {
      const reference = match[1];
      if (!reference.startsWith(ASSET_PREFIX)) continue;
      references.add(reference);
    }
    let preview = html;
    for (const reference of references) {
      const response = await fetch(reference);
      if (response.ok) preview = preview.replaceAll(reference, await blobAsDataUrl(await response.blob()));
    }
    return preview;
  }

  async function copyText(value) {
    const text = String(value);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Fall back to the same editing-command path used by rich HTML copy.
      }
    }
    const holder = document.createElement('textarea');
    holder.value = text;
    holder.style.position = 'fixed';
    holder.style.left = '-10000px';
    holder.style.top = '0';
    document.body.appendChild(holder);
    holder.focus();
    holder.select();
    const copied = document.execCommand('copy');
    holder.remove();
    if (!copied) throw new Error('当前浏览器不允许访问剪贴板');
  }

  function plainTextFromHtml(html) {
    const container = document.createElement('div');
    container.innerHTML = html;
    return container.innerText || container.textContent || '';
  }

  async function copyRichHtml(html) {
    const clipboardHtml = `<!--StartFragment-->${html}<!--EndFragment-->`;
    const plainText = plainTextFromHtml(html);
    if (navigator.clipboard?.write && window.ClipboardItem) {
      const item = new ClipboardItem({
        'text/html': new Blob([clipboardHtml], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      return;
    }

    const holder = document.createElement('div');
    holder.contentEditable = 'true';
    holder.style.position = 'fixed';
    holder.style.left = '-10000px';
    holder.style.top = '0';
    holder.innerHTML = html;
    document.body.appendChild(holder);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(holder);
    selection.removeAllRanges();
    selection.addRange(range);
    const copied = document.execCommand('copy');
    selection.removeAllRanges();
    holder.remove();
    if (!copied) throw new Error('当前浏览器不允许访问剪贴板');
  }

  return { blobAsDataUrl, inlineBundledAssets, plainTextFromHtml, copyRichHtml, copyText };
}));
