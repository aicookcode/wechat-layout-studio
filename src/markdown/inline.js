(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../shared/html'));
  } else {
    global.LayoutStudioInline = factory(global.LayoutStudioHtml);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function ({ escapeHtml, textHtml }) {
  function inlineHtml(value, emphasisColor) {
    const parts = [];
    let cursor = 0;
    const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
    let match;
    while ((match = pattern.exec(value)) !== null) {
      if (match.index > cursor) {
        parts.push(`<span leaf="">${textHtml(value.slice(cursor, match.index))}</span>`);
      }
      if (match[1] !== undefined) {
        parts.push(`<strong style="color:${emphasisColor};font-weight:700;"><span leaf="">${textHtml(match[1])}</span></strong>`);
      } else {
        parts.push(`<a href="${escapeHtml(match[3], true)}" style="color:${emphasisColor};text-decoration:underline;"><span leaf="">${textHtml(match[2])}</span></a><span leaf="">（${escapeHtml(match[3], true)}）</span>`);
      }
      cursor = match.index + match[0].length;
    }
    if (cursor < value.length) {
      parts.push(`<span leaf="">${textHtml(value.slice(cursor))}</span>`);
    }
    return parts.join('') || '<span leaf=""></span>';
  }

  function inlineHong(value, emphasisColor) {
    const parts = [];
    let cursor = 0;
    const pattern = /\*\*(.+?)\*\*/g;
    let match;
    while ((match = pattern.exec(value)) !== null) {
      if (match.index > cursor) parts.push(textHtml(value.slice(cursor, match.index)));
      parts.push(`<strong style="color:${emphasisColor};font-weight:700;"><span leaf="">${textHtml(match[1])}</span></strong>`);
      cursor = match.index + match[0].length;
    }
    if (cursor < value.length) parts.push(textHtml(value.slice(cursor)));
    return parts.join('');
  }

  return { inlineHtml, inlineHong };
}));
