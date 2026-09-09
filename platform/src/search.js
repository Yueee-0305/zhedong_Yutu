/* Shared browser/server retrieval. Plain script in browser, CommonJS in Node. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AtlasSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const normalize = value => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const ignored = new Set(['什么','如何','介绍','请问','资料','历史','关于','一下','哪些','这个','遗址','为什么','的历史']);
  function search(records, query, limit = 5) {
    const q = normalize(query);
    if (!q) return [];
    const explicit = records.filter(r => q.includes(normalize(r['遗址名称'])) || q.includes(normalize(r['遗产ID'])));
    const terms = new Set(q.split(/[\s，。？?,、：:]+/).filter(t => t.length > 1 && !ignored.has(t)));
    const chunks = q.match(/[\u3400-\u9fff]+/g) || [];
    for (const c of chunks) for (let i = 0; i < c.length - 1; i++) {
      const term = c.slice(i, i + 2);
      if (!ignored.has(term)) terms.add(term);
    }
    return records.map(record => {
      if (explicit.length && !explicit.includes(record)) return { record, score: 0 };
      const name = normalize(record['遗址名称']);
      const short = normalize([name, record['区县'], record['遗产二级类型'],record['地级行政区']].join(' '));
      const body = normalize([record['遗址概况'], record['历史沿革']].join(' '));
      let score = explicit.includes(record) ? 100 : 0;
      if (name.includes(q)) score += 50;
      for (const term of terms) {
        if (short.includes(term)) score += term.length > 2 ? 12 : 4;
        if (body.includes(term)) score += term.length > 2 ? 4 : 1;
      }
      return { record, score };
    }).filter(x => x.score > 0).sort((a,b) => b.score - a.score).slice(0, limit);
  }
  function evidence(record, maxLength = 1600) {
    const parts = ['遗址概况', '历史沿革'].filter(k => record[k]);
    return {
      id: record['遗产ID'], name: record['遗址名称'],
      fields: parts, status: record['数据审核状态'] || '待复核',
      source: '01_遗产主表', row: record['原表行号'],
      text: parts.map(k => `${k}：${record[k]}`).join('\n').slice(0, maxLength)
    };
  }
  return { search, evidence };
});
