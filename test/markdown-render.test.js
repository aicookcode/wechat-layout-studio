const test = require('node:test');
const assert = require('node:assert/strict');

const { renderMarkdown } = require('../src/markdown/render');

function render(markdown) {
  return renderMarkdown(markdown, 'kongxin-hong', { chapterImages: [] });
}

test('skips leading cover copy and summary metadata while rendering the article body', () => {
  const html = render(`# 标题

**封面短句：**
真正稳固的关系，经得起一次缺席。

**摘要：**
很多人参加饭局，不是因为想去，而是害怕不去会被误解。

## 正文章节

敢于说“这次不去”，不是冷淡，而是把时间还给真正重要的生活。`);

  assert.match(html, /正文章节/);
  assert.match(html, /敢于说/);
  assert.doesNotMatch(html, /封面短句/);
  assert.doesNotMatch(html, /真正稳固的关系/);
  assert.doesNotMatch(html, /摘要/);
  assert.doesNotMatch(html, /很多人参加饭局/);
});

test('keeps trailing publishing metadata out of the rendered article', () => {
  const html = render(`# 标题

## 正文章节

正文内容。

**摘要：**
这段文末发布摘要不应进入排版。`);

  assert.match(html, /正文内容/);
  assert.doesNotMatch(html, /摘要/);
  assert.doesNotMatch(html, /这段文末发布摘要/);
});
