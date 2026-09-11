(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('../shared/constants'),
      require('../shared/html'),
      require('../render/components'),
    );
  } else {
    global.LayoutStudioMarkdown = factory(global.LayoutStudioConstants, global.LayoutStudioHtml, global.LayoutStudioComponents);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (
  { CASE_NOTICE, NOTE_PREFIXES, METADATA_PREFIXES },
  { normalizePath, textHtml },
  {
    globalOpen,
    renderCardPlaceholder,
    renderFooter,
    renderImage,
    renderJuhongTitle,
    renderKongxinTitle,
    renderHongYiTitle,
    renderList,
    renderNote,
    renderParagraph,
    renderQuote,
  },
) {
  function isNoteText(value) {
    const normalized = value.trim();
    if (NOTE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return true;
    return /^\*\*([^*]+)\*\*\s*[:：]/.test(normalized);
  }

  function isMetadataStart(value) {
    const normalized = value.trim();
    if (/^(建议发布时使用：|发布时可配套使用：|\*\*配套发布建议\*\*)/.test(normalized)) return true;
    return METADATA_PREFIXES.some((prefix) => [
      new RegExp(`^\\*\\*${prefix}\\s*[：:]\\*\\*`),
      new RegExp(`^(?:-\\s*)?\\*\\*${prefix}\\*\\*\\s*[：:]`),
    ].some((pattern) => pattern.test(normalized)));
  }

  function isBoldChapter(value) {
    return /^\*\*((?:[一二三四五六七八九十百]+、|\d+[.、])\s*.+?)\*\*$/.test(value.trim());
  }

  function isLeadingCaseNote(value) {
    const normalized = value.trim();
    return normalized.includes(CASE_NOTICE) || (normalized.length > 2 && normalized.startsWith('*') && normalized.endsWith('*') && (normalized.includes('文中人物与情节') || normalized.includes('文中案例')));
  }

  function hasPersonStoryCase(lines) {
    const text = lines.join('\n');
    if (text.includes(CASE_NOTICE)) return false;
    if (/(人物案例|家庭案例|人物故事|家庭故事|真实故事|真实案例)/.test(text)) return true;
    const named = /(?:[\u4e00-\u9fff]{1,3}(?:姐|哥|叔|姨)|[\u4e00-\u9fff]{1,4}(?:先生|女士)|(?:一位|有位)?[一二三四五六七八九十百零]{1,4}岁的(?:读者|老人|父亲|母亲|女性|男性))/.test(text);
    const relation = /(夫妻|妻子|丈夫|女儿|儿子|孙女|孙子|婆婆|岳母|母亲|父亲)/.test(text);
    const narrative = /(前些日子|前不久|有位|有一位|我认识|我接触过|曾经|那天|那年|起初|后来|几个月后|过了一段时间|多年后|有一天|有一次|说起一件事)/.test(text);
    const dialogue = text.includes('“') && text.includes('”');
    return narrative && (named || relation || dialogue);
  }

  function findImageReferences(lines) {
    const references = new Set();
    for (const line of lines) {
      const match = line.match(/^!\[[^\]]*\]\(([^)]+)\)$/);
      if (match) references.add(normalizePath(match[1]));
    }
    return references;
  }

  function renderMarkdown(markdown, style, imagePlan) {
    const lines = markdown.replaceAll('\r', '').split('\n');
    const output = [];
    const usedImages = findImageReferences(lines);
    let number = 0;
    let paragraph = [];
    let quote = [];
    let items = [];
    let bodyStarted = false;
    let leadingNotice = null;

    const flushParagraph = () => {
      if (!paragraph.length) return;
      const value = paragraph.join('\n').trim();
      paragraph = [];
      if (!value) return;
      if (isLeadingCaseNote(value)) {
        leadingNotice = CASE_NOTICE;
        return;
      }
      bodyStarted = true;
      output.push(isNoteText(value) ? renderNote(value, style) : renderParagraph(value, style, style === 'juhong' ? '#FF582C' : '#E50012'));
    };
    const flushQuote = () => {
      if (!quote.length) return;
      const values = quote;
      quote = [];
      if (values.join('\n').includes(CASE_NOTICE)) {
        leadingNotice = CASE_NOTICE;
        return;
      }
      if (!bodyStarted && isNoteText(values[0])) {
        leadingNotice = CASE_NOTICE;
        return;
      }
      bodyStarted = true;
      output.push(isNoteText(values[0]) ? renderNote(values.join('\n'), style) : renderQuote(values, style));
    };
    const flushItems = () => {
      if (!items.length) return;
      const values = items;
      items = [];
      bodyStarted = true;
      output.push(renderList(values, style));
    };
    const addChapter = (title) => {
      flushParagraph();
      flushQuote();
      flushItems();
      bodyStarted = true;
      number += 1;
      if (style === 'kongxin-hong') output.push(renderKongxinTitle(number, title));
      if (style === 'juhong') output.push(renderJuhongTitle(number, title));
      if (style === 'hong-yi') output.push(renderHongYiTitle(number, title));
      const autoImage = imagePlan?.chapterImages?.[number - 1];
      if (autoImage && !usedImages.has(normalizePath(autoImage))) output.push(renderImage(autoImage));
    };

    for (const raw of lines) {
      const line = raw.trim();
      if (isMetadataStart(line)) {
        flushParagraph(); flushQuote(); flushItems();
        break;
      }
      if (!line) { flushParagraph(); flushQuote(); flushItems(); continue; }
      if (line === '---') { flushParagraph(); flushQuote(); flushItems(); continue; }
      if (line.startsWith('# ')) { flushParagraph(); flushQuote(); flushItems(); continue; }
      if (line.startsWith('## ')) { addChapter(line.slice(3).trim()); continue; }
      const boldChapter = line.match(/^\*\*((?:[一二三四五六七八九十百]+、|\d+[.、])\s*.+?)\*\*$/);
      if (boldChapter) { addChapter(boldChapter[1].trim()); continue; }
      if (line.startsWith('### ')) {
        flushParagraph(); flushQuote(); flushItems(); bodyStarted = true;
        const color = style === 'hong-yi' ? 'rgb(192,48,47)' : style === 'juhong' ? '#FF582C' : '#E50012';
        const border = style === 'hong-yi' ? 'rgb(217,46,38)' : color;
        output.push(`<section style="margin:30px 0 18px;border-left:${style === 'hong-yi' ? '4' : '3'}px solid ${border};padding-left:12px;box-sizing:border-box;"><p style="margin:0;color:${color};font-size:16px;line-height:1.75;letter-spacing:0;"><strong><span leaf="">${textHtml(line.slice(4).trim())}</span></strong></p></section>`);
        continue;
      }
      const imageMatch = line.match(/^!\[[^\]]*\]\(([^)]+)\)$/);
      if (imageMatch) { flushParagraph(); flushQuote(); flushItems(); bodyStarted = true; output.push(renderImage(imageMatch[1].trim())); continue; }
      if (line.startsWith('>')) {
        flushParagraph(); flushItems();
        const quoteLine = line.slice(1).trim();
        if (quoteLine.includes(CASE_NOTICE) || (!bodyStarted && isNoteText(quoteLine))) { leadingNotice = CASE_NOTICE; continue; }
        quote.push(quoteLine);
        continue;
      }
      const listMatch = line.match(/^(?:[-*]|\d+[.)])\s+(.+)$/);
      if (listMatch) { flushParagraph(); flushQuote(); items.push(listMatch[1]); continue; }
      if (isLeadingCaseNote(line)) { leadingNotice = CASE_NOTICE; continue; }
      flushQuote(); flushItems(); paragraph.push(line);
    }
    flushParagraph(); flushQuote(); flushItems();
    if (leadingNotice || hasPersonStoryCase(lines) || lines.some((line) => line.includes(CASE_NOTICE))) {
      output.unshift(renderCardPlaceholder(), renderNote(CASE_NOTICE, style));
    }
    output.push(renderFooter());
    return `${globalOpen(style)}${output.join('')}</section>`;
  }

  function inferArticleTitle(markdown) {
    const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || '公众号文章';
    return heading.replace(/[<>:"/\\|?*]/g, '-').replace(/[. ]+$/g, '') || '公众号文章';
  }

  return { renderMarkdown, hasPersonStoryCase, inferArticleTitle, isBoldChapter };
}));
