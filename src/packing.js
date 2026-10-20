(function(root) {
  'use strict';
  const copy = x => JSON.parse(JSON.stringify(x));
  function scaled(v, p = 0, positive = false, max = 1000000000n) {
    const s = String(v ?? '').trim();
    if (!/^\d+(\.\d+)?$/.test(s)) throw Error('须为非负数字');
    const [a,b=''] = s.split('.');
    if (b.length > p) throw Error(`最多 ${p} 位小数`);
    const n = BigInt(a) * 10n ** BigInt(p) + BigInt(b.padEnd(p,'0'));
    if ((positive && n <= 0n) || n > max * 10n ** BigInt(p)) throw Error('数值超出范围');
    return n;
  }
  const fmt = (n,p) => { const a=10n**BigInt(p);return `${n/a}${p?'.'+String(n%a).padStart(p,'0'):''}`; };
  const round = (n,d) => (n+d/2n)/d;
  function analyze(order) {
    const errors=[], packages=[], totals=new Map(), ranges=[];
    let count=0n,net=0n,gross=0n,volume=0n;
    const items = new Map(order.items.map(x=>[x.id,x]));
    const groups=Array.isArray(order.packages)?order.packages:[];
    const err=(label,field='packages')=>errors.push({label,field});
    if (!groups.length) err('还没有实际装箱记录');
    if (groups.length>500) err('实际装箱最多 500 组');
    groups.slice(0,500).forEach((g,index)=>{
      const prefix=`装箱第 ${index+1} 组：`;let a,b,n,nw,gw,dims;
      try {
        a=scaled(g.start,0,true,10000000n);b=scaled(g.end,0,true,10000000n);
        if(b<a)throw Error('结束箱号不能小于起始箱号');
        n=b-a+1n;
        for(const old of ranges)if(a<=old.b && b>=old.a)err(prefix+`箱号与第 ${old.index+1} 组重叠`);
        ranges.push({a,b,index});
      }catch(e){err(prefix+'箱号无效，'+e.message);return;}
      try {
        nw=scaled(g.netKg,3,true,100000n);gw=scaled(g.grossKg,3,true,100000n);
        if(gw<nw)throw Error('每箱毛重不能小于每箱净重');
        dims=['lengthCm','widthCm','heightCm'].map(k=>scaled(g[k],2,true,10000n));
      }catch(e){err(prefix+'重量或尺寸无效，'+e.message);return;}
      const contents=Array.isArray(g.contents)?g.contents:[],seen=new Set(),details=[];
      if(!contents.length || contents.length>10)err(prefix+'每组需要 1 至 10 个产品');
      for(const c of contents.slice(0,10)){
        const item=items.get(c.itemId);
        if(!item){err(prefix+'存在不属于本订单的产品，请重新选择');continue;}
        if(seen.has(c.itemId)){err(prefix+`${item.sku} 重复，请合并每箱件数`);continue;}
        seen.add(c.itemId);
        try {
          const per=scaled(c.perBox,0,true,10000000n),qty=per*n;
          totals.set(c.itemId,(totals.get(c.itemId)||0n)+qty);
          details.push({...copy(item),perBox:String(per),packedQty:String(qty)});
        }catch(e){err(prefix+`${item.sku} 每箱件数无效`);}
      }
      const v=dims[0]*dims[1]*dims[2]*n;
      count+=n;net+=nw*n;gross+=gw*n;volume+=v;
      packages.push({...copy(g),count:String(n),contents:details,quantity:String(details.reduce((s,x)=>s+BigInt(x.packedQty),0n)),netKgTotal:fmt(nw*n,3),grossKgTotal:fmt(gw*n,3),cbmExact:fmt(round(v,1000000n),6)});
    });
    const audit=order.items.map(item=>{
      let expected;try{expected=scaled(item.qty,0,true,10000000n);}catch{err(`${item.sku} 订单数量无效`);expected=0n;}
      const actual=totals.get(item.id)||0n,delta=actual-expected;
      if(delta!==0n)err(`${item.sku}：订单 ${expected} 件，已装 ${actual} 件，${delta>0n?'多装 '+delta:'少装 '+(-delta)} 件`);
      return {itemId:item.id,sku:item.sku,name:item.nameZh||item.name,expected:String(expected),actual:String(actual),delta:String(delta),status:delta===0n?'matched':delta>0n?'over':'short'};
    });
    return {valid:errors.length===0,errors,packages,audit,cartons:String(count),netKg:fmt(net,3),grossKg:fmt(gross,3),cbm:fmt(round(volume,1000000000n),3),cbmExact:fmt(round(volume,1000000n),6),packedQuantity:String([...totals.values()].reduce((a,b)=>a+b,0n))};
  }
  function fromSimple(order) {
    const groups=[];let start=1n;
    for(const x of order.items){
      const qty=scaled(x.qty,0,true,10000000n),per=scaled(x.perCarton,0,true,10000000n),net=scaled(x.netKg,3,true),tare=scaled(x.tareKg,3);
      for(const k of ['lengthCm','widthCm','heightCm'])scaled(x[k],2,true,10000n);
      const full=qty/per,tail=qty%per;
      for(const [n,pcs] of [[full,per],[tail?1n:0n,tail]])if(n){
        groups.push({start:String(start),end:String(start+n-1n),netKg:fmt(net*pcs,3),grossKg:fmt(net*pcs+tare,3),lengthCm:x.lengthCm,widthCm:x.widthCm,heightCm:x.heightCm,contents:[{itemId:x.id,perBox:String(pcs)}]});start+=n;
      }
    }
    if(groups.length>500)throw Error('实际装箱最多 500 组');
    return groups;
  }
  const columns=['箱号起','箱号止','型号','每箱件数','每箱净重kg','每箱毛重kg','长cm','宽cm','高cm'];
  function parseRows(rows,order){
    const aliases=[['箱号起','start'],['箱号止','end'],['型号','sku'],['每箱件数','perBox'],['每箱净重kg','netKg'],['每箱毛重kg','grossKg'],['长cm','lengthCm'],['宽cm','widthCm'],['高cm','heightCm']];
    if(!rows.length)throw Error('表格为空');
    const header=rows[0].map(x=>x.trim()),pos=aliases.map(names=>header.findIndex(x=>names.includes(x)));
    if(pos.some(x=>x<0))throw Error('表头不完整，请使用装箱模板');
    if(rows.length>5001)throw Error('导入最多 5000 行');
    const skus=new Map();for(const x of order.items){if(skus.has(x.sku))throw Error('本订单有重复型号，须先使用唯一型号');skus.set(x.sku,x.id);}
    const map=new Map();
    rows.slice(1).forEach((r,i)=>{
      const v=Object.fromEntries(aliases.map((x,j)=>[x[1],String(r[pos[j]]??'').trim()]));
      if(!skus.has(v.sku))throw Error(`第 ${i+2} 行型号 ${v.sku} 不在本订单`);
      const key=v.start+'-'+v.end,physical=['netKg','grossKg','lengthCm','widthCm','heightCm'];let g=map.get(key);
      if(!g){g={start:v.start,end:v.end,...Object.fromEntries(physical.map(k=>[k,v[k]])),contents:[]};map.set(key,g);}
      else if(physical.some(k=>scaled(g[k],k.endsWith('Kg')?3:2)!==scaled(v[k],k.endsWith('Kg')?3:2)))throw Error(`第 ${i+2} 行同组箱号的重量或尺寸不一致`);
      g.contents.push({itemId:skus.get(v.sku),perBox:v.perBox});
    });
    const groups=[...map.values()],result=analyze({...order,packages:groups});
    const structural=result.errors.filter(x=>!x.label.includes('：订单 '));
    if(structural.length)throw Error(structural[0].label);
    return groups;
  }
  const api={analyze,fromSimple,parseRows,columns};root.DocPacking=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
