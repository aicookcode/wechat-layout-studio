(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    global.LayoutStudioConstants = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const CASE_NOTICE = '说明：文中人物与情节，根据多个现实常见情境综合改写，人物为化名，细节作隐私化处理。';
  const NOTE_PREFIXES = [
    '说明：', '说明:', '提醒：', '提醒:', '注意：', '注意:',
    '提示：', '提示:', '备注：', '备注:', '内容说明：', '内容说明:',
  ];
  const METADATA_PREFIXES = ['封面标题', '封面短句', '摘要', '文章摘要', '文末互动', '文末互动话题', '搜索关联词'];
  const STYLES = [
    { id: 'kongxin-hong', name: '空心红', color: '#E50012', description: '红色双引号、空心编号、红色竖线' },
    { id: 'juhong', name: '橘红', color: '#FF582C', description: '浅灰大编号、橘红标题、细横线' },
    { id: 'hong-yi', name: '红色长轮', color: '#D92E26', description: '金色转轮、编号圆点、金屑标题条' },
  ];

  return Object.freeze({ CASE_NOTICE, NOTE_PREFIXES, METADATA_PREFIXES, STYLES });
}));
