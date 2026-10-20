'use strict';
const C = DocCore, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEY = 'trade-docs-workbench-v1';
const esc = value => String(value ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
const uid = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
const icons = { order: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>', products: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/>', customers: '<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 17c0-4 6-4 6 0M15 10h3M15 14h3"/>', history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>', plus: '<path d="M12 5v14M5 12h14"/>', download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>', check: '<path d="m5 12 4 4L19 6"/>', arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>', edit: '<path d="m16 3 5 5L8 21H3v-5L16 3ZM13 6l5 5"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>', box: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9"/>', search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>', save: '<path d="M4 3h14l3 3v15H3V3h1ZM7 3v6h10V3M7 21v-8h10v8"/>', file: '<path d="M14 2H4v20h16V8l-6-6ZM14 2v6h6M8 12h8M8 16h8"/>', spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>', chevron: '<path d="m6 9 6 6 6-6"/>', shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>' };
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.file}</svg>`;
const themes = { teal: ['#087e78', '青绿'], navy: ['#254d72', '经典蓝'], charcoal: ['#414b55', '石板灰'], coral: ['#bb6254', '珊瑚红'], forest: ['#32634c', '森林绿'], violet: ['#715292', '紫罗兰'], black: ['#29353a', '深邃黑'], gold: ['#95733c', '金棕'], rose: ['#995c73', '玫瑰灰'] };
const docTypes = ['quote', 'pi', 'contract', 'ci', 'packing'];
const docNames = { quote: '报价单', pi: '形式发票', contract: '销售合同', ci: '商业发票', packing: '装箱单' };
const docTitles = { quote: 'QUOTATION', pi: 'PROFORMA INVOICE', contract: 'SALES CONTRACT', ci: 'COMMERCIAL INVOICE', packing: 'PACKING LIST' };
const prefixes = { quote: 'QT', pi: 'PI', contract: 'CT', ci: 'CI', packing: 'PL' };
function art(kind) {
  const designs = {
    lamp: '<path d="M42 42h36v34H42z" fill="#d2ded9"/><rect x="45" y="45" width="30" height="27" rx="4" fill="#fbf6d9"/><path d="M36 47h-6v43h60V47h-6M60 90v9M43 101h34" fill="none" stroke="#4c6761" stroke-width="5"/><path d="M47 42V30h26v12" fill="none" stroke="#577069" stroke-width="4"/>',
    bottle: '<path d="M48 22h24v13H48z" fill="#688c7c"/><path d="M45 34h30v10l7 10v47c0 8-44 8-44 0V54l7-10V34Z" fill="#9dbbae"/><path d="M44 60h32v38H44z" fill="#d6e6de"/><path d="M45 48h30" stroke="#749f8c" stroke-width="3"/>',
    bag: '<path d="M33 48h54l6 55H27l6-55Z" fill="#c3a47f"/><path d="M47 53V33c0-19 26-19 26 0v20" fill="none" stroke="#746e58" stroke-width="5"/><path d="M41 70h38M41 80h24" stroke="#e4d1b6" stroke-width="3"/>',
    mug: '<path d="M36 45h42v49c0 13-42 13-42 0V45Z" fill="#9ab4c4"/><path d="M78 50h9c18 0 18 31-9 31" fill="none" stroke="#6d8da0" stroke-width="7"/><path d="M45 22v12m14-17v17m12-12v12" stroke="#c4d3d8" stroke-width="3" stroke-linecap="round"/>'
  };
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="16" fill="#eff4f2"/>${designs[kind] || designs.bag}</svg>`);
}
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const plusDays = days => { const d = new Date(today() + 'T12:00:00'); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function seed() {
  const products = [
    { id: 'p-led', sku: 'WL-108', name: 'Portable LED Work Light', nameZh: '便携式 LED 工作灯', price: '8.50', qty: '240', unit: 'PCS', perCarton: '24', netKg: '0.36', tareKg: '1.00', lengthCm: '40', widthCm: '30', heightCm: '28', image: art('lamp') },
    { id: 'p-bottle', sku: 'VB-600', name: 'Vacuum Bottle · 600 ml', nameZh: '不锈钢保温杯 · 600 ml', price: '12.80', qty: '120', unit: 'PCS', perCarton: '12', netKg: '0.72', tareKg: '0.80', lengthCm: '44', widthCm: '32', heightCm: '36', image: art('bottle') },
    { id: 'p-bag', sku: 'TB-002', name: 'Canvas Tote Bag', nameZh: '帆布手提袋', price: '2.65', qty: '500', unit: 'PCS', perCarton: '100', netKg: '0.18', tareKg: '0.60', lengthCm: '55', widthCm: '40', heightCm: '35', image: art('bag') },
    { id: 'p-mug', sku: 'MG-350', name: 'Ceramic Mug · 350 ml', nameZh: '陶瓷马克杯 · 350 ml', price: '3.20', qty: '300', unit: 'PCS', perCarton: '24', netKg: '0.32', tareKg: '1.20', lengthCm: '48', widthCm: '36', heightCm: '38', image: art('mug') }
  ];
  const customer = { id: 'c-atlas', name: 'Atlas Imports Ltd.', address: 'London, United Kingdom', contact: 'Purchasing Department', email: '', country: 'United Kingdom' };
  return { schema: 1, products, customers: [customer], history: [], current: { id: uid(), number: today().replaceAll('-', '') + '-001', date: today(), validUntil: plusDays(30), currency: 'USD', incoterm: 'FOB', port: 'Shanghai', destination: 'London, United Kingdom', payment: '30% deposit, 70% before shipment.', delivery: '30 days after deposit confirmation.', freight: '0', insurance: '0', status: 'draft', seller: { name: 'Your Company Ltd.', address: 'Shanghai, China', contact: 'Sales Department', email: '', logo: '' }, buyer: C.clone(customer), bank: '', notes: '', shippingMark: 'ATLAS / LONDON / C/NO.', contractTerms: 'Quality and specifications: As described in the product details.\nPacking: Standard export cartons.\nOther agreed terms:', language: 'en', theme: 'teal', showImages: true, items: C.clone(products.slice(0, 2)) }, activeDoc: 'quote' };
}
function loadDB() {
  try { const text = localStorage.getItem(KEY); if (!text) return seed(); const value = JSON.parse(text); assertBackup(value); return value; }
  catch (e) { window.setTimeout(() => toast('本地资料无法读取，已打开新工作区。可从备份恢复。', true), 200); return seed(); }
}
function assertBackup(x) {
  if (x?.schema !== 1 || !x.current || !Array.isArray(x.current.items) || !Array.isArray(x.products) || !Array.isArray(x.customers) || !Array.isArray(x.history)) throw Error('文件结构不正确');
  if (x.products.length > 5000 || x.customers.length > 5000 || x.history.length > 500 || x.current.items.length > 500) throw Error('数据量超出当前版本上限');
  const checkOrder = o => {
    if (!o || typeof o.number !== 'string' || !o.seller || !o.buyer || !Array.isArray(o.items)) throw Error('订单结构不正确');
    if (!Object.hasOwn(C.currencies, o.currency) || !Object.hasOwn(themes, o.theme) || !['en', 'zh', 'bi'].includes(o.language)) throw Error('订单配置不正确');
    if (o.packages !== undefined && (!Array.isArray(o.packages) || o.packages.length > 500)) throw Error('实际装箱结构不正确');
    for (const item of o.items) if (!item || typeof item.name !== 'string' || typeof item.sku !== 'string') throw Error('产品结构不正确');
  };
  checkOrder(x.current); for (const h of x.history) checkOrder(h.order);
  for (const p of x.products) if (!p || typeof p.id !== 'string' || typeof p.name !== 'string' || typeof p.sku !== 'string') throw Error('产品库结构不正确');
  for (const c of x.customers) if (!c || typeof c.id !== 'string' || typeof c.name !== 'string') throw Error('客户库结构不正确');
}
let db = loadDB(), view = 'order', previewTimer, search = '', imageTarget = null, exportBusy = false;
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); $('#saveState').innerHTML = '<i></i> 已保存到本机'; return true; }
  catch { $('#saveState').textContent = '保存失败 · 请立即备份'; toast('本机存储空间不足，请先导出备份。', true); return false; }
}
function toast(text, error = false) { const x = document.createElement('div'); x.className = 'toast' + (error ? ' error' : ''); x.textContent = text; $('#toasts').append(x); setTimeout(() => x.remove(), 4200); }
function modal(title, description, content, foot = '') {
  $('#modalBody').innerHTML = `<div class="modal-head"><div><h2>${esc(title)}</h2><p>${esc(description)}</p></div><button class="icon-btn" data-act="close" aria-label="关闭">${icon('close')}</button></div><div class="modal-content">${content}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}`;
  if (!$('#modal').open) $('#modal').showModal();
}
const btn = (text, act, primary = false, ico = '', extra = '') => `<button class="btn${primary ? ' primary' : ''}" data-act="${act}" ${extra}>${ico ? icon(ico) : ''}${text}</button>`;
function field(label, path, value, type = 'text', extra = '', help = '') { return `<div class="field"><label for="f-${path}">${label}</label><input id="f-${path}" data-field="${path}" value="${esc(value)}" type="${type}" ${extra}>${help ? `<div class="field-help">${help}</div>` : ''}</div>`; }
function selectField(label, path, value, options) { return `<div class="field"><label for="f-${path}">${label}</label><select id="f-${path}" data-field="${path}">${options.map(([v, n]) => `<option value="${v}" ${value === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>`; }
function route() {
  view = ['order', 'packing', 'products', 'customers', 'history'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'order'; search = '';
  $('#nav').innerHTML = ['order', 'packing', 'products', 'customers', 'history'].map((x, i) => `<a href="#${x}" class="${view === x ? 'active' : ''}">${icon(x === 'packing' ? 'box' : x)}${['订单工作台', '装箱核对', '产品库', '客户库', '历史版本'][i]}</a>`).join('');
  $('#pageCrumb').textContent = { order: '订单工作台', packing: '装箱核对', products: '产品库', customers: '客户库', history: '历史版本' }[view];
  render();
}
function render() {
  if (view === 'order') renderOrder(); else if (view === 'packing') renderPacking(); else if (view === 'products') renderProducts(); else if (view === 'customers') renderCustomers(); else renderHistory();
}
function heading(title, sub, actions, eyebrow) { return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p></div><div class="button-row">${actions}</div></div>`; }
function renderOrder() {
  const o = db.current;
  $('#view').innerHTML = `<div class="page-wrap">${heading('一份数据，五套单据', '订单与实际装箱分别记录，改数量后先核对，再出箱单。', btn('新建订单', 'new-order', false, 'plus') + btn('保存版本', 'snapshot', false, 'save') + btn('导出整套 PDF', 'export-all', true, 'download'), 'DOCUMENT WORKSPACE')}
  <div class="metrics" id="metrics"></div><div class="workspace-grid"><div class="editor-column">
    <div class="pack-entry"><div><strong>混装、尾箱，按实际包装出单</strong><span>箱号与订单数量逐项核对；混装箱只统计一次重量和体积。</span></div><a href="#packing">打开装箱核对 →</a></div><div id="validation"></div><section class="card"><div class="card-head"><div class="card-title"><span class="step-dot">01</span> 订单信息</div><select class="status-select" data-field="status" aria-label="订单状态"><option value="draft" ${o.status === 'draft' ? 'selected' : ''}>草稿</option><option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>已确认</option></select></div><div class="card-body"><div class="form-grid">
    ${field('订单编号', 'number', o.number, 'text', 'maxlength="50"')}${field('开单日期', 'date', o.date, 'date')}${selectField('结算币种', 'currency', o.currency, Object.keys(C.currencies).map(x => [x, { USD: 'USD · 美元', EUR: 'EUR · 欧元', GBP: 'GBP · 英镑', CNY: 'CNY · 人民币', JPY: 'JPY · 日元' }[x]]))}${field('报价有效至', 'validUntil', o.validUntil, 'date')}
    ${selectField('贸易术语', 'incoterm', o.incoterm, ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DPU', 'DDP'].map(x => [x, x]))}${field('指定港口 / 地点', 'port', o.port, 'text', 'maxlength="120"')}
    </div><div class="field-help" style="margin-top:11px">币种切换只更改单据币种；产品单价由你确认。</div></div></section>
    <section class="card" id="buyerCard"><div class="card-head"><div class="card-title"><span class="step-dot">03</span> 买方信息</div><button class="text-link" data-act="pick-customer">从客户库选择 ↗</button></div><div class="card-body"><div class="form-grid">
    ${field('公司名称', 'buyer.name', o.buyer.name, 'text', 'maxlength="160"')}${field('联系人 / 部门', 'buyer.contact', o.buyer.contact, 'text', 'maxlength="100"')}<div class="field wide"><label for="f-buyer.address">公司地址</label><input id="f-buyer.address" data-field="buyer.address" value="${esc(o.buyer.address)}" maxlength="400"></div>${field('邮箱', 'buyer.email', o.buyer.email, 'email', 'maxlength="160"')}${field('目的地', 'destination', o.destination, 'text', 'maxlength="160"')}
    </div></div><div class="section-note">${icon('check')} 卖方、买方及订单信息同步到全部单据 <button class="text-link" data-act="seller" style="margin-left:auto">设置卖方资料</button></div></section>
    <section class="card" id="itemsCard"><div class="card-head"><div class="card-title"><span class="step-dot">02</span> 产品明细 <span class="micro" id="itemCount">${o.items.length} 项</span></div><div class="button-row"><button class="text-link" data-act="csv-import">导入 CSV</button><button class="text-link" data-act="pick-product">＋ 从产品库添加</button></div></div><div class="table-wrap"><table class="items-table"><thead><tr><th>产品 / 型号</th><th class="right">数量</th><th class="right">单价</th><th class="right">金额 · ${esc(o.currency)}</th><th></th></tr></thead><tbody id="itemRows"></tbody></table></div><div class="items-total"><span>金额按每行四舍五入后汇总</span><strong id="itemsTotal"></strong></div></section>
    <section class="card"><details><summary>付款、交期与附加费用 <span class="micro">单据共用</span></summary><div class="card-body"><div class="form-grid">${field('付款方式', 'payment', o.payment, 'text', 'maxlength="1000"')}${field('交货时间', 'delivery', o.delivery, 'text', 'maxlength="1000"')}${field('运费 · ' + o.currency, 'freight', o.freight, 'text', 'inputmode="decimal"')}${field('保险费 · ' + o.currency, 'insurance', o.insurance, 'text', 'inputmode="decimal"')}<div class="field wide"><label for="f-bank">收款账户信息</label><textarea id="f-bank" data-field="bank" maxlength="3000">${esc(o.bank)}</textarea></div></div></div></details></section>
    <section class="card"><details><summary>唛头、备注与合同条款</summary><div class="card-body"><div class="form-grid"><div class="field wide"><label for="f-shippingMark">唛头 / Shipping marks</label><textarea id="f-shippingMark" data-field="shippingMark" maxlength="1500">${esc(o.shippingMark)}</textarea></div><div class="field wide"><label for="f-notes">通用备注</label><textarea id="f-notes" data-field="notes" maxlength="3000">${esc(o.notes)}</textarea></div><div class="field wide"><label for="f-contractTerms">合同条款</label><textarea id="f-contractTerms" data-field="contractTerms" maxlength="10000" style="min-height:150px">${esc(o.contractTerms)}</textarea></div></div></div></details></section>
  </div><section class="preview-card"><div class="preview-header"><div class="card-title">单据预览</div><div class="live-pill">实时同步</div></div><div class="doc-tabs">${docTypes.map(x => `<button class="doc-tab ${db.activeDoc === x ? 'active' : ''}" data-act="doc" data-id="${x}">${docNames[x]}</button>`).join('')}</div><div class="preview-controls"><select data-field="language" aria-label="单据语言"><option value="en" ${o.language === 'en' ? 'selected' : ''}>English</option><option value="zh" ${o.language === 'zh' ? 'selected' : ''}>简体中文</option><option value="bi" ${o.language === 'bi' ? 'selected' : ''}>中英双语</option></select><div class="swatches">${Object.entries(themes).map(([k, v]) => `<button class="swatch ${o.theme === k ? 'selected' : ''}" style="background:${v[0]}" title="${v[1]}" aria-label="${v[1]}配色" data-act="theme" data-id="${k}"></button>`).join('')}</div><label class="check-label"><input type="checkbox" data-field="showImages" ${o.showImages ? 'checked' : ''}> 产品图片</label></div><div class="preview-viewport"><div class="preview-scaled"><div class="preview-papers" id="preview"></div></div></div><div class="preview-footer"><span id="pageCount">A4 · 1 页</span><button class="text-link" data-act="export-one">导出当前 PDF ↗</button></div></section></div></div>`;
  document.querySelector('#buyerCard').before(document.querySelector('#itemsCard')); renderItems(); refreshOrder();
}
function renderItems() {
  const t = C.safeCalc(db.current); if (document.querySelector('#itemCount')) document.querySelector('#itemCount').textContent = db.current.items.length + ' 项';
  $('#itemRows').innerHTML = db.current.items.map((x, i) => `<tr><td><div class="product-cell"><img class="product-thumb" src="${safeImage(x.image)}" alt=""><span class="product-name">${esc(x.nameZh || x.name)}<small class="product-sku">${esc(x.sku)} · ${esc(x.unit || 'PCS')}</small><button class="text-link" data-act="packing-toggle" data-id="${i}" style="display:block;font-size:9px;margin-top:3px">装箱参数 ⌄</button></span></div></td><td class="right"><input aria-label="第${i + 1}行数量" class="cell-input" data-field="items.${i}.qty" value="${esc(x.qty)}" inputmode="numeric"></td><td class="right"><input aria-label="第${i + 1}行单价" class="cell-input price" data-field="items.${i}.price" value="${esc(x.price)}" inputmode="decimal"></td><td class="amount-cell" id="line-total-${i}">${t ? C.moneyRaw(t.rows[i].amount, t.places) : '—'}</td><td><button class="icon-btn" title="移除产品" aria-label="移除第${i + 1}行产品" data-act="remove-item" data-id="${i}">${icon('close')}</button></td></tr><tr class="packing-detail" id="packing-${i}"><td colspan="5"><div class="packing-form">${[['每箱件数', 'perCarton'], ['单件净重 kg', 'netKg'], ['每箱皮重 kg', 'tareKg'], ['箱长 cm', 'lengthCm'], ['箱宽 cm', 'widthCm'], ['箱高 cm', 'heightCm']].map(([n, k]) => `<div><label for="pack-${i}-${k}">${n}</label><input id="pack-${i}-${k}" data-field="items.${i}.${k}" value="${esc(x[k])}" inputmode="decimal"></div>`).join('')}</div><div class="packing-result" id="packing-result-${i}"></div></td></tr>`).join('') || '<tr><td colspan="5" class="empty" style="padding:28px">从产品库添加产品，或导入 CSV。</td></tr>';
}
function safeImage(src) { return /^data:image\/(png|jpeg|webp|svg\+xml)[;,]/.test(src || '') ? esc(src) : art('bag'); }
function refreshOrder() {
  if (view !== 'order') return;
  const o = db.current, t = C.safeCalc(o), v = C.validate(o), f = (n, fallback = '—') => t ? t[n] : fallback;
  $('#metrics').innerHTML = `<div class="metric"><div class="metric-label">${icon('file')} 订单金额</div><div class="metric-value">${t ? esc(C.money(t.total, o.currency)) : '—'}</div><div class="metric-note">报价 · PI · 合同 · 商业发票共用</div><span class="metric-pill">数据联动</span></div><div class="metric"><div class="metric-label">${icon('box')} 合计数量 / 箱数</div><div class="metric-value">${f('quantity')}<span class="unit">件 / ${f('cartons')} 箱</span></div><div class="metric-note">${o.packingMode === 'actual' ? '实际装箱 · 与订单逐项核对' : '产品参数估算 · 可切换实际装箱'}</div></div><div class="metric"><div class="metric-label">${icon('products')} 净重 / 毛重</div><div class="metric-value" style="font-size:22px">${t ? (t.packingValid ? Number(t.netKg).toFixed(2) : '—') : '—'}<span class="unit">/ ${t ? (t.packingValid ? Number(t.grossKg).toFixed(2) : '—') : '—'} kg</span></div><div class="metric-note">净重 ＋ 全部外箱皮重</div></div><div class="metric"><div class="metric-label">${icon('box')} 总体积</div><div class="metric-value">${f('cbm')}<span class="unit">m³</span></div><div class="metric-note">按外箱尺寸 × 箱数计算</div></div>`;
  $('#validation').innerHTML = `<div class="validation-strip ${v.errors.length ? 'error' : ''}"><strong>${v.errors.length ? `${v.errors.length} 项待处理，出单前请检查` : v.warnings.length ? `关键数据已就绪 · ${v.warnings.length} 项提醒` : '关键数据已就绪，五套单据保持一致'}</strong><button data-act="validate">${v.errors.length || v.warnings.length ? '查看详情' : '出单检查'} ↗</button></div>`;
  $('#itemsTotal').textContent = t ? C.money(t.total, o.currency) : '—';
  o.items.forEach((x, i) => { const row = t?.rows[i]; if ($('#line-total-' + i)) $('#line-total-' + i).textContent = row ? C.moneyRaw(row.amount, t.places) : '—'; if ($('#packing-result-' + i)) $('#packing-result-' + i).textContent = row ? `${row.cartons} 箱 · 净重 ${row.netKgTotal} kg · 毛重 ${row.grossKgTotal} kg · ${row.cbm} m³${row.partial ? ` · 尾箱 ${row.lastCarton} 件` : ''}` : '请补全装箱参数'; });
  $$('[data-field]').forEach(el => el.setAttribute('aria-invalid', v.errors.some(e => e.field === el.dataset.field) ? 'true' : 'false'));
  clearTimeout(previewTimer); previewTimer = setTimeout(refreshPreview, 120);
}
function setPath(path, value) {
  const keys = path.split('.'); let target = db.current;
  for (const key of keys.slice(0, -1)) target = target[key];
  target[keys.at(-1)] = value;
  persist(); refreshOrder();
}
function label(en, zh, order) { return order.language === 'zh' ? zh : order.language === 'bi' ? `${en} / ${zh}` : en; }
function itemName(item, order) { return order.language === 'zh' ? item.nameZh || item.name : order.language === 'bi' && item.nameZh ? `${item.name}\n${item.nameZh}` : item.name; }
function makeHeader(type, o, continuation) {
  const ref = `${prefixes[type]}-${o.number}`;
  return `<div class="paper-head"><div class="paper-company">${o.seller.logo ? `<img class="paper-logo" src="${safeImage(o.seller.logo)}" alt="">` : ''}<div>${esc(o.seller.name || 'Your Company Ltd.')}<small>${label('TRADE DOCUMENTS', '外贸业务单据', o)}</small></div></div><div class="paper-title">${esc(o.language === 'zh' ? docNames[type] : docTitles[type])}${o.language === 'bi' ? `<small>${docNames[type]}</small>` : ''}</div></div><div class="paper-meta"><div><span>${label('DOCUMENT NO.', '单据编号', o)}</span>${esc(ref)}</div><div><span>${label('DATE', '日期', o)}</span>${esc(o.date)}</div><div><span>${label(type === 'quote' ? 'VALID UNTIL' : 'ORDER REF.', type === 'quote' ? '报价有效至' : '关联订单', o)}</span>${esc(type === 'quote' ? o.validUntil || '—' : o.number)}</div></div>${continuation ? `<div class="paper-continuation">${label('Continued', '续页', o)}</div>` : `<div class="paper-parties">${[['seller', 'SELLER / EXPORTER', '卖方 / 出口方'], ['buyer', 'BUYER / CONSIGNEE', '买方 / 收货方']].map(([k, en, zh]) => `<div><div class="party-label">${esc(label(en, zh, o))}</div><div class="party-name">${esc(o[k].name)}</div><div class="party-body">${esc([o[k].address, o[k].contact, o[k].email].filter(Boolean).join('\n'))}</div></div>`).join('')}</div><div class="paper-meta"><div><span>${label('TRADE TERMS', '贸易术语', o)}</span>${esc(o.incoterm + ' ' + o.port)}</div><div><span>${label('DESTINATION', '目的地', o)}</span>${esc(o.destination || '—')}</div><div><span>${label('CURRENCY', '币种', o)}</span>${esc(o.currency)}</div></div>`}`;
}
function buildDocument(type, o) {
  const stage = $('#exportStage'); stage.replaceChildren();
  const t = C.safeCalc(o), actualPacking = type === 'packing' && o.packingMode === 'actual'; const pages = []; let page, content, table, tbody;
  function newPage(continuation = false) {
    page = document.createElement('article'); page.className = 'paper'; page.style.setProperty('--doc-accent', (themes[o.theme] || themes.teal)[0]);
    content = document.createElement('div'); content.className = 'paper-content'; content.innerHTML = makeHeader(type, o, continuation); page.append(content); stage.append(page); pages.push(page); return page;
  }
  function overflow() { return content.scrollHeight > 987; }
  function addBlock(html) {
    const block = document.createElement('div'); block.innerHTML = html; content.append(block);
    if (overflow()) { block.remove(); newPage(true); content.append(block); }
    return block;
  }
  function newTable() {
    table = document.createElement('table'); table.className = 'doc-table';
    table.innerHTML = type === 'packing' ? `<colgroup><col style="width:31%"><col style="width:9%"><col style="width:9%"><col style="width:11%"><col style="width:12%"><col style="width:12%"><col style="width:16%"></colgroup><thead><tr>${[[actualPacking ? 'BOX NO. / CONTENTS' : 'DESCRIPTION', actualPacking ? '箱号 / 箱内产品' : '产品'], ['QTY', '件数'], ['CTNS', '箱数'], ['N.W. KG', '净重 kg'], ['G.W. KG', '毛重 kg'], ['CBM', '体积 m³'], ['CARTON CM', '外箱 cm']].map(([a, b]) => `<th>${esc(label(a, b, o))}</th>`).join('')}</tr></thead><tbody></tbody>` : `<colgroup><col style="width:7%"><col style="width:45%"><col style="width:12%"><col style="width:17%"><col style="width:19%"></colgroup><thead><tr>${[['NO.', '序号'], ['PRODUCT DESCRIPTION', '产品明细'], ['QTY / PCS', '数量 / 件'], ['UNIT PRICE', '单价'], ['AMOUNT', '金额']].map(([a, b], i) => `<th class="${i > 1 ? 'right' : ''}">${esc(label(a, b, o))}</th>`).join('')}</tr></thead><tbody></tbody>`;
    content.append(table); tbody = $('tbody', table);
  }
  newPage(); newTable();
  const rows = actualPacking ? (t?.actualPacking?.packages || []).flatMap(g => g.contents.map((x,j) => ({...x, qty: x.packedQty, boxLabel: g.start === g.end ? g.start : g.start + '–' + g.end, perBox: x.perBox, cartons: j ? '—' : g.count, netKgTotal: j ? '—' : g.netKgTotal, grossKgTotal: j ? '—' : g.grossKgTotal, cbmExact: j ? '—' : g.cbmExact, lengthCm: g.lengthCm, widthCm: g.widthCm, heightCm: g.heightCm}))) : t?.rows || o.items.map(x => ({ ...x, amount: '0', cartons: '—', netKgTotal: '—', grossKgTotal: '—', cbm: '—' }));
  rows.forEach((r, i) => {
    const tr = document.createElement('tr'), name = esc(itemName(r, o)).replaceAll('\n', '<br>');
    const desc = `<div class="doc-item">${o.showImages && type !== 'packing' ? `<img src="${safeImage(r.image)}" alt="">` : ''}<div>${actualPacking ? `<small>${label('BOX', '箱号', o)} ${esc(r.boxLabel)} · ${esc(r.perBox)} ${label('PCS / BOX', '件 / 箱', o)}</small>` : ''}<strong>${name}</strong><small>${esc(r.sku)}</small></div></div>`;
    tr.innerHTML = type === 'packing' ? `<td>${desc}</td><td>${esc(r.qty)}</td><td>${esc(r.cartons)}</td><td>${esc(r.netKgTotal)}</td><td>${esc(r.grossKgTotal)}</td><td>${esc(r.cbmExact || r.cbm)}</td><td>${esc([r.lengthCm, r.widthCm, r.heightCm].join(' × '))}</td>` : `<td>${String(i + 1).padStart(2, '0')}</td><td>${desc}</td><td class="right">${esc(r.qty)}</td><td class="right">${esc(r.price)}</td><td class="right">${t ? C.moneyRaw(r.amount, t.places) : '—'}</td>`;
    tbody.append(tr);
    if (overflow() && tbody.children.length > 1) { tr.remove(); newPage(true); newTable(); tbody.append(tr); }
  });
  if (!rows.length) { const tr = document.createElement('tr'); tr.innerHTML = `<td colspan="7" style="height:75px;color:#a3afb3">${label('Add products to begin', '添加产品后生成明细', o)}</td>`; tbody.append(tr); }
  if (type === 'packing') {
    if (actualPacking) addBlock(`<p class="doc-actual-note">${esc(label('Weights, volume and carton count are listed once per carton group. Quantities are totals for the numbered carton range.', '重量、体积和箱数每组只计一次；件数为该箱号范围内的合计。', o))}</p>`);
    addBlock(`<div class="doc-packing-summary">${[['TOTAL CARTONS', '合计箱数', t?.cartons, ''], ['NET WEIGHT', '净重', t?.netKg, ' kg'], ['GROSS WEIGHT', '毛重', t?.grossKg, ' kg'], ['TOTAL VOLUME', '总体积', t?.cbmExact, ' m³']].map(([en, zh, val, unit]) => `<div><span>${esc(label(en, zh, o))}</span><strong>${esc(val || '—')}${unit}</strong></div>`).join('')}</div>`);
    addSections('SHIPPING MARKS', '唛头', o.shippingMark);
    const partials = rows.filter(r => r.partial).map(r => `${r.sku}: ${label('Last carton', '尾箱', o)} ${r.lastCarton} PCS`).join('\n');
    if (partials) addSections('PACKING DETAILS', '装箱明细', partials);
  } else {
    addBlock(`<div class="doc-summary"><div class="doc-summary-grid"><span>${label('Subtotal', '产品合计', o)}</span><span>${t ? C.money(t.subtotal, o.currency) : '—'}</span>${t && t.freight !== '0' ? `<span>${label('Freight', '运费', o)}</span><span>${C.money(t.freight, o.currency)}</span>` : ''}${t && t.insurance !== '0' ? `<span>${label('Insurance', '保险费', o)}</span><span>${C.money(t.insurance, o.currency)}</span>` : ''}<strong class="total-label">${label('TOTAL AMOUNT', '总金额', o)}</strong><strong>${t ? C.money(t.total, o.currency) : '—'}</strong></div></div>`);
    addSections('PAYMENT TERMS', '付款方式', o.payment); addSections('DELIVERY', '交货时间', o.delivery);
    if (['pi', 'ci', 'contract'].includes(type)) addSections('BANK DETAILS', '收款信息', o.bank);
  }
  if (type === 'contract') { addSections('TERMS & CONDITIONS', '合同条款', o.contractTerms); addBlock(`<div class="doc-signatures"><div class="signature-line">${label('For the Seller', '卖方签章', o)}</div><div class="signature-line">${label('For the Buyer', '买方签章', o)}</div></div>`); }
  addSections('NOTES', '备注', o.notes);
  function addSections(en, zh, text) {
    if (!String(text || '').trim()) return;
    const parts = String(text).match(/[\s\S]{1,420}/g) || [];
    parts.forEach((s, i) => addBlock(`<section class="doc-section"><h4>${esc(label(en, zh, o))}${i ? ' · ' + label('CONTINUED', '续', o) : ''}</h4><p>${esc(s)}</p></section>`));
  }
  pages.forEach((p, i) => { const footer = document.createElement('div'); footer.className = 'paper-footer'; footer.innerHTML = `<span>${esc(o.number)} · ${esc(o.seller.name)}</span><span>${label('Page', '第', o)} ${i + 1} / ${pages.length}</span>`; p.append(footer); });
  return pages;
}
function refreshPreview() {
  if (!$('#preview')) return;
  const pages = buildDocument(db.activeDoc || 'quote', db.current);
  $('#preview').replaceChildren(...pages.map(x => x.cloneNode(true)));
  $('#pageCount').textContent = `A4 · ${pages.length} 页 · ${docNames[db.activeDoc]}`;
  $('#exportStage').replaceChildren(); scalePreview();
}
function scalePreview() {
  const preview = $('#preview'); if (!preview) return;
  const viewport = $('.preview-viewport'), width = Math.min(794, viewport.clientWidth - (window.innerWidth < 650 ? 16 : 32)); const scale = width / 794;
  preview.style.transform = `scale(${scale})`; $('.preview-scaled').style.width = width + 'px'; $('.preview-scaled').style.height = (preview.children.length * 1141 * scale) + 'px';
  if (window.innerWidth <= 1000) { preview.style.position = 'absolute'; $('.preview-scaled').style.setProperty('height', preview.children.length * 1141 * scale + 'px', 'important'); }
}
function snapshot(reason = '手动保存', order = db.current) {
  const data = C.clone(order), latest = db.history.find(h => h.order.id === order.id);
  if (latest && JSON.stringify(latest.order) === JSON.stringify(data)) return latest;
  const revision = db.history.filter(h => h.order.id === order.id).reduce((m, h) => Math.max(m, h.revision), 0) + 1;
  const entry = { id: uid(), savedAt: new Date().toISOString(), revision, reason, order: data }; db.history.unshift(entry);
  persist(); return entry;
}
async function rasterizePaper(paper) {
  const css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\n'); } catch { return ''; } }).join('\n');
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true'); frame.style.cssText = 'position:fixed;left:-25000px;top:0;width:794px;height:1123px;border:0;pointer-events:none';
  try {
    const loaded = new Promise((resolve, reject) => { frame.onload = resolve; frame.onerror = () => reject(Error('PDF 页面初始化失败')); });
    frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>${css}\nhtml,body{margin:0!important;padding:0!important;width:794px!important;height:1123px!important;overflow:hidden!important;background:#fff!important}.paper{position:relative!important;margin:0!important;left:0!important;top:0!important;transform:none!important}.paper-content{max-height:none!important;overflow:visible!important}</style></head><body>${paper.outerHTML}</body></html>`;
    document.body.append(frame); await loaded;
    const doc = frame.contentDocument; await doc.fonts.ready;
    await Promise.all([...doc.images].map(im => im.decode()));
    return await html2canvas(doc.querySelector('.paper'), { scale: 2, width: 794, height: 1123, windowWidth: 794, windowHeight: 1123, scrollX: 0, scrollY: 0, backgroundColor: '#ffffff', logging: false, useCORS: false, imageTimeout: 5000 });
  } finally { frame.remove(); }
}
async function exportPDF(type) {
  if (exportBusy) return; const all = type === 'all';
  const v = C.validate(db.current, all || type === 'packing' ? 'all' : 'quote');
  if (v.errors.length) { showValidation(v); return; }
  exportBusy = true; const snapshotOrder = C.clone(db.current), original = db.activeDoc;
  $$('[data-act="export-all"],[data-act="export-one"]').forEach(b => { b.disabled = true; });
  modal('正在生成单据', '按同一份订单数据生成，保持金额与明细一致。', '<div class="export-status" id="exportProgress">正在准备 PDF…</div>');
  try {
    const files = {}, types = all ? docTypes : [type];
    await document.fonts.ready;
    for (let n = 0; n < types.length; n++) {
      const docType = types[n]; $('#exportProgress').textContent = `${n + 1} / ${types.length} · ${docNames[docType]}`;
      const pages = buildDocument(docType, snapshotOrder), pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      for (let i = 0; i < pages.length; i++) {
        $('#exportStage').replaceChildren(pages[i]);
        for (const im of $$('img', pages[i])) {
          await im.decode();
          if (im.src.startsWith('data:image/svg+xml')) {
            const bitmap = document.createElement('canvas'); bitmap.width = 360; bitmap.height = 360;
            bitmap.getContext('2d').drawImage(im, 0, 0, 360, 360); im.src = bitmap.toDataURL('image/png'); await im.decode();
          }
        }
        const canvas = await rasterizePaper(pages[i]);
        if (i) pdf.addPage(); pdf.addImage(canvas.toDataURL('image/jpeg', .94), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
      pdf.setProperties({ title: docTitles[docType] + ' ' + snapshotOrder.number, creator: 'Trade Document Workbench' });
      files[`${prefixes[docType]}-${fileName(snapshotOrder.number)}.pdf`] = new Uint8Array(pdf.output('arraybuffer'));
    }
    const entry = snapshot(all ? '导出整套 PDF' : '导出' + docNames[type], snapshotOrder);
    if (all) download(new Blob([fflate.zipSync(files, { level: 0 })], { type: 'application/zip' }), `${fileName(snapshotOrder.number)}-R${String(entry.revision).padStart(2, '0')}-单据.zip`);
    else download(new Blob([Object.values(files)[0]], { type: 'application/pdf' }), Object.keys(files)[0]);
    $('#modal').close(); toast(all ? '五套 PDF 已打包，当前版本已保存' : 'PDF 已导出，当前版本已保存');
  } catch (e) { modal('导出未完成', '订单数据已保留，可以重新生成。', `<div class="check-item error">${esc(e.message || 'PDF 组件无法加载')}</div>`, btn('关闭', 'close')); }
  finally { exportBusy = false; $('#exportStage').replaceChildren(); db.activeDoc = original; $$('[data-act="export-all"],[data-act="export-one"]').forEach(b => b.disabled = false); }
}
function fileName(s) { return String(s).replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 90) || 'order'; }
function download(blob, name) { const a = document.createElement('a'), url = URL.createObjectURL(blob); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000); }
function showValidation(v = C.validate(db.current)) {
  modal('出单检查', `出单检查 ${v.errors.length ? '有异常待处理' : '已通过'}；${v.warnings.length} 项业务提醒。`, `<div class="check-list">${v.errors.map(e => `<div class="check-item error">${esc(e.label)}</div>`).join('')}${v.warnings.map(e => `<div class="check-item">${esc(e.label)}</div>`).join('')}${!v.errors.length ? '<div class="check-item ok">✓ 订单基础信息完整<br>✓ 四种金额单据共用行项目与合计<br>✓ 装箱单按独立包装数据计算，不显示单价与金额</div>' : ''}</div>`, btn('返回订单', 'close', true));
}
function renderProducts() {
  $('#view').innerHTML = `<div class="page-wrap">${heading('产品资料，录入一次', '保存型号、单价与包装参数，下一笔订单直接选用。', btn('下载导入模板', 'csv-template', false, 'download') + btn('导入 CSV', 'csv-import', false, 'download') + btn('新增产品', 'new-product', true, 'plus'), 'PRODUCT LIBRARY')}<div class="filter-bar"><div class="search-box">${icon('search')}<input id="productSearch" placeholder="搜索名称或型号" aria-label="搜索产品"></div><span class="micro">${db.products.length} 个产品</span></div><div class="library-grid" id="productGrid"></div></div>`;
  productCards();
}
function productCards() {
  $('#productGrid').innerHTML = db.products.filter(p => `${p.name} ${p.nameZh} ${p.sku}`.toLowerCase().includes(search.toLowerCase())).map(p => `<article class="product-card"><div class="product-art"><span class="sku-tag">${esc(p.sku)}</span><img src="${safeImage(p.image)}" alt="${esc(p.nameZh || p.name)}"></div><h3>${esc(p.nameZh || p.name)}</h3><p>${esc(p.name)}<br>${esc(p.perCarton)} 件 / 箱 · ${esc(p.lengthCm)} × ${esc(p.widthCm)} × ${esc(p.heightCm)} cm</p><div class="product-card-footer"><span class="product-price">${esc(p.price)} <small class="micro">单价</small></span><div class="button-row">${btn('编辑', 'edit-product', false, '', `data-id="${p.id}"`)}${btn('加入订单', 'add-product', true, 'plus', `data-id="${p.id}"`)}</div></div></article>`).join('') || '<div class="empty">没有匹配的产品</div>';
}
function productForm(id) {
  const p = C.clone(db.products.find(p => p.id === id) || { id: uid(), sku: '', name: '', nameZh: '', price: '0', qty: '1', unit: 'PCS', perCarton: '1', netKg: '0', tareKg: '0', lengthCm: '0', widthCm: '0', heightCm: '0', image: art('bag') });
  modal(id ? '编辑产品资料' : '新增产品', '产品库的修改不会覆盖已录入订单和历史版本。', `<form id="productForm" data-id="${p.id}"><div class="form-grid">${[['型号 / SKU', 'sku'], ['英文产品名称', 'name'], ['中文产品名称', 'nameZh'], ['参考单价', 'price'], ['默认数量 · PCS', 'qty'], ['每箱件数', 'perCarton'], ['单件净重 · kg', 'netKg'], ['每箱皮重 · kg', 'tareKg'], ['外箱长 · cm', 'lengthCm'], ['外箱宽 · cm', 'widthCm'], ['外箱高 · cm', 'heightCm']].map(([label, key]) => `<div class="field"><label for="p-${key}">${label}</label><input name="${key}" id="p-${key}" value="${esc(p[key])}" maxlength="${['name', 'nameZh'].includes(key) ? 180 : 60}" ${['sku', 'name', 'nameZh'].includes(key) ? '' : 'inputmode="decimal"'}></div>`).join('')}<div class="field"><label>产品图片</label><input type="hidden" name="image" id="productImage" value="${esc(p.image)}"><div class="button-row"><img id="productImagePreview" class="product-thumb" src="${safeImage(p.image)}" alt="">${btn('上传图片', 'upload-product')}</div></div></div></form><div id="formError" style="margin-top:15px"></div>`, btn('取消', 'close') + btn('保存产品', 'save-product', true));
}
function saveProduct() {
  const form = $('#productForm'), p = { id: form.dataset.id, unit: 'PCS', ...Object.fromEntries(new FormData(form)) };
  const v = C.validate({ ...seed().current, items: [p] });
  if (v.errors.length) { $('#formError').innerHTML = v.errors.map(e => `<div class="check-item error">${esc(e.label)}</div>`).join(''); return; }
  if (db.products.some(x => x.id !== p.id && x.sku.toLowerCase() === p.sku.toLowerCase())) { $('#formError').textContent = '型号已存在，请使用不同的 SKU。'; return; }
  const index = db.products.findIndex(x => x.id === p.id); if (index >= 0) db.products[index] = p; else db.products.push(p);
  persist(); $('#modal').close(); render(); toast('产品资料已保存');
}
function pickerProducts() {
  modal('从产品库添加', '数量、单价和包装参数会复制到当前订单，之后可以单独调整。', `<div class="check-list">${db.products.map(p => `<label class="picker-row"><input type="checkbox" name="pickProduct" value="${p.id}" ${db.current.items.some(i => i.id === p.id) ? 'disabled' : ''}><span class="product-cell"><img class="product-thumb" src="${safeImage(p.image)}" alt=""><span>${esc(p.nameZh || p.name)}<small class="product-sku">${esc(p.sku)}${db.current.items.some(i => i.id === p.id) ? ' · 已在订单中' : ''}</small></span></span><span class="picker-price">${esc(p.price)}</span></label>`).join('')}</div>`, btn('取消', 'close') + btn('加入订单', 'add-picked', true));
}
function addProduct(id) { const p = db.products.find(x => x.id === id); if (!p) return; if (db.current.items.some(i => i.id === id)) { toast('这个产品已在当前订单中'); return; } db.current.items.push(C.clone(p)); persist(); if (view === 'order') { renderItems(); refreshOrder(); } toast('已加入当前订单'); }
function renderCustomers() {
  $('#view').innerHTML = `<div class="page-wrap">${heading('每次往来，都更从容', '买方信息存入客户库，返单时直接调取。', btn('保存当前买方', 'save-buyer', false, 'save') + btn('新增客户', 'new-customer', true, 'plus'), 'CUSTOMER LIBRARY')}<div class="customer-grid">${db.customers.map(c => `<article class="customer-card"><div class="customer-initial">${esc(c.name.slice(0, 1))}</div><h3>${esc(c.name)}</h3><p>${esc(c.address)}<br>${esc(c.contact || '')}${c.email ? '<br>' + esc(c.email) : ''}</p><div class="button-row">${btn('编辑资料', 'edit-customer', false, '', `data-id="${c.id}"`)}${btn('用于当前订单', 'use-customer', true, '', `data-id="${c.id}"`)}</div></article>`).join('') || '<div class="empty">还没有客户资料</div>'}</div></div>`;
}
function customerForm(id) {
  const c = db.customers.find(x => x.id === id) || { id: uid(), name: '', address: '', contact: '', email: '', country: '' };
  modal(id ? '编辑客户' : '新增客户', '保存常用买方资料，便于下次出单。', `<form id="customerForm" data-id="${c.id}"><div class="form-grid">${[['公司名称', 'name'], ['联系人 / 部门', 'contact'], ['邮箱', 'email'], ['国家 / 地区', 'country']].map(([label, key]) => `<div class="field"><label for="c-${key}">${label}</label><input id="c-${key}" name="${key}" value="${esc(c[key])}" maxlength="160"></div>`).join('')}<div class="field wide"><label for="c-address">公司地址</label><textarea id="c-address" name="address" maxlength="400">${esc(c.address)}</textarea></div></div></form><div id="formError" style="margin-top:15px"></div>`, btn('取消', 'close') + btn('保存客户', 'save-customer', true));
}
function useCustomer(id) { const c = db.customers.find(x => x.id === id); if (!c) return; db.current.buyer = C.clone(c); if (c.country) db.current.destination = c.country; persist(); if ($('#modal').open) $('#modal').close(); if (view === 'order') renderOrder(); toast('买方信息已同步到当前订单'); }
function renderHistory() {
  $('#view').innerHTML = `<div class="page-wrap">${heading('旧单有据，返单有序', '每个版本独立保存；导出 PDF 时自动留下当前版本。', btn('保存当前订单版本', 'snapshot', true, 'save'), 'VERSION HISTORY')}<div class="card"><div class="table-wrap"><table class="history-table"><thead><tr><th>订单 / 版本</th><th>买方</th><th>金额</th><th>保存时间</th><th>来源</th><th>操作</th></tr></thead><tbody>${db.history.map(h => { const t = C.safeCalc(h.order); return `<tr><td><strong>${esc(h.order.number)}</strong> <span class="version">R${String(h.revision).padStart(2, '0')}</span></td><td>${esc(h.order.buyer.name)}</td><td>${t ? esc(C.money(t.total, h.order.currency)) : '未完成'}</td><td class="micro">${new Date(h.savedAt).toLocaleString('zh-CN', { hour12: false })}</td><td><span class="tag">${esc(h.reason)}</span></td><td><div class="button-row"><button class="text-link" data-act="preview-history" data-id="${h.id}">查看</button><button class="text-link" data-act="restore-history" data-id="${h.id}">载入</button><button class="text-link" data-act="copy-history" data-id="${h.id}">返单</button></div></td></tr>`; }).join('')}</tbody></table></div>${!db.history.length ? `<div class="empty">${icon('history')}还没有保存的版本<br>完成订单后，点击“保存版本”或导出 PDF。</div>` : ''}<div class="restore-note">“载入”继续处理同一订单；“返单”复制为新订单。切换前会自动保存当前工作区。</div></div></div>`;
}
function newOrder(from) {
  snapshot('切换前自动保存'); const old = db.current, fresh = seed().current;
  fresh.seller = C.clone(old.seller); fresh.language = old.language; fresh.theme = old.theme; fresh.bank = old.bank;
  fresh.items = from ? C.clone(from.items) : []; if (!from) fresh.buyer = {id: uid(), name: '', address: '', contact: '', email: '', country: ''}; if (from) { fresh.buyer = C.clone(from.buyer); for (const k of ['currency', 'incoterm', 'port', 'destination', 'payment', 'delivery', 'shippingMark', 'contractTerms']) fresh[k] = from[k]; }
  const numbers = [old, ...db.history.map(x => x.order)].map(o => o.number); let n = 1; while (numbers.includes(today().replaceAll('-', '') + '-' + String(n).padStart(3, '0'))) n++;
  fresh.number = today().replaceAll('-', '') + '-' + String(n).padStart(3, '0'); fresh.id = uid(); fresh.status = 'draft'; db.current = fresh; db.activeDoc = 'quote'; persist(); location.hash = 'order'; route(); toast(from ? '已复制为新订单，可调整数量与价格' : '新订单已创建，上一笔已保存');
}
function sellerForm() {
  const s = db.current.seller;
  modal('卖方与品牌资料', '本订单中的五套单据共用这些信息。', `<form id="sellerForm"><div class="form-grid">${[['公司名称', 'name'], ['联系人 / 部门', 'contact'], ['邮箱', 'email']].map(([label, key]) => `<div class="field"><label for="s-${key}">${label}</label><input id="s-${key}" name="${key}" value="${esc(s[key])}" maxlength="160"></div>`).join('')}<div class="field"><label>公司 Logo</label><input type="hidden" name="logo" id="sellerLogo" value="${esc(s.logo)}"><div class="button-row">${s.logo ? `<img id="sellerLogoPreview" class="product-thumb" src="${safeImage(s.logo)}" alt="">` : '<img id="sellerLogoPreview" class="product-thumb" alt="">'}${btn('上传 Logo', 'upload-logo')}</div></div><div class="field wide"><label for="s-address">公司地址</label><textarea name="address" id="s-address" maxlength="400">${esc(s.address)}</textarea></div></div></form>`, btn('取消', 'close') + btn('保存资料', 'save-seller', true));
}
async function imageFile(file, target) {
  if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return toast('请选择 PNG、JPG 或 WebP 图片', true);
  if (file.size > 8 * 1024 * 1024) return toast('图片超过 8 MB，请先缩小图片', true);
  const im = await createImageBitmap(file), scale = Math.min(1, 600 / Math.max(im.width, im.height)), canvas = document.createElement('canvas'); canvas.width = Math.max(1, im.width * scale); canvas.height = Math.max(1, im.height * scale); canvas.getContext('2d').drawImage(im, 0, 0, canvas.width, canvas.height); im.close();
  const data = canvas.toDataURL('image/png'); if (data.length > 900000) return toast('图片较大，请改用更简洁的图片', true);
  $(target === 'product' ? '#productImage' : '#sellerLogo').value = data; $(target === 'product' ? '#productImagePreview' : '#sellerLogoPreview').src = data;
}
const csvHeaders = ['sku', 'name', 'nameZh', 'qty', 'price', 'perCarton', 'netKg', 'tareKg', 'lengthCm', 'widthCm', 'heightCm'];
function csvTemplate() { const p = db.products[0] || seed().products[0]; download(new Blob(['\uFEFF' + csvHeaders.join(',') + '\r\n' + csvHeaders.map(k => C.escapeCSV(p[k])).join(',') + '\r\n'], { type: 'text/csv;charset=utf-8' }), '产品导入模板.csv'); }
async function csvImport(file) {
  if (!file || file.size > 3 * 1024 * 1024) return toast('请选择 3 MB 以内的 CSV 文件', true);
  try {
    const text = await file.text(), firstLine = text.split(/[\r\n]/)[0];
    const rows = C.parseCSV(text, firstLine.includes('\t') ? '\t' : ','), headers = rows.shift()?.map(x => x.trim());
    if (!headers || csvHeaders.some(k => !headers.includes(k))) throw Error('缺少表头，请使用“产品导入模板”。');
    if (rows.length > 500) throw Error('每次最多导入 500 个产品'); if (!rows.length) throw Error('文件中没有产品行');
    const incoming = rows.map((row, i) => {
      const item = { id: uid(), unit: 'PCS', image: art('bag') }; headers.forEach((k, j) => { if (csvHeaders.includes(k)) item[k] = String(row[j] ?? '').trim(); });
      const v = C.validate({ ...seed().current, items: [item] }); if (v.errors.length) throw Error(`CSV 第 ${i + 2} 行：${v.errors[0].label.replace('第 1 行：', '')}`); return item;
    });
    const skus = new Set(); incoming.forEach(p => { const key = p.sku.toLowerCase(); if (skus.has(key)) throw Error('CSV 存在重复型号：' + p.sku); skus.add(key); });
    const existing = incoming.filter(p => db.products.some(x => x.sku.toLowerCase() === p.sku.toLowerCase()));
    if (existing.length) throw Error('以下型号已在产品库中，请编辑已有资料：' + existing.map(x => x.sku).join('、'));
    db.products.push(...incoming); persist(); if (view === 'order') { db.current.items.push(...C.clone(incoming)); persist(); renderOrder(); } else render(); if ($('#csvPaste') && $('#modal').open) $('#modal').close(); toast(`已导入 ${incoming.length} 个产品${view === 'order' ? '并加入订单' : ''}`);
  } catch (e) { toast(e.message, true); }
}
function backupModal() {
  modal('备份与恢复', '备份文件包含当前订单、产品、客户和历史版本。', '<div class="help-content"><p>数据保存在当前浏览器。清理浏览器数据、使用其他浏览器或更换电脑后，需要用备份文件恢复。</p><p>恢复会合并产品、客户和历史版本，并载入备份中的当前订单。工作区原来的订单会先自动保存。</p></div>', btn('从文件恢复', 'restore-backup') + btn('下载完整备份', 'download-backup', true, 'download'));
}
function importModal() {
  modal('导入产品资料', '支持 CSV 文件，或直接粘贴带表头的 CSV / 制表符表格。', '<div class="help-content"><p>表头使用下载模板中的字段：sku、name、nameZh、qty、price、perCarton、netKg、tareKg、lengthCm、widthCm、heightCm。中文名称可留空。</p></div><textarea id="csvPaste" aria-label="粘贴产品表格" spellcheck="false" style="min-height:180px;font:11px/1.7 monospace" placeholder="在这里粘贴含表头的产品资料"></textarea><div class="field-help">同一批次内型号不能重复；导入前会逐行检查数量、单价和包装参数。</div>', btn('下载模板', 'csv-template') + btn('选择 CSV 文件', 'choose-csv') + btn('粘贴导入', 'paste-csv', true));
}
async function importBackup(file) {
  try {
    if (!file || file.size > 25 * 1024 * 1024) throw Error('备份文件超过 25 MB');
    const imported = JSON.parse(await file.text()); assertBackup(imported); snapshot('恢复备份前自动保存');
    for (const key of ['products', 'customers', 'history']) { const map = new Map(db[key].map(x => [x.id, x])); imported[key].forEach(x => { if (!map.has(x.id)) map.set(x.id, x); }); db[key] = [...map.values()]; }
    db.history.sort((a, b) => b.savedAt.localeCompare(a.savedAt)); db.current = C.clone(imported.current); db.activeDoc = docTypes.includes(imported.activeDoc) ? imported.activeDoc : 'quote'; persist(); $('#modal').close(); render(); toast('备份已恢复，原有资料已保留');
  } catch (e) { toast('恢复失败：' + e.message, true); }
}
function helpModal() {
  modal('让单证顺着业务走', '填写一次，生成报价单、形式发票、销售合同、商业发票和装箱单。', '<div class="help-content"><ol><li>先设置卖方资料，再从客户库选择买方。</li><li>从产品库添加产品，修改数量与单价。点击每行“装箱参数”，填写外箱尺寸、每箱件数、净重与纸箱皮重。</li><li>在右侧切换单据、语言和配色。英文、中文和双语使用你录入的产品名称；自由文本保留原文。</li><li>完成“出单检查”。参数估算按每个产品独立成箱；进入“装箱核对”可按箱号记录混装、实测重量和尾箱尺寸，逐个型号检查少装或多装。</li><li>工厂装箱表支持中文表头 CSV / Excel 粘贴；核对表可导出三张 CSV，用 Excel / WPS 编辑。实际装箱不一致时会阻止箱单与整套 PDF 导出。</li><li>“导出整套 PDF”生成包含五个 PDF 的 ZIP，同时保存历史版本。PDF 保留固定排版，文字以图像呈现。</li><li>返单到“历史版本”选择“返单”，会复制为新订单。定期下载完整备份。</li></ol><p>单价最多 4 位小数，金额逐行四舍五入后汇总。日元取整，其余币种保留 2 位金额小数。币种切换不进行汇率换算。</p><p>合同使用你输入的条款。工具提供数据整理、计算和排版；关务申报、合同签署与发送由你完成。</p></div>', btn('开始使用', 'close', true));
}
document.addEventListener('input', event => {
  const e = event.target;
  if (e.dataset.field && e.type !== 'checkbox' && e.tagName !== 'SELECT') setPath(e.dataset.field, e.value);
  if (e.id === 'productSearch') { search = e.value; productCards(); }
});
document.addEventListener('change', event => { const e = event.target; if (e.dataset.field && (e.type === 'checkbox' || e.tagName === 'SELECT' || e.type === 'date')) { setPath(e.dataset.field, e.type === 'checkbox' ? e.checked : e.value); if (e.dataset.field === 'currency') { renderOrder(); } } });
document.addEventListener('click', async event => {
  const b = event.target.closest('[data-act]'); if (!b) return; event.preventDefault(); const act = b.dataset.act, id = b.dataset.id;
  if (exportBusy && act !== 'close') return;
  switch (act) {
    case 'close': if (!exportBusy) $('#modal').close(); break;
    case 'new-order': newOrder(); break;
    case 'snapshot': { const h = snapshot(); if (view === 'history') renderHistory(); toast(`已保存 ${db.current.number} · R${String(h.revision).padStart(2, '0')}`); break; }
    case 'export-all': await exportPDF('all'); break;
    case 'export-one': await exportPDF(db.activeDoc); break;
    case 'validate': showValidation(); break;
    case 'doc': db.activeDoc = id; persist(); $$('.doc-tab').forEach(x => x.classList.toggle('active', x.dataset.id === id)); refreshPreview(); break;
    case 'theme': db.current.theme = id; persist(); $$('.swatch').forEach(x => x.classList.toggle('selected', x.dataset.id === id)); refreshPreview(); break;
    case 'packing-toggle': $('#packing-' + id).classList.toggle('open'); break;
    case 'remove-item': db.current.items.splice(Number(id), 1); persist(); renderItems(); refreshOrder(); break;
    case 'pick-product': pickerProducts(); break;
    case 'add-picked': $$('input[name=pickProduct]:checked').forEach(x => addProduct(x.value)); $('#modal').close(); break;
    case 'add-product': addProduct(id); break;
    case 'new-product': productForm(); break;
    case 'edit-product': productForm(id); break;
    case 'save-product': saveProduct(); break;
    case 'upload-product': imageTarget = 'product'; $('#imageInput').click(); break;
    case 'upload-logo': imageTarget = 'seller'; $('#imageInput').click(); break;
    case 'csv-template': csvTemplate(); break;
    case 'csv-import': importModal(); break;
    case 'choose-csv': $('#csvInput').click(); break;
    case 'paste-csv': { const text = $('#csvPaste').value; if (!text.trim()) return toast('请先粘贴产品资料', true); await csvImport({ size: new TextEncoder().encode(text).length, text: async () => text }); break; }
    case 'new-customer': customerForm(); break;
    case 'edit-customer': customerForm(id); break;
    case 'save-customer': { const form = $('#customerForm'), c = { id: form.dataset.id, ...Object.fromEntries(new FormData(form)) }; if (!c.name.trim() || !c.address.trim()) { $('#formError').textContent = '请填写公司名称和地址。'; break; } const i = db.customers.findIndex(x => x.id === c.id); if (i >= 0) db.customers[i] = c; else db.customers.push(c); persist(); $('#modal').close(); render(); toast('客户资料已保存'); break; }
    case 'save-buyer': { const c = C.clone(db.current.buyer); if (!c.name?.trim() || !c.address?.trim()) return toast('请先补全当前订单的买方名称与地址', true); c.id = uid(); if (db.customers.some(x => x.name.toLowerCase() === c.name.toLowerCase())) return toast('同名客户已在客户库中，可编辑已有资料'); db.customers.push(c); persist(); render(); toast('当前买方已存入客户库'); break; }
    case 'use-customer': useCustomer(id); break;
    case 'pick-customer': modal('选择买方', '选中后同步当前订单的买方信息。', db.customers.map(c => `<div class="picker-row"><div style="flex:1"><strong>${esc(c.name)}</strong><small class="product-sku">${esc(c.address)}</small></div>${btn('使用', 'use-customer', true, '', `data-id="${c.id}"`)}</div>`).join('') || '<div class="empty">请先到客户库新增客户。</div>'); break;
    case 'seller': sellerForm(); break;
    case 'save-seller': { const s = Object.fromEntries(new FormData($('#sellerForm'))); if (!s.name.trim() || !s.address.trim()) return toast('请填写卖方名称和地址', true); db.current.seller = s; persist(); $('#modal').close(); refreshOrder(); toast('卖方信息已同步'); break; }
    case 'restore-history': { const h = db.history.find(x => x.id === id); if (h) { snapshot('载入旧版本前自动保存'); db.current = C.clone(h.order); persist(); location.hash = 'order'; route(); toast('已载入 R' + String(h.revision).padStart(2, '0')); } break; }
    case 'copy-history': { const h = db.history.find(x => x.id === id); if (h) newOrder(h.order); break; }
    case 'preview-history': { const h = db.history.find(x => x.id === id); if (!h) break; modal('订单 ' + h.order.number + ' · R' + String(h.revision).padStart(2, '0'), '此处显示保存时的数据。', '<div id="historyDoc" class="history-preview"></div>', btn('关闭', 'close')); const pages = buildDocument('quote', h.order); $('#historyDoc').replaceChildren(...pages.map(x => x.cloneNode(true))); $('#exportStage').replaceChildren(); break; }
    case 'restore-backup': $('#backupInput').click(); break;
    case 'download-backup': download(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }), '单证工作台-备份-' + today() + '.json'); toast('完整备份已下载'); break;
  }
});
$('#backupBtn').addEventListener('click', backupModal); $('#helpBtn').addEventListener('click', helpModal);
$('#imageInput').addEventListener('change', async e => { try { await imageFile(e.target.files[0], imageTarget); } catch { toast('图片无法读取，请重新选择', true); } e.target.value = ''; });
$('#csvInput').addEventListener('change', async e => { await csvImport(e.target.files[0]); e.target.value = ''; });
$('#backupInput').addEventListener('change', async e => { await importBackup(e.target.files[0]); e.target.value = ''; });
$('#modal').addEventListener('cancel', e => { if (exportBusy) e.preventDefault(); });
window.addEventListener('hashchange', route); window.addEventListener('resize', scalePreview); route();
