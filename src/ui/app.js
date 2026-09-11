(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('../shared/constants'),
      require('../markdown/render'),
      require('../ui/clipboard'),
      require('../cover/ui'),
    );
  } else {
    global.LayoutStudioApp = factory(global.LayoutStudioConstants, global.LayoutStudioMarkdown, global.LayoutStudioClipboard, global.LayoutStudioCover);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function ({ STYLES }, { renderMarkdown }, { inlineBundledAssets, copyRichHtml }, { mountCoverModal }) {
  function createApp(doc = document) {
    const state = {
      selectedStyle: 'kongxin-hong',
      lastHtml: '',
      lastFileName: '',
      lastCopyHtml: '',
      previewRevision: 0,
      previewTimer: null,
    };
    const $ = (selector) => doc.querySelector(selector);

    function setLiveStatus(message) {
      $('#live-status').textContent = message;
    }

    function inferArticleTitle(markdown) {
      const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || '公众号文章';
      return heading.replace(/[<>:"/\\|?*]/g, '-').replace(/[. ]+$/g, '') || '公众号文章';
    }

    function buildCurrent() {
      const markdown = $('#markdown-input').value;
      const html = renderMarkdown(markdown, state.selectedStyle, { chapterImages: [] });
      const style = STYLES.find((item) => item.id === state.selectedStyle);
      return {
        html,
        outputName: `${inferArticleTitle(markdown)}_排版_${style.name}.html`,
      };
    }

    function renderStyleTabs() {
      const switcher = $('#style-switcher');
      switcher.innerHTML = STYLES.map((style) => `<button class="style-tab${style.id === state.selectedStyle ? ' selected' : ''}" type="button" data-style="${style.id}" aria-pressed="${style.id === state.selectedStyle}">${style.name}</button>`).join('');
      switcher.querySelectorAll('[data-style]').forEach((button) => button.addEventListener('click', () => {
        if (button.dataset.style === state.selectedStyle) return;
        state.selectedStyle = button.dataset.style;
        renderStyleTabs();
        refreshPreview();
      }));
    }

    function updateCharCount() {
      const count = $('#markdown-input').value.length;
      $('#char-count').textContent = `${count} 字`;
    }

    async function refreshPreview() {
      const revision = ++state.previewRevision;
      const markdown = $('#markdown-input').value;
      const frame = $('#preview-frame');
      const copyButton = $('#copy-to-wechat');
      const downloadButton = $('#download-html');
      updateCharCount();

      if (!markdown.trim()) {
        state.lastHtml = '';
        state.lastFileName = '';
        state.lastCopyHtml = '';
        frame.srcdoc = '';
        copyButton.disabled = true;
        downloadButton.disabled = true;
        setLiveStatus('等待输入 Markdown 内容');
        return;
      }

      try {
        const result = buildCurrent();
        const previewHtml = await inlineBundledAssets(result.html);
        if (revision !== state.previewRevision) return;
        state.lastHtml = result.html;
        state.lastFileName = result.outputName;
        state.lastCopyHtml = previewHtml;
        frame.srcdoc = previewHtml;
        copyButton.disabled = false;
        downloadButton.disabled = false;
        setLiveStatus('预览已更新');
      } catch (error) {
        if (revision !== state.previewRevision) return;
        state.lastHtml = '';
        state.lastFileName = '';
        state.lastCopyHtml = '';
        frame.srcdoc = '';
        copyButton.disabled = true;
        downloadButton.disabled = true;
        setLiveStatus(`预览失败：${error.message}`);
      }
    }

    function schedulePreview() {
      clearTimeout(state.previewTimer);
      updateCharCount();
      state.previewTimer = setTimeout(refreshPreview, 150);
    }

    async function copyToWechat() {
      const markdown = $('#markdown-input').value;
      if (!markdown.trim()) return;
      const button = $('#copy-to-wechat');
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = '正在复制…';
      setLiveStatus('正在准备可粘贴内容');
      try {
        const result = buildCurrent();
        state.lastHtml = result.html;
        state.lastFileName = result.outputName;
        state.lastCopyHtml = await inlineBundledAssets(result.html);
        await copyRichHtml(state.lastCopyHtml);
        button.textContent = '已复制';
        setLiveStatus('已复制，可直接粘贴到微信公众号编辑器');
      } catch (error) {
        button.textContent = '复制失败';
        setLiveStatus(`复制失败：${error.message}`);
      } finally {
        global.setTimeout(() => {
          button.textContent = originalText;
          button.disabled = !$('#markdown-input').value.trim();
        }, 1600);
      }
    }

    async function downloadHtml() {
      const markdown = $('#markdown-input').value;
      if (!markdown.trim()) return;
      const button = $('#download-html');
      button.disabled = true;
      try {
        const result = buildCurrent();
        const portableHtml = await inlineBundledAssets(result.html);
        state.lastHtml = result.html;
        state.lastFileName = result.outputName;
        const blob = new Blob([portableHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = doc.createElement('a');
        link.href = url;
        link.download = result.outputName;
        link.click();
        global.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setLiveStatus(`已下载：${result.outputName}`);
      } catch (error) {
        setLiveStatus(`下载失败：${error.message}`);
      } finally {
        button.disabled = !$('#markdown-input').value.trim();
      }
    }

    const cover = mountCoverModal(doc);
    renderStyleTabs();
    $('#markdown-input').addEventListener('input', schedulePreview);
    $('#copy-to-wechat').addEventListener('click', copyToWechat);
    $('#download-html').addEventListener('click', downloadHtml);
    updateCharCount();
    refreshPreview();

    return { state, buildCurrent, refreshPreview, schedulePreview, cover };
  }

  function mountApp(doc = document) {
    return createApp(doc);
  }

  return { createApp, mountApp };
}));
