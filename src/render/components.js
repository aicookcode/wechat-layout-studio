(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../shared/html'), require('../markdown/inline'), require('../markdown/title'));
  } else {
    global.LayoutStudioComponents = factory(global.LayoutStudioHtml, global.LayoutStudioInline, global.LayoutStudioTitle);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function ({ escapeHtml, textHtml }, { inlineHtml, inlineHong }, { TITLE_LINE_LENGTHS, wrapTitleLines }) {
  function renderKongxinTitle(number, title) {
    const lines = wrapTitleLines(title, TITLE_LINE_LENGTHS['kongxin-hong']).filter(Boolean);
    const titleLine = (text) => `<section style="margin:0;color:#000000;font-size:18px;line-height:1.55;letter-spacing:1.5px;text-align:left;word-break:keep-all;overflow-wrap:normal;"><strong style="display:block;color:#000000;font-size:18px;font-weight:700;line-height:1.55;letter-spacing:1.5px;word-break:keep-all;overflow-wrap:normal;">${inlineHtml(text, '#000000')}</strong></section>`;
    return `<section style="width:100%;flex:0 0 100%;margin:50px 0px 50px;box-sizing:border-box;max-width:100% !important;"><section style="width:20px;margin:0 0 7px;box-sizing:border-box;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 26" style="display:block;width:20px;height:auto;overflow:visible;"><path d="M34,26H20.12L26.68,0H37ZM0,26,6.55,0H16.87l-3,26Z" style="fill:#FF0000;fill-rule:evenodd;"></path></svg></section><section style="display:flex;align-items:stretch;margin-left:8px;box-sizing:border-box;"><section style="width:1px;flex:0 0 1px;background:#FF0000;margin-right:16px;box-sizing:border-box;"></section><section style="flex:1;min-width:0;box-sizing:border-box;text-align:left;word-break:keep-all;overflow-wrap:normal;"><section style="margin:0 0 10px;line-height:1;"><strong leaf="" style="display:block;color:#FFFFFF;font-size:40px;font-weight:400;line-height:1;letter-spacing:0;paint-order:stroke fill;-webkit-text-stroke:2px #E50012;">${String(number).padStart(2, '0')}</strong></section>${lines.map(titleLine).join('')}</section></section></section>`;
  }

  function renderJuhongTitle(number, title) {
    const lines = wrapTitleLines(title, TITLE_LINE_LENGTHS.juhong);
    const [main, sub] = lines.length <= 1 ? [lines[0] || '', ''] : [lines[0], lines.slice(1).join('\n')];
    const numberText = String(number).padStart(2, '0');
    const titleStyle = 'word-break:keep-all;overflow-wrap:normal;';
    const mainHtml = sub ? `<section style="font-size:18px;letter-spacing:1.5px;color:#FF582C;margin-top:-1.75em;line-height:1.5;${titleStyle}"><strong><span leaf="">${textHtml(main)}</span></strong></section>` : '';
    const subMargin = sub ? '0' : '-1.75em';
    return `<section style="margin:30px 0;text-align:left;box-sizing:border-box;"><section style="font-size:70px;letter-spacing:1.5px;color:#EEECEA;line-height:1;"><strong><span leaf="">${numberText}</span></strong></section>${mainHtml}<section style="display:flex;align-items:center;line-height:1.5;margin-top:${subMargin};"><section style="font-size:18px;letter-spacing:1.5px;color:#FF582C;margin-right:15px;${titleStyle}"><strong><span leaf="">${textHtml(sub || main)}</span></strong></section><section style="max-width:100% !important;width:100%;height:1px;background-color:#DED7D1;flex:1;box-sizing:border-box;"><span leaf=""><br></span></section></section></section>`;
  }

  function renderHongYiTitle(number, title) {
    const wrappedTitle = textHtml(wrapTitleLines(title, TITLE_LINE_LENGTHS['hong-yi']).join('\n'));
    return `<section style="margin:42px 0 24px;box-sizing:border-box;"><section style="width:50px;margin-bottom:0;box-sizing:border-box;"><p style="margin:0;line-height:0;"><img src="src/assets/hong-yi/chapter-dot.gif" style="display:block;width:50px;height:auto;vertical-align:bottom;background-color:transparent;"></p></section><section style="display:flex;justify-content:flex-end;align-items:center;margin-top:-40px;box-sizing:border-box;"><section style="z-index:1;background:linear-gradient(rgb(255,227,153),rgb(255,209,86));width:25px;height:25px;line-height:25px;text-align:center;border-radius:50%;color:rgb(217,46,38);font-size:12px;font-weight:bold;margin-left:auto;box-sizing:border-box;"><span leaf="">${number}</span></section></section><section style="background-image:url('src/assets/hong-yi/chapter-banner.png');background-repeat:repeat;background-position:100% 100%;background-size:100% 100%;margin:-8px 8px 0 20px;padding:6px 28px;box-sizing:border-box;"><section style="margin:0;box-sizing:border-box;word-break:keep-all;overflow-wrap:normal;"><p style="margin:0;color:rgb(253,245,221);font-size:16px;font-style:italic;letter-spacing:1px;line-height:1.6;word-break:keep-all;overflow-wrap:normal;"><strong><span leaf="" style="font-size:18px;word-break:keep-all;overflow-wrap:normal;">${wrappedTitle}</span></strong></p></section></section></section>`;
  }

  function globalOpen(style) {
    if (style === 'hong-yi') return '<section style="max-width:677px;margin:0 auto;background:#FFFFFF;color:rgb(0,0,0);font-family:-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Hiragino Sans GB\',\'Microsoft YaHei\',sans-serif;overflow-x:hidden;">';
    return '<section style="max-width:677px;margin:0 auto;background:#FFFFFF;color:#000000;font-family:-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Hiragino Sans GB\',\'Microsoft YaHei\',sans-serif;overflow-x:hidden;">';
  }

  function renderParagraph(value, style, color = '#000000') {
    if (style === 'hong-yi') return `<p style="margin:0 0 22px;line-height:1.85;text-align:justify;letter-spacing:0;color:rgb(0,0,0);font-size:15px;"><span leaf="">${inlineHong(value, 'rgb(192,48,47)')}</span></p>`;
    return `<p style="margin:0 0 22px;line-height:1.85;text-align:justify;color:#000000;font-size:15px;letter-spacing:0;">${inlineHtml(value, color)}</p>`;
  }

  function renderNote(value, style) {
    const content = style === 'hong-yi' ? inlineHong(value, 'rgb(150,150,150)') : inlineHtml(value, '#999999');
    if (style === 'hong-yi') return `<section style="margin:0 0 22px;box-sizing:border-box;"><p style="margin:0;padding:8px 10px;background:#FFFFFF;color:rgb(150,150,150);font-size:12px;line-height:1.7;border:1px dashed rgb(200,200,200);box-sizing:border-box;"><span leaf="">${content}</span></p></section>`;
    return `<section style="width:100%;margin:22px 0px;padding:8px 10px;border:1px dashed #CFCFCF;background:#FFFFFF;box-sizing:border-box;"><p style="margin:0;color:#999999;font-size:12px;line-height:1.75;letter-spacing:1px;text-align:left;">${content}</p></section>`;
  }

  function renderCardPlaceholder() {
    return '<section style="width:100%;display: flex;align-items: center;justify-content: center;">占位</section>';
  }

  function renderQuote(lines, style) {
    if (style === 'hong-yi') {
      const content = lines.map((line, index) => `<p style="margin:0${index < lines.length - 1 ? ' 0 12px' : ''};"><span leaf="">${inlineHong(line, 'rgb(192,48,47)')}</span></p>`).join('');
      return `<section style="margin:10px 0 24px;text-align:left;box-sizing:border-box;"><section style="margin-left:20px;width:1.5em;background:#FEFEFE;display:inline-block;position:relative;z-index:1;box-sizing:border-box;"><img src="src/assets/hong-yi/quote-mark.png" style="display:block;width:100%;height:auto;vertical-align:bottom;"></section><section style="margin-top:-18px;border:1px dashed rgb(255,147,137);letter-spacing:2px;font-size:15px;line-height:1.75;padding:15px;text-align:left;color:rgb(192,48,47);box-sizing:border-box;">${content}</section></section>`;
    }
    const color = style === 'juhong' ? '#FF582C' : '#E50012';
    const border = style === 'juhong' ? '#FFB39B' : '#E50012';
    const background = style === 'juhong' ? '#FFF8F4' : '#FFF8F8';
    const body = lines.map((line, index) => `<p style="margin:0 0 ${index < lines.length - 1 ? '12' : '0'}px;color:${color};font-size:15px;line-height:1.75;letter-spacing:1px;text-align:left;">${inlineHtml(line, color)}</p>`).join('');
    return `<section style="width:100%;margin:22px 0px;padding:16px 18px;border:1px dashed ${border};background:${background};box-sizing:border-box;">${body}</section>`;
  }

  function renderList(items, style) {
    const color = style === 'hong-yi' ? 'rgb(0,0,0)' : '#000000';
    const body = items.map((item, index) => {
      const content = style === 'hong-yi' ? inlineHong(`• ${item}`, 'rgb(192,48,47)') : inlineHtml(`• ${item}`, style === 'juhong' ? '#FF582C' : '#E50012');
      return `<p style="margin:0 0 ${index < items.length - 1 ? '10' : '0'}px;line-height:1.85;color:${color};font-size:15px;">${style === 'hong-yi' ? `<span leaf="">${content}</span>` : content}</p>`;
    }).join('');
    return `<section style="margin:0 0 22px;padding-left:20px;box-sizing:border-box;">${body}</section>`;
  }

  function renderImage(src) {
    return `<section style="margin:24px 0;text-align:center;line-height:0;"><img src="${escapeHtml(src, true)}" style="display:block;width:100%;max-width:100%;height:auto;margin:0 auto;vertical-align:bottom;"></section>`;
  }

  function renderFooter() {
    return '<section style="margin:48px 0 28px;text-align:center;box-sizing:border-box;"><section style="display:flex;align-items:center;justify-content:center;flex-wrap:nowrap;box-sizing:border-box;"><p style="margin:0;color:#1F1F1F;font-size:15px;font-weight:700;line-height:1.6;letter-spacing:0.5px;text-align:center;"><span leaf="">喜欢这篇文章记得「点赞+在看+转发」哟</span></p><section style="width:28px;flex:0 0 28px;margin-left:8px;line-height:0;box-sizing:border-box;"><img src="src/assets/common/watch-icon.gif" style="display:block;width:100%;height:auto;vertical-align:middle;"></section></section></section>';
  }

  return {
    renderKongxinTitle,
    renderJuhongTitle,
    renderHongYiTitle,
    globalOpen,
    renderParagraph,
    renderNote,
    renderCardPlaceholder,
    renderQuote,
    renderList,
    renderImage,
    renderFooter,
  };
}));
