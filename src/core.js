(function (root) {
  'use strict';
  const currencies = { USD: 2, EUR: 2, GBP: 2, CNY: 2, JPY: 0 };
  const clone = value => JSON.parse(JSON.stringify(value));
  function decimal(value, places = 4) {
    const s = String(value ?? '').trim();
    if (!/^\d+(\.\d+)?$/.test(s)) throw new Error('请输入非负数字');
    const [whole, fraction = ''] = s.split('.');
    if (fraction.length > places) throw new Error(`最多保留 ${places} 位小数`);
    return BigInt(whole) * 10n ** BigInt(places) + BigInt(fraction.padEnd(places, '0'));
  }
  function rounded(value, divisor) { return (value + divisor / 2n) / divisor; }
  function moneyRaw(units, places = 2) {
    const p = BigInt(units); const base = 10n ** BigInt(places);
    return `${p / base}${places ? '.' + String(p % base).padStart(places, '0') : ''}`;
  }
  function money(units, currency = 'USD') {
    const places = currencies[currency] ?? 2;
    const [a, b] = moneyRaw(units, places).split('.');
    return `${currency} ${a.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${b ? '.' + b : ''}`;
  }
  function calc(order) {
    const places = currencies[order.currency] ?? 2;
    let subtotal = 0n, quantity = 0n, cartons = 0n, netGrams = 0n, grossGrams = 0n, volume = 0n, packingValid = true;
    const rows = order.items.map(item => {
      const qty = decimal(item.qty, 0);
      const amount = rounded(decimal(item.price, 4) * qty, 10n ** BigInt(4 - places));
      subtotal += amount; quantity += qty;
      let per, packs, net, gross, cbm;
      try {
        per = decimal(item.perCarton, 0);
        const weight = decimal(item.netKg, 3), tare = decimal(item.tareKg, 3);
        const dims = ['lengthCm', 'widthCm', 'heightCm'].map(k => decimal(item[k], 2));
        if (per <= 0n || weight <= 0n || dims.some(d => d <= 0n)) throw Error();
        packs = (qty + per - 1n) / per;
        net = weight * qty; gross = net + tare * packs; cbm = dims[0] * dims[1] * dims[2] * packs;
        cartons += packs; netGrams += net; grossGrams += gross; volume += cbm;
      } catch {
        packingValid = false;
        return { ...clone(item), amount: String(amount), cartons: '—', netKgTotal: '—', grossKgTotal: '—', cbm: '—', partial: false, packingValid: false };
      }
      return { ...clone(item), amount: String(amount), cartons: String(packs), netKgTotal: moneyRaw(net, 3), grossKgTotal: moneyRaw(gross, 3), cbm: moneyRaw(rounded(cbm, 1000000000n), 3), cbmExact: moneyRaw(rounded(cbm, 1000000n), 6), partial: per > 0n && qty % per !== 0n, lastCarton: per > 0n ? String(qty % per || per) : '0' };
    });
    const freight = decimal(order.freight || '0', places), insurance = decimal(order.insurance || '0', places);
    const result = { rows, subtotal: String(subtotal), freight: String(freight), insurance: String(insurance), total: String(subtotal + freight + insurance), quantity: String(quantity), cartons: packingValid ? String(cartons) : '—', netKg: packingValid ? moneyRaw(netGrams, 3) : '—', grossKg: packingValid ? moneyRaw(grossGrams, 3) : '—', cbm: packingValid ? moneyRaw(rounded(volume, 1000000000n), 3) : '—', cbmExact: packingValid ? moneyRaw(rounded(volume, 1000000n), 6) : '—', places, packingValid };
    if (order.packingMode === 'actual') {
      const actual = root.DocPacking.analyze(order);
      for (const k of ['cartons', 'netKg', 'grossKg', 'cbm', 'cbmExact']) result[k] = actual[k];
      result.packingValid = actual.valid; result.actualPacking = actual;
    }
    return result;
  }
  function validate(order, mode = 'all') {
    const errors = [], warnings = [];
    const required = (value, label, field) => { if (!String(value || '').trim()) errors.push({ label: `${label}未填写`, field }); };
    required(order.number, '订单编号', 'number'); required(order.date, '开单日期', 'date');
    required(order.seller?.name, '卖方名称', 'seller.name'); required(order.seller?.address, '卖方地址', 'seller.address');
    required(order.buyer?.name, '买方名称', 'buyer.name'); required(order.buyer?.address, '买方地址', 'buyer.address');
    if (!Object.hasOwn(currencies, order.currency)) errors.push({ label: '币种不受支持', field: 'currency' });
    if (order.validUntil && order.date && order.validUntil < order.date) errors.push({ label: '有效期不能早于开单日期', field: 'validUntil' });
    if (!order.items.length) errors.push({ label: '至少添加一个产品', field: 'items' });
    const check = (v, places, label, field, positive = false, limit = 1000000000n) => {
      try { const n = decimal(v, places); if ((positive && n <= 0n) || n > limit * 10n ** BigInt(places)) throw Error(); }
      catch { errors.push({ label, field }); }
    };
    order.items.forEach((x, i) => {
      const p = `第 ${i + 1} 行：`, field = `items.${i}`;
      required(x.name, p + '产品名称', field + '.name'); required(x.sku, p + '型号', field + '.sku');
      check(x.qty, 0, p + '数量须为正整数', field + '.qty', true, 10000000n);
      check(x.price, 4, p + '单价须为非负数，最多 4 位小数', field + '.price', false, 1000000n);
      if (String(x.price).trim() !== '' && Number(x.price) === 0) warnings.push({ label: p + '单价为 0，请确认', field: field + '.price' });
      if ((mode === 'all' || mode === 'packing') && order.packingMode !== 'actual') {
        check(x.perCarton, 0, p + '每箱件数须为正整数', field + '.perCarton', true, 10000000n);
        check(x.netKg, 3, p + '单件净重须大于 0，最多 3 位小数', field + '.netKg', true, 100000n);
        check(x.tareKg, 3, p + '纸箱皮重须为非负数', field + '.tareKg', false, 100000n);
        ['lengthCm', 'widthCm', 'heightCm'].forEach(k => check(x[k], 2, p + '外箱尺寸须大于 0，最多 2 位小数', field + '.' + k, true, 10000n));
        const qty = Number(x.qty), per = Number(x.perCarton);
        if (Number.isSafeInteger(qty) && qty > 0 && Number.isSafeInteger(per) && per > 0 && qty % per) warnings.push({ label: `${p}尾箱 ${qty % per} 件，按相同外箱尺寸计体积`, field: field + '.perCarton' });
      }
    });
    if ((mode === 'all' || mode === 'packing') && order.packingMode === 'actual') errors.push(...root.DocPacking.analyze(order).errors);
    check(order.freight || '0', currencies[order.currency] ?? 2, '运费格式不正确', 'freight');
    check(order.insurance || '0', currencies[order.currency] ?? 2, '保险费格式不正确', 'insurance');
    if (!order.payment?.trim()) warnings.push({ label: '付款方式未填写', field: 'payment' });
    if (!order.incoterm?.trim() || !order.port?.trim()) warnings.push({ label: '建议同时填写贸易术语与指定地点', field: 'port' });
    return { errors, warnings };
  }
  function safeCalc(order) {
    try { return calc(order); } catch { return null; }
  }
  function parseCSV(text, delimiter = ',') {
    const rows = []; let row = [], cell = '', quoted = false;
    text = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c; }
      else if (c === '"' && cell === '') quoted = true;
      else if (c === delimiter) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); if (row.some(x => x.trim())) rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (quoted) throw Error('CSV 引号未闭合');
    row.push(cell); if (row.some(x => x.trim())) rows.push(row);
    return rows;
  }
  function escapeCSV(value) { let s = String(value ?? ''); if (/^[=+@\-]/.test(s)) s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s; }
  const api = { currencies, clone, decimal, rounded, moneyRaw, money, calc, safeCalc, validate, parseCSV, escapeCSV };
  root.DocCore = api; if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
