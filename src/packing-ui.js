'use strict';
let packingDraft = null;
function renderPacking() {
  const o=db.current, actual=o.packingMode==='actual';
  $('#view').innerHTML=`<div class="page-wrap">${heading('每一箱，和订单对得上',`订单 ${esc(o.number)} · ${esc(o.buyer.name)} · 箱号、混装和外箱尺寸统一核对。`,btn('导入工厂装箱表','pack-import')+btn('新增装箱组','pack-add',true,'plus'),'PACKING RECONCILIATION')}
  <div class="packing-modebar"><div><strong>${actual?'正在使用实际装箱数据':'当前按产品参数估算装箱'}</strong><span>${actual?'装箱记录独立保存；修改订单数量后，重新核对差额。':'先生成整箱和尾箱，再按工厂实际装箱修改尺寸、重量和箱内产品。'}</span></div><div class="button-row">${btn(actual?'重建装箱记录':'从当前参数生成箱号','pack-generate',false,'box')}${actual?btn('改用参数估算','pack-simple'):''}</div></div>
  <div id="packMetrics" class="metrics"></div><div class="pack-layout"><div><section class="card"><div class="card-head"><div class="card-title">实际装箱记录 <span id="packGroupCount" class="micro"></span></div><button class="text-link" data-act="pack-table-export">导出工厂核对表 ↗</button></div><div class="table-wrap"><table class="pack-table"><thead><tr><th>箱号 / 箱数</th><th>每箱产品与件数</th><th>每箱净 / 毛重 kg</th><th>每箱外尺寸 cm</th><th>体积 m³</th><th></th></tr></thead><tbody id="packRows"></tbody></table></div><div class="section-note">箱号范围内为相同包装；混装箱的箱数、重量和体积只统计一次。</div></section><section class="card pack-guide"><strong>工厂表格可以直接粘贴</strong><p>同一箱号下，每个型号占一行；填每箱件数、每箱重量和外尺寸。订单数量与装箱数量分别保留，工具负责核对。</p><button class="text-link" data-act="pack-import">查看格式并导入 →</button></section></div>
  <aside class="pack-audit card"><div class="card-head"><div class="card-title">订单 ↔ 实装</div><span class="micro">逐个型号核对</span></div><div id="packAudit"></div><div class="pack-audit-actions">${btn('查看装箱单','pack-preview',false,'file')}${btn('导出装箱单 PDF','pack-export',true,'download')}</div></aside></div></div>`;
  refreshPacking();
}
function refreshPacking(){
  const o=db.current,p=DocPacking.analyze(o),actual=o.packingMode==='actual';
  $('#packGroupCount').textContent=`${(o.packages||[]).length} 组`;
  $('#packMetrics').innerHTML=[['订单件数',o.items.reduce((n,x)=>n+(Number(x.qty)||0),0),'来自订单明细'],['已装 / 箱数',`${p.packedQuantity} / ${p.cartons}`,'件 / 箱 · 同箱只计一次'],['实际毛重',`${p.grossKg} kg`,'来自逐箱重量'],['实际体积',`${p.cbmExact} m³`,'来自每组外箱尺寸']].map(([a,b,c])=>`<div class="metric"><div class="metric-label">${a}</div><div class="metric-value" style="font-size:24px">${esc(b)}</div><div class="metric-note">${c}</div></div>`).join('');
  $('#packRows').innerHTML=(o.packages||[]).map((g,i)=>{
    const r=p.packages.find(x=>x.start===g.start&&x.end===g.end),count=Number(g.end)-Number(g.start)+1;
    return `<tr><td><strong class="box-number">${esc(g.start===g.end?g.start:g.start+'–'+g.end)}</strong><small>${count} 箱${g.contents?.length>1?' · 混装':''}</small></td><td>${(g.contents||[]).map(c=>{const x=o.items.find(x=>x.id===c.itemId);return `<div class="pack-content-line"><strong>${esc(x?.sku||'产品已移除')}</strong><span>× ${esc(c.perBox)} 件</span></div>`;}).join('')}</td><td>${esc(g.netKg)} / ${esc(g.grossKg)}</td><td>${esc([g.lengthCm,g.widthCm,g.heightCm].join(' × '))}</td><td>${r?.cbmExact||'—'}</td><td><div class="button-row"><button class="text-link" data-act="pack-edit" data-id="${i}">编辑</button><button class="icon-btn" data-act="pack-remove" data-id="${i}" aria-label="移除装箱第${i+1}组">${icon('close')}</button></div></td></tr>`;
  }).join('')||'<tr><td colspan="6" class="empty">还没有实际装箱记录<br>从当前参数生成，或直接导入工厂装箱表。</td></tr>';
  const mismatch=p.audit.filter(x=>x.status!=='matched');
  $('#packAudit').innerHTML=`<div class="audit-banner ${actual&&p.valid?'ok':'issue'}"><strong>${actual&&p.valid?'数量全部一致，可出箱单':!actual?'尚未启用实际装箱':(mismatch.length?`${mismatch.length} 个型号存在差额`:'装箱数据有异常')}</strong><span>${actual&&p.valid?'每个型号的装箱合计均等于订单数量。':'查看下方差额，调整装箱记录或返回订单修改数量。'}</span></div><div class="audit-list">${p.audit.map(x=>`<div class="audit-item ${x.status}"><strong>${esc(x.sku)}<span>${x.status==='matched'?'已核对':x.status==='over'?'多装 '+x.delta:'少装 '+String(-Number(x.delta))}</span></strong><div><span>订单 ${x.expected} 件</span><span>已装 ${x.actual} 件</span></div><small>${esc(x.name)}</small></div>`).join('')}</div>${p.errors.filter(x=>!x.label.includes('：订单 ')).length?`<div class="pack-errors">${p.errors.filter(x=>!x.label.includes('：订单 ')).slice(0,5).map(x=>`<p>${esc(x.label)}</p>`).join('')}</div>`:''}`;
}
function packEditor(index){
  const groups=db.current.packages||[],next=Math.max(0,...groups.map(x=>Number(x.end)||0))+1;
  packingDraft={index:index===undefined?-1:Number(index),group:index===undefined?{start:String(next),end:String(next),netKg:'',grossKg:'',lengthCm:'',widthCm:'',heightCm:'',contents:[{itemId:db.current.items[0]?.id||'',perBox:''}]}:C.clone(groups[Number(index)])};
  modal(index===undefined?'新增装箱组':'编辑装箱组','一个箱号范围表示多只相同的箱子；同箱的多个型号分别填每箱件数。',`<form id="packForm"><div class="form-grid">${[['起始箱号','start'],['结束箱号','end'],['每箱净重 kg','netKg'],['每箱毛重 kg','grossKg'],['箱长 cm','lengthCm'],['箱宽 cm','widthCm'],['箱高 cm','heightCm']].map(([n,k])=>`<div class="field"><label for="pg-${k}">${n}</label><input id="pg-${k}" name="${k}" value="${esc(packingDraft.group[k])}" inputmode="decimal"></div>`).join('')}</div><div class="pack-content-editor-head"><strong>每一箱内的产品</strong><button class="text-link" data-act="pack-content-add">＋ 添加一个型号</button></div><div id="packContentEditor"></div><div class="form-error" id="packFormError" role="alert"></div></form>`,btn('取消','close')+btn('保存并核对','pack-save',true,'check'));
  renderPackContentEditor();
}
function readPackDraft(){
  packingDraft.group={...packingDraft.group,...Object.fromEntries(new FormData($('#packForm'))),contents:$$('.pack-edit-content').map(r=>({itemId:$('select',r).value,perBox:$('input',r).value}))};
}
function renderPackContentEditor(){
  $('#packContentEditor').innerHTML=packingDraft.group.contents.map((x,i)=>`<div class="pack-edit-content"><select aria-label="箱内第${i+1}个型号">${db.current.items.map(item=>`<option value="${esc(item.id)}" ${x.itemId===item.id?'selected':''}>${esc(item.sku)} · ${esc(item.nameZh||item.name)}</option>`).join('')}</select><input aria-label="箱内第${i+1}个型号每箱件数" value="${esc(x.perBox)}" placeholder="每箱件数" inputmode="numeric"><button class="icon-btn" data-act="pack-content-remove" data-id="${i}" aria-label="移除箱内第${i+1}个型号">${icon('close')}</button></div>`).join('');
}
function savePackGroup(){
  readPackDraft();const groups=C.clone(db.current.packages||[]);
  if(packingDraft.index<0)groups.push(packingDraft.group);else groups[packingDraft.index]=packingDraft.group;
  const p=DocPacking.analyze({...db.current,packages:groups}), structural=p.errors.filter(x=>!x.label.includes('：订单 '));
  if(structural.length){$('#packFormError').textContent=structural[0].label;return;}
  if(db.current.packages?.length && JSON.stringify(db.current.packages)!==JSON.stringify(groups))snapshot('调整装箱记录前自动保存');
  db.current.packages=groups;db.current.packingMode='actual';persist();$('#modal').close();renderPacking();toast(p.valid?'装箱记录已保存，数量全部一致':'记录已保存，请继续核对装箱差额');
}
function packImportModal(){
  modal('导入工厂装箱表','从 Excel / WPS 复制带表头的表格，或粘贴 CSV。',`<div class="help-content"><p>列名：${DocPacking.columns.join('、')}。</p><p>同一箱号范围的多个型号分别占一行，重量和尺寸填相同值。导入后替换当前装箱记录，并保留替换前的历史版本。</p></div><textarea id="packPaste" aria-label="粘贴工厂装箱表" spellcheck="false" style="min-height:200px;font:11px/1.7 monospace" placeholder="粘贴表头与明细"></textarea><div id="packImportError" class="form-error" role="alert"></div>`,btn('下载模板','pack-template')+btn('导入并核对','pack-import-save',true));
}
const packCsv = rows => '\uFEFF'+rows.map(r=>r.map(C.escapeCSV).join(',')).join('\r\n')+'\r\n';
function exportPackTables(){
  if(db.current.packingMode!=='actual')return toast('请先建立实际装箱记录',true);
  const p=DocPacking.analyze(db.current),files={},encoded=s=>new TextEncoder().encode(s);
  const rows=[DocPacking.columns];
  (db.current.packages||[]).forEach(g=>(g.contents||[]).forEach(c=>rows.push([g.start,g.end,db.current.items.find(x=>x.id===c.itemId)?.sku||'',c.perBox,g.netKg,g.grossKg,g.lengthCm,g.widthCm,g.heightCm])));
  files['装箱明细-可重新导入.csv']=encoded(packCsv(rows));
  files['逐箱汇总.csv']=encoded(packCsv([['箱号起','箱号止','箱数','净重合计kg','毛重合计kg','体积合计m3'],...p.packages.map(g=>[g.start,g.end,g.count,g.netKgTotal,g.grossKgTotal,g.cbmExact]),['合计','',p.cartons,p.netKg,p.grossKg,p.cbmExact]]));
  files['订单数量核对.csv']=encoded(packCsv([['型号','产品','订单件数','实装件数','实装减订单','核对结果'],...p.audit.map(x=>[x.sku,x.name,x.expected,x.actual,x.delta,x.status==='matched'?'一致':x.status==='over'?'多装':'少装'])]));
  download(new Blob([fflate.zipSync(files,{level:6})],{type:'application/zip'}),fileName(db.current.number)+'-工厂装箱核对表.zip');toast('三张 CSV 已打包，可用 Excel / WPS 继续编辑');
}
document.addEventListener('click',async event=>{
  const b=event.target.closest('[data-act]');if(!b||!b.dataset.act.startsWith('pack-'))return;event.preventDefault();if(exportBusy)return;
  const id=b.dataset.id;
  switch(b.dataset.act){
    case 'pack-generate': {
      if(db.current.packages?.length){modal('重建装箱记录','将用产品参数重新生成；当前实际装箱先存入历史版本。','<div class="help-content"><p>已调整的混装、尾箱重量和尺寸会被重新生成的记录替代。</p></div>',btn('保留当前记录','close')+btn('保存旧版并重建','pack-generate-confirm',true));break;}
      generatePacking();break;
    }
    case 'pack-generate-confirm':generatePacking();break;
    case 'pack-simple':snapshot('改用参数估算前保存实际装箱');db.current.packingMode='simple';persist();renderPacking();toast('已改用参数估算，实际装箱记录仍保留');break;
    case 'pack-add':if(!db.current.items.length)return toast('请先在订单中添加产品',true);packEditor();break;
    case 'pack-edit':packEditor(Number(id));break;
    case 'pack-remove':snapshot('移除装箱组前自动保存');db.current.packages.splice(Number(id),1);persist();refreshPacking();break;
    case 'pack-content-add':readPackDraft();if(packingDraft.group.contents.length>=10)return toast('每组最多 10 个型号',true);packingDraft.group.contents.push({itemId:db.current.items[0]?.id||'',perBox:''});renderPackContentEditor();break;
    case 'pack-content-remove':readPackDraft();packingDraft.group.contents.splice(Number(id),1);renderPackContentEditor();break;
    case 'pack-save':savePackGroup();break;
    case 'pack-import':packImportModal();break;
    case 'pack-template': {
      const sku=db.current.items[0]?.sku||'YOUR-SKU';download(new Blob([packCsv([DocPacking.columns,['1','2',sku,'12','4.320','5.320','40','30','28']])],{type:'text/csv;charset=utf-8'}),'工厂装箱导入模板.csv');break;
    }
    case 'pack-import-save': {
      try{const text=$('#packPaste').value;if(text.length>2000000)throw Error('表格超过 2 MB');const groups=DocPacking.parseRows(C.parseCSV(text,text.split(/\r?\n/)[0].includes('\t')?'\t':','),db.current);snapshot('替换实际装箱前自动保存');db.current.packages=groups;db.current.packingMode='actual';persist();$('#modal').close();renderPacking();toast('工厂装箱已导入，请检查右侧数量差额');}catch(e){$('#packImportError').textContent=e.message;}break;
    }
    case 'pack-table-export':exportPackTables();break;
    case 'pack-preview':db.activeDoc='packing';persist();location.hash='order';route();break;
    case 'pack-export':if(db.current.packingMode!=='actual')return toast('请先建立实际装箱记录',true);await exportPDF('packing');break;
  }
});
function generatePacking(){
  try{const groups=DocPacking.fromSimple(db.current);snapshot('生成实际装箱前自动保存');db.current.packages=groups;db.current.packingMode='actual';persist();if($('#modal').open)$('#modal').close();renderPacking();toast('整箱与尾箱已分组，按工厂实装调整后核对');}catch(e){toast('无法生成：请补全产品数量、重量和包装参数。'+e.message,true);}
}
