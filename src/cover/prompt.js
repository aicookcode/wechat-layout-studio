(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./content'));
  } else {
    global.LayoutStudioCoverPrompt = factory(global.LayoutStudioCoverContent);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function ({ NEGATIVE_PROMPT, TEMPLATES, OPTIONS }) {
  const DEFAULT_SELECTION = Object.freeze({
    templateId: '',
    scene: '',
    lighting: '',
    subject: '',
    composition: '',
  });

  function getTemplate(templateId) {
    return TEMPLATES.find((template) => template.id === templateId) || null;
  }

  function composePrompt(selection = {}) {
    const template = getTemplate(selection.templateId);
    if (!template) return '';
    const values = {
      scene: selection.scene || '[场景]',
      lighting: selection.lighting || '[时间和光线]',
      subject: selection.subject || '[主体]',
      composition: selection.composition || '[构图]',
    };
    return `${template.text
      .replaceAll('[场景]', values.scene)
      .replaceAll('[时间和光线]', values.lighting)
      .replaceAll('[主体]', values.subject)
      .replaceAll('[构图]', values.composition)}\n\n${NEGATIVE_PROMPT}`;
  }

  function getDefaultSelection() {
    return { ...DEFAULT_SELECTION };
  }

  return {
    DEFAULT_SELECTION,
    NEGATIVE_PROMPT,
    TEMPLATES,
    OPTIONS,
    composePrompt,
    getDefaultSelection,
    getTemplate,
  };
}));
