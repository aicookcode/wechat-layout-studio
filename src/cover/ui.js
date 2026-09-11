(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./prompt'), require('../ui/clipboard'));
  } else {
    global.LayoutStudioCover = factory(global.LayoutStudioCoverPrompt, global.LayoutStudioClipboard);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (
  { TEMPLATES, OPTIONS, getDefaultSelection, composePrompt },
  { copyText },
) {
  function mountCoverModal(doc = document) {
    const openButton = doc.querySelector('#cover-image');
    const dialog = doc.querySelector('#cover-modal');
    if (!openButton || !dialog) return null;

    const templateSelect = doc.querySelector('#cover-template');
    const sceneSelect = doc.querySelector('#cover-scene');
    const lightingSelect = doc.querySelector('#cover-lighting');
    const subjectSelect = doc.querySelector('#cover-subject');
    const compositionSelect = doc.querySelector('#cover-composition');
    const promptInput = doc.querySelector('#cover-prompt');
    const copyButton = doc.querySelector('#copy-cover-prompt');
    const closeButton = doc.querySelector('#close-cover-modal');
    const status = doc.querySelector('#cover-copy-status');
    const selection = getDefaultSelection();

    function populate(select, options, selected, placeholder) {
      const optionNodes = [placeholder].filter(Boolean).map((label) => {
        const node = doc.createElement('option');
        node.value = '';
        node.textContent = label;
        return node;
      });
      optionNodes.push(...options.map((option) => {
        const value = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        const node = doc.createElement('option');
        node.value = value;
        node.textContent = label;
        return node;
      }));
      select.replaceChildren(...optionNodes);
      select.value = selected;
    }

    function renderControls() {
      populate(templateSelect, TEMPLATES.map((template) => ({ value: template.id, label: template.name })), selection.templateId, '请选择模板');
      populate(sceneSelect, OPTIONS.scenes, selection.scene, '请选择场景');
      populate(lightingSelect, OPTIONS.lighting, selection.lighting, '请选择时间和光线');
      populate(subjectSelect, OPTIONS.subjects, selection.subject, '请选择主体');
      populate(compositionSelect, OPTIONS.compositions, selection.composition, '请选择构图');
      const hasTemplate = Boolean(selection.templateId);
      [sceneSelect, lightingSelect, subjectSelect, compositionSelect].forEach((select) => {
        select.disabled = !hasTemplate;
      });
    }

    function refreshPrompt() {
      promptInput.value = composePrompt(selection);
      if (status) status.textContent = '';
    }

    function open() {
      refreshPrompt();
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      closeButton?.focus();
    }

    function close() {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      openButton.focus();
    }

    function handleSelectionChange() {
      selection.templateId = templateSelect.value;
      selection.scene = sceneSelect.value;
      selection.lighting = lightingSelect.value;
      selection.subject = subjectSelect.value;
      selection.composition = compositionSelect.value;
      renderControls();
      refreshPrompt();
    }

    async function copyPrompt() {
      copyButton.disabled = true;
      try {
        await copyText(promptInput.value);
        if (status) status.textContent = '已复制，可直接粘贴到生图网站';
        copyButton.textContent = '已复制';
      } catch (error) {
        if (status) status.textContent = `复制失败：${error.message}`;
        copyButton.textContent = '复制失败';
      } finally {
        global.setTimeout(() => {
          copyButton.disabled = false;
          copyButton.textContent = '复制提示词';
        }, 1600);
      }
    }

    renderControls();
    refreshPrompt();
    openButton.addEventListener('click', open);
    closeButton?.addEventListener('click', close);
    templateSelect.addEventListener('change', handleSelectionChange);
    sceneSelect.addEventListener('change', handleSelectionChange);
    lightingSelect.addEventListener('change', handleSelectionChange);
    subjectSelect.addEventListener('change', handleSelectionChange);
    compositionSelect.addEventListener('change', handleSelectionChange);
    copyButton.addEventListener('click', copyPrompt);
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      close();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });

    return { selection, open, close, refreshPrompt, copyPrompt };
  }

  return { mountCoverModal };
}));
