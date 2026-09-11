(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    global.LayoutStudioTitle = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function stripOrdinal(value) {
    return value.trim().replace(/^(?:[一二三四五六七八九十百]+、|\d+[.、])\s*/, '');
  }

  // Intl.Segmenter is built into supported browsers and Node. The local terms
  // cover common compounds that a generic segmenter may split too aggressively.
  const TITLE_LINE_LENGTH = 12;
  const TITLE_LINE_LENGTHS = Object.freeze({
    'kongxin-hong': TITLE_LINE_LENGTH,
    juhong: TITLE_LINE_LENGTH,
    'hong-yi': 11,
  });
  const TITLE_WORDS = [
    '心理健康', '身体健康', '积极生活方式', '健康生活方式', '生活方式', '中年以后', '人到中年', '退休以后', '人生下半场以后', '人生下半场',
    '亲密关系', '家庭关系', '人际关系', '婚姻关系', '原生家庭', '亲子关系', '婆媳关系',
    '情绪价值', '情绪管理', '精神内耗', '时间管理', '压力管理', '自我成长', '自我管理',
    '健康生活', '积极心态', '良好心态', '内心强大', '保持清醒', '接受自己', '照顾自己',
    '善待自己', '学会放下', '越来越好', '越来越多', '人工智能', '新质生产力', '数字生活',
    '信息时代', '独立思考', '换位思考', '长期主义', '有效沟通', '深度沟通', '停止内耗',
    '情绪稳定', '稳定情绪', '提升自己', '改变自己', '认识自己', '了解自己', '看见自己',
    '取悦自己', '丰富自己', '成就自己', '保护自己', '尊重自己', '人生选择', '人生答案',
    '人生智慧', '生活态度', '生活质量', '生活节奏', '工作生活', '工作压力', '职场关系',
    '晚年生活', '老年生活', '孩子教育', '家庭教育', '父母关系', '夫妻关系', '女性成长',
    '男性成长', '一个人', '有时候', '为什么', '怎么办', '如何面对', '如何处理', '怎样才能',
    '不要着急', '不必焦虑', '不再委屈', '重新开始', '重新认识', '慢慢变好', '越来越轻松',
    '真正重要', '值得拥有', '值得一看', '看起来', '想明白', '想清楚', '说到底', '到最后',
    '从现在开始', '从今天开始', '在这个世界', '这件事情', '那一刻', '这一路上',
  ].sort((left, right) => right.length - left.length);
  const TITLE_HAN_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
  const TITLE_OPENING_RE = /^[“‘（(【\[「『《〈〔﹁﹃]/;
  const TITLE_CLOSING_RE = /^[”’）)】\]」』》〉〕﹂﹄，。！？、：；,.!?;:]/;
  const TITLE_PUNCTUATION_RE = /[，。！？、：；,.!?;:]/;
  const TITLE_CANNOT_START_RE = /^(?:的|了|着|呢|吗|啊|呀|吧|也|都|还|才|更|最|很|太)/;
  const TITLE_CANNOT_END_RE = /(?:和|与|及|或|但|而|的|了|着|在|将|会|被|把|让|对|从|向|为|以|因|如果|却|才|更|最|很|太|不|没|无)$/;
  const TITLE_SEGMENTER = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('zh', { granularity: 'word' })
    : null;

  function titleUnitLength(value) {
    let length = 0;
    for (const character of String(value)) {
      if (TITLE_HAN_RE.test(character)) length += 1;
      else if (/\s/.test(character)) length += 0.35;
      else if (TITLE_PUNCTUATION_RE.test(character)) length += 0.7;
      else length += 0.75;
    }
    return length;
  }

  function titleSegments(value) {
    if (!TITLE_SEGMENTER) return [];
    return [...TITLE_SEGMENTER.segment(value)].map((part) => ({
      start: part.index,
      end: part.index + part.segment.length,
      text: part.segment,
    }));
  }

  function tokenizeTitle(value) {
    const text = String(value).replace(/\s+/g, ' ').trim();
    if (!text) return [];
    const segments = titleSegments(text);
    const segmentAt = new Map(segments.map((segment) => [segment.start, segment]));
    const tokens = [];
    let index = 0;
    while (index < text.length) {
      const character = text[index];
      if (/\s/.test(character)) {
        const start = index;
        while (index < text.length && /\s/.test(text[index])) index += 1;
        tokens.push({ text: text.slice(start, index), length: titleUnitLength(text.slice(start, index)) });
        continue;
      }

      const emphasisMatch = text.slice(index).match(/^\*\*(.+?)\*\*/);
      if (emphasisMatch) {
        tokens.push({ text: emphasisMatch[0], length: titleUnitLength(emphasisMatch[1]), word: true });
        index += emphasisMatch[0].length;
        continue;
      }
      const linkMatch = text.slice(index).match(/^\[[^\]]+\]\(https?:\/\/[^)\s]+\)/);
      if (linkMatch) {
        const label = linkMatch[0].match(/^\[([^\]]+)\]/)?.[1] || linkMatch[0];
        tokens.push({ text: linkMatch[0], length: titleUnitLength(label), word: true });
        index += linkMatch[0].length;
        continue;
      }

      const dictionaryWord = TITLE_WORDS.find((word) => text.startsWith(word, index));
      if (dictionaryWord) {
        tokens.push({ text: dictionaryWord, length: titleUnitLength(dictionaryWord), word: true });
        index += dictionaryWord.length;
        continue;
      }

      const segment = segmentAt.get(index);
      if (segment && segment.end > index) {
        tokens.push({ text: segment.text, length: titleUnitLength(segment.text), word: true });
        index = segment.end;
        continue;
      }

      const codePoint = [...text.slice(index)][0];
      tokens.push({ text: codePoint, length: titleUnitLength(codePoint), word: TITLE_HAN_RE.test(codePoint) });
      index += codePoint.length;
    }
    return tokens;
  }

  function canBreakTitleAt(tokens, boundary) {
    if (boundary <= 0 || boundary >= tokens.length) return false;
    const previous = tokens[boundary - 1].text.trimEnd();
    const next = tokens[boundary].text.trimStart();
    if (!previous || !next) return false;
    if (TITLE_OPENING_RE.test([...previous].at(-1) || '')) return false;
    if (TITLE_CLOSING_RE.test([...next][0] || '')) return false;
    if (TITLE_CANNOT_START_RE.test(next) || TITLE_CANNOT_END_RE.test(previous)) return false;
    return true;
  }

  function breakScore(tokens, boundary, lineLength, targetLength) {
    const previous = tokens[boundary - 1].text.trimEnd();
    const next = tokens[boundary].text.trimStart();
    let score = Math.abs(lineLength - targetLength);
    if (TITLE_PUNCTUATION_RE.test([...previous].at(-1) || '')) score -= 3;
    if (/\s$/.test(tokens[boundary - 1].text) || /^\s/.test(tokens[boundary].text)) score -= 1;
    if (TITLE_CLOSING_RE.test([...next][0] || '')) score += 100;
    if (lineLength < Math.min(5, targetLength * 0.65)) score += 2;
    score -= lineLength / 100;
    return score;
  }

  function wrapTitlePart(value, maxLength = TITLE_LINE_LENGTH) {
    const tokens = tokenizeTitle(value);
    if (!tokens.length) return [];
    const totalLength = tokens.reduce((sum, token) => sum + token.length, 0);
    if (totalLength <= maxLength) return [tokens.map((token) => token.text).join('').trim()];

    const lines = [];
    let start = 0;
    let remainingLength = totalLength;
    while (start < tokens.length) {
      const remainingLines = Math.max(1, Math.ceil(remainingLength / maxLength));
      if (remainingLines === 1) {
        lines.push(tokens.slice(start).map((token) => token.text).join('').trim());
        break;
      }
      const targetLength = remainingLength / remainingLines;
      const candidates = [];
      let lineLength = 0;
      for (let end = start; end < tokens.length; end += 1) {
        lineLength += tokens[end].length;
        const boundary = end + 1;
        if (boundary < tokens.length && lineLength <= maxLength && canBreakTitleAt(tokens, boundary)) {
          candidates.push({ boundary, score: breakScore(tokens, boundary, lineLength, targetLength) });
        }
        if (lineLength > maxLength && candidates.length) break;
      }
      const selected = candidates.sort((left, right) => left.score - right.score)[0]?.boundary
        || Math.min(start + 1, tokens.length);
      lines.push(tokens.slice(start, selected).map((token) => token.text).join('').trim());
      const consumed = tokens.slice(start, selected).reduce((sum, token) => sum + token.length, 0);
      remainingLength -= consumed;
      start = selected;
    }
    return lines.filter(Boolean);
  }

  function wrapTitleLines(value, maxLength = TITLE_LINE_LENGTH) {
    const clean = stripOrdinal(value).replace(/\s+/g, ' ').trim();
    if (!clean) return [];
    const explicitParts = clean.split(/[|｜]/).map((part) => part.trim()).filter(Boolean);
    return explicitParts.flatMap((part) => wrapTitlePart(part, maxLength));
  }

  function splitHeading(value) {
    const lines = wrapTitleLines(value);
    if (lines.length <= 1) return [lines[0] || '', ''];
    return [lines[0], lines.slice(1).join('\n')];
  }

  function splitJuhongHeading(value) {
    const lines = wrapTitleLines(value);
    if (lines.length <= 1) return [lines[0] || '', ''];
    return [lines[0], lines.slice(1).join('\n')];
  }

  return {
    TITLE_LINE_LENGTHS,
    stripOrdinal,
    titleUnitLength,
    tokenizeTitle,
    wrapTitleLines,
    splitHeading,
    splitJuhongHeading,
  };
}));
