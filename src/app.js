(function (global) {
  if (typeof module !== 'undefined' && module.exports) {
    const markdown = require('./markdown/render');
    const title = require('./markdown/title');
    module.exports = {
      ...markdown,
      ...title,
      createApp: require('./ui/app').createApp,
    };
    return;
  }

  global.LayoutStudioApp.mountApp(document);
}(typeof globalThis !== 'undefined' ? globalThis : this));
