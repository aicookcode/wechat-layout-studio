(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    global.LayoutStudioHtml = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function escapeHtml(value, attribute = false) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll(attribute ? '"' : '\0', attribute ? '&quot;' : '\0')
      .replaceAll("'", attribute ? '&#39;' : "'");
  }

  function textHtml(value) {
    return escapeHtml(value).replaceAll('\n', '<br>');
  }

  function normalizePath(value) {
    return value.trim().replaceAll('\\', '/').replace(/^\.\//, '').toLowerCase();
  }

  return { escapeHtml, textHtml, normalizePath };
}));
