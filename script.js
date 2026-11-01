
(function(){
'use strict';

var CATS=[
  {id:'food',name:'Food',color:'#F26B21'},
  {id:'transport',name:'Transport',color:'#7A4B2E'},
  {id:'shopping',name:'Shopping',color:'#F5B060'},
  {id:'bills',name:'Bills',color:'#2F8A78'},
  {id:'fun',name:'Fun',color:'#CF4659'},
  {id:'health',name:'Health',color:'#5E86AD'},
  {id:'other',name:'Other',color:'#B9A28C'}
];
var MOODS=[
  {id:'worth',name:'Worth it',color:'#2F8A78'},
  {id:'ok',name:'Okay',color:'#B9A28C'},
  {id:'regret',name:'Regret',color:'#CF4659'}
];
var KW={
  food:['chai','tea','coffee','lunch','dinner','breakfast','swiggy','zomato','pizza','biryani','snack','snacks','grocery','groceries','milk','restaurant','cafe','dosa','juice'],
  transport:['uber','ola','auto','metro','bus','petrol','fuel','cab','train','rapido','parking','toll','flight'],
  shopping:['amazon','flipkart','shirt','shoes','clothes','myntra','shopping','gift','jeans','headphones'],
  bills:['rent','electricity','wifi','wi-fi','internet','recharge','bill','water','gas','emi','subscription','insurance'],
  fun:['movie','netflix','game','concert','party','bar','trip','spotify','cinema','outing'],
  health:['medicine','doctor','pharmacy','gym','hospital','checkup','dentist','medicines']
};
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var DOWL=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
var DOWS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
var KEY='amberLedger.v1';

function $(id){return document.getElementById(id)}
var reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function pad(n){return n<10?'0'+n:''+n}
function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parseYmd(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)}
function diffDays(a,b){return Math.round((Date.UTC(a.getFullYear(),a.getMonth(),a.getDate())-Date.UTC(b.getFullYear(),b.getMonth(),b.getDate()))/864e5)}
function dShort(d){return d.getDate()+' '+MON[d.getMonth()]}
function dLong(d){return DOWS[(d.getDay()+6)%7]+', '+d.getDate()+' '+MON[d.getMonth()]}
var nowD=new Date();
var today=new Date(nowD.getFullYear(),nowD.getMonth(),nowD.getDate());

var nf=new Intl.NumberFormat('en-IN',{maximumFractionDigits:0});
var nf2=new Intl.NumberFormat('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2});
function inr(v){return (v<0?'-':'')+'₹'+nf.format(Math.abs(Math.round(v)))}
function inr2(v){return '₹'+nf2.format(v)}
function short(v){
  if(v>=100000)return (v/100000).toFixed(v%100000===0?0:1)+'L';
  if(v>=1000)return (v/1000).toFixed(v%1000===0?0:1)+'k';
  return ''+Math.round(v);
}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function catOf(id){for(var i=0;i<CATS.length;i++)if(CATS[i].id===id)return CATS[i];return CATS[CATS.length-1]}
function moodOf(id){for(var i=0;i<MOODS.length;i++)if(MOODS[i].id===id)return MOODS[i];return MOODS[1]}

/* ---------- state ---------- */
function defaults(){
  return {expenses:[],budget:25000,cycleDay:15,roundTo:10,jarGoal:1000,jarSince:0,banked:0,palette:'orange',sample:false,nextId:1,
    catLimits:{food:6000,transport:2500,shopping:4000,bills:5000,fun:2500,health:1500,other:1500}};
}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function seed(){
  var rnd=mulberry32(20261101),out=[],id=1;
  var T=[
    ['Chai','food',20,60],['Coffee','food',90,220],['Lunch','food',110,320],['Lunch','food',110,320],['Swiggy dinner','food',240,620],
    ['Groceries','food',280,1250],['Auto','transport',40,160],['Metro','transport',25,70],['Uber','transport',120,460],['Petrol','transport',300,900],
    ['Amazon order','shopping',250,2400],['T-shirt','shopping',499,1599],['Movie night','fun',280,820],['Snooker with friends','fun',200,600],
    ['Pharmacy','health',90,640],['Gym day pass','health',100,250]
  ];
  function push(d,note,cat,amt){
    var r=rnd(),mood=r<.5?'worth':(r<.85?'ok':'regret');
    if(cat==='shopping'||cat==='fun'){mood=r<.3?'worth':(r<.62?'ok':'regret')}
    out.push({id:id++,amt:amt,cat:cat,note:note,date:ymd(d),mood:mood,createdAt:d.getTime()+43200000,s:1});
  }
  for(var i=74;i>=0;i--){
    var d=addDays(today,-i),dom=d.getDate();
    if(dom===5)push(d,'Rent share','bills',9000);
    if(dom===20)push(d,'Wi-Fi bill','bills',799);
    if(dom===25)push(d,'Electricity','bills',1450);
    if(i<=1)continue;
    var dow=d.getDay(),p=(dow===0||dow===6)?0.92:0.74;
    if(rnd()>p)continue;
    var n=1+Math.floor(rnd()*3);
    for(var k=0;k<n;k++){
      var t=T[Math.floor(rnd()*T.length)];
      var amt=Math.round(t[2]+(t[3]-t[2])*rnd());
      push(d,t[0],t[1],amt);
    }
  }
  return out;
}
function load(){
  try{
    var s=localStorage.getItem(KEY);
    if(s){
      var o=JSON.parse(s),d=defaults();
      var st=Object.assign(d,o);
      st.catLimits=Object.assign(defaults().catLimits,o.catLimits||{});
      return st;
    }
  }catch(e){}
  return null;
}
var state=load();
if(!state){
  state=defaults();
  state.expenses=seed();
  state.sample=true;
}
(function(){var m=0;state.expenses.forEach(function(e){if(e.id>m)m=e.id});state.nextId=Math.max(state.nextId||1,m+1)})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}

/* ---------- derived data ---------- */
function roundUp(amt){
  var r=Math.round((amt%state.roundTo)*100)/100;
  return r===0?0:Math.round((state.roundTo-r)*100)/100;
}
function compute(){
  var byDay={},i,e;
  for(i=0;i<state.expenses.length;i++){e=state.expenses[i];byDay[e.date]=(byDay[e.date]||0)+e.amt}
  var sd=Math.min(Math.max(Math.round(+state.cycleDay)||1,1),28);
  var start=new Date(today.getFullYear(),today.getMonth(),sd);
  if(today.getDate()<sd)start=new Date(today.getFullYear(),today.getMonth()-1,sd);
  var next=new Date(start.getFullYear(),start.getMonth()+1,sd);
  var len=diffDays(next,start);
  var elapsed=diffDays(today,start)+1;
  var pstart=new Date(start.getFullYear(),start.getMonth()-1,sd);
  var plen=diffDays(start,pstart);
  var cum=[],pcum=[],days=[],run=0,key;
  for(i=0;i<elapsed;i++){key=ymd(addDays(start,i));days.push(key);run+=byDay[key]||0;cum.push(run)}
  run=0;
  for(i=0;i<plen;i++){run+=byDay[ymd(addDays(pstart,i))]||0;pcum.push(run)}
  var inCycle={};days.forEach(function(k){inCycle[k]=1});
  var catTot={},moodTot={worth:0,ok:0,regret:0},topRegret=null;
  state.expenses.forEach(function(e){
    if(!inCycle[e.date])return;
    catTot[e.cat]=(catTot[e.cat]||0)+e.amt;
    moodTot[e.mood]=(moodTot[e.mood]||0)+e.amt;
    if(e.mood==='regret'&&(!topRegret||e.amt>topRegret.amt))topRegret=e;
  });
  return {byDay:byDay,start:start,end:addDays(next,-1),len:len,elapsed:elapsed,cum:cum,pcum:pcum,days:days,
    spent:cum[cum.length-1]||0,prevSame:pcum[Math.min(elapsed,plen)-1]||0,catTot:catTot,moodTot:moodTot,topRegret:topRegret};
}

/* ---------- helpers: tween, tooltip, toast ---------- */
function setNum(el,to,fmt){
  var from=el._v;if(from==null)from=0;el._v=to;
  if(reduce||from===to){el.textContent=fmt(to);return}
  cancelAnimationFrame(el._raf);
  var t0=performance.now(),dur=850;
  (function step(t){
    var p=Math.min(1,(t-t0)/dur),k=1-Math.pow(1-p,3);
    el.textContent=fmt(from+(to-from)*k);
    if(p<1)el._raf=requestAnimationFrame(step);
  })(t0);
}
var tip=$('tip');
function showTip(text,x,y){
  tip.textContent=text;tip.classList.add('show');
  var w=tip.offsetWidth,h=tip.offsetHeight;
  var left=Math.min(Math.max(8,x+14),window.innerWidth-w-8);
  var top=y-h-14;if(top<8)top=y+20;
  tip.style.left=left+'px';tip.style.top=top+'px';
}
function hideTip(){tip.classList.remove('show')}
document.addEventListener('pointermove',function(e){
  var t=e.target.closest&&e.target.closest('[data-tip]');
  if(t)showTip(t.getAttribute('data-tip'),e.clientX,e.clientY);
  else if(!(e.target.closest&&e.target.closest('.trendHit')))hideTip();
});
document.addEventListener('pointerdown',function(e){
  var t=e.target.closest&&e.target.closest('[data-tip]');
  if(t)showTip(t.getAttribute('data-tip'),e.clientX,e.clientY);
});
function toast(msg,label,fn){
  var el=document.createElement('div');el.className='toast';
  var sp=document.createElement('span');sp.textContent=msg;el.appendChild(sp);
  var timer;
  function close(){clearTimeout(timer);el.classList.add('bye');setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el)},320)}
  if(label){var b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=function(){fn();close()};el.appendChild(b)}
  $('toast').appendChild(el);
  timer=setTimeout(close,label?6000:3200);
}

/* ---------- hero ---------- */
var firstRender=true;
function renderHero(c){
  var budget=+state.budget||0,remaining=budget-c.spent,daysLeft=c.len-c.elapsed+1;
  var safe=Math.max(0,remaining/daysLeft);
  setNum($('safeAmt'),safe,inr);
  $('heroSub').textContent=remaining>=0
    ?inr(remaining)+' left for the next '+daysLeft+(daysLeft===1?' day':' days')+'. Your cycle resets after '+dShort(c.end)+'.'
    :'You are '+inr(-remaining)+' over budget this cycle. It resets after '+dShort(c.end)+'.';
  var paceSpent=budget*c.elapsed/c.len,diff=paceSpent-c.spent;
  $('pacePill').textContent=budget<=0?'Set a budget in settings':(diff>=0?inr(diff)+' under pace':inr(-diff)+' over pace');
  var pct=budget>0?c.spent/budget:0;
  var C=2*Math.PI*76;
  var arc=$('ringArc');
  arc.style.strokeDashoffset=String(C);
  requestAnimationFrame(function(){requestAnimationFrame(function(){arc.style.strokeDashoffset=String(C*(1-Math.min(pct,1)))})});
  $('paceTick').setAttribute('transform','rotate('+(360*Math.min(c.elapsed/c.len,1))+' 100 100)');
  setNum($('ringPct'),pct*100,function(v){return Math.round(v)+'%'});
  setNum($('stSpent'),c.spent,inr);
  setNum($('stAvg'),c.spent/c.elapsed,inr);
  var proj=c.spent/c.elapsed*c.len;
  setNum($('stProj'),proj,inr);
  var delta=c.prevSame>0?(c.spent/c.prevSame-1)*100:null;
  $('stSpentSub').textContent=delta==null?'Spent this cycle':(delta<=0?'▼ ':'▲ ')+Math.abs(Math.round(delta))+'% vs same days last cycle';
  $('stProjSub').textContent=budget>0?(proj<=budget?'Projected, under budget':'Projected, over budget'):'Projected by cycle end';
}

/* ---------- trend ---------- */
function niceStep(x){
  var e=Math.pow(10,Math.floor(Math.log(x)/Math.LN10)),f=x/e;
  var n=f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10;
  return n*e;
}
function renderTrend(c){
  var host=$('trend');
  var W=640,H=250,L=46,R=16,T=18,B=28,iw=W-L-R,ih=H-T-B,N=c.len,E=c.cum.length;
  var budget=+state.budget||0;
  var last=c.cum[E-1]||0;
  var maxV=Math.max(budget,last,c.pcum[c.pcum.length-1]||0,100);
  var step=niceStep(maxV/4),top=step*Math.ceil(maxV/step);
  function X(i){return L+(i/(N-1))*iw}
  function Y(v){return T+ih-(v/top)*ih}
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Cumulative spending this cycle compared with budget pace and last cycle">';
  s+='<defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.38"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:.02"/></linearGradient></defs>';
  for(var k=0;k*step<=top+1e-6;k++){
    var v=k*step;
    s+='<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/>';
    s+='<text class="axl" x="'+(L-8)+'" y="'+(Y(v)+4).toFixed(1)+'" text-anchor="end">'+short(v)+'</text>';
  }
  for(k=0;k<5;k++){
    var i=Math.round(k*(N-1)/4);
    s+='<text class="axl" x="'+X(i).toFixed(1)+'" y="'+(H-6)+'" text-anchor="'+(k===0?'start':(k===4?'end':'middle'))+'">'+dShort(addDays(c.start,i))+'</text>';
  }
  var pts=c.cum.map(function(v,i){return X(i).toFixed(1)+' '+Y(v).toFixed(1)});
  var line='M'+pts.join(' L');
  var area=line+' L'+X(E-1).toFixed(1)+' '+Y(0).toFixed(1)+' L'+X(0).toFixed(1)+' '+Y(0).toFixed(1)+' Z';
  var pp=c.pcum.slice(0,N).map(function(v,i){return X(i).toFixed(1)+' '+Y(v).toFixed(1)});
  s+='<path class="t-area" d="'+area+'" fill="url(#gArea)"/>';
  if(pp.length>1)s+='<path class="t-prev" pathLength="1" d="M'+pp.join(' L')+'"/>';
  if(budget>0)s+='<path class="t-pace" d="M'+X(0).toFixed(1)+' '+Y(budget/N).toFixed(1)+' L'+X(N-1).toFixed(1)+' '+Y(budget).toFixed(1)+'"/>';
  s+='<path class="t-line" pathLength="1" d="'+line+'"/>';
  s+='<line id="tGuide" class="guide" y1="'+T+'" y2="'+(T+ih)+'" x1="0" x2="0" style="opacity:0"/>';
  s+='<circle id="tDot" r="5.5" cx="0" cy="0" fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5" style="opacity:0"/>';
  s+='<circle class="t-dot" cx="'+X(E-1).toFixed(1)+'" cy="'+Y(last).toFixed(1)+'" r="6" fill="var(--accent)" stroke="var(--surface)" stroke-width="3"/>';
  s+='<text class="endl" x="'+X(E-1).toFixed(1)+'" y="'+Math.max(13,Y(last)-13).toFixed(1)+'" text-anchor="'+(E>N*0.7?'end':'middle')+'">'+inr(last)+'</text>';
  s+='<rect class="trendHit" x="'+L+'" y="'+T+'" width="'+iw+'" height="'+ih+'" fill="transparent"/>';
  s+='</svg>';
  host.innerHTML=s;
  var svg=host.querySelector('svg'),hit=svg.querySelector('.trendHit'),guide=$('tGuide'),dot=$('tDot');
  hit.addEventListener('pointermove',function(ev){
    var r=svg.getBoundingClientRect();
    var x=(ev.clientX-r.left)/r.width*W;
    var i=Math.round((x-L)/iw*(N-1));
    i=Math.max(0,Math.min(E-1,i));
    guide.setAttribute('x1',X(i));guide.setAttribute('x2',X(i));guide.style.opacity=1;
    dot.setAttribute('cx',X(i));dot.setAttribute('cy',Y(c.cum[i]));dot.style.opacity=1;
    var daily=c.cum[i]-(i?c.cum[i-1]:0);
    var t='Day '+(i+1)+' · '+dShort(addDays(c.start,i))+'\nSpent that day '+inr(daily)+'\nCycle total '+inr(c.cum[i]);
    if(budget>0)t+='\nBudget pace '+inr(budget*(i+1)/N);
    if(c.pcum[i]!=null)t+='\nLast cycle '+inr(c.pcum[i]);
    showTip(t,ev.clientX,ev.clientY);
  });
  hit.addEventListener('pointerleave',function(){guide.style.opacity=0;dot.style.opacity=0;hideTip()});
  var pace=budget*c.elapsed/N,d=pace-last;
  $('trendSub').textContent=budget>0
    ?(d>=0?'You are '+inr(d)+' below the line you set for today.':'You are '+inr(-d)+' above the line you set for today.')
    :'Set a budget to see your pace line.';
}

/* ---------- donut ---------- */
function renderDonut(c){
  var host=$('donut');
  var list=CATS.map(function(cat){return {cat:cat,v:c.catTot[cat.id]||0}}).filter(function(x){return x.v>0}).sort(function(a,b){return b.v-a.v});
  if(!list.length){host.innerHTML='<p class="empty">No spending in this cycle yet.</p>';$('donutSub').textContent='This cycle by category';return}
  var tot=c.spent,R=70,C=2*Math.PI*R,off=0,segs='',leg='';
  list.forEach(function(x,i){
    var frac=x.v/tot,len=Math.max(frac*C-(list.length>1?3:0),0.5);
    segs+='<circle class="seg" data-seg="'+x.cat.id+'" data-len="'+len.toFixed(2)+'" cx="100" cy="100" r="'+R+'" fill="none" stroke="'+x.cat.color+'" stroke-width="26" stroke-dasharray="0 '+C.toFixed(2)+'" style="stroke-dashoffset:'+(-off).toFixed(2)+'px;transition-delay:'+(i*90)+'ms"/>';
    off+=frac*C;
    leg+='<li data-leg="'+x.cat.id+'"><i style="background:'+x.cat.color+'"></i><span>'+x.cat.name+'</span><b class="num">'+inr(x.v)+'</b><em class="num">'+Math.round(frac*100)+'%</em></li>';
  });
  host.innerHTML='<div class="donut-wrap"><svg viewBox="0 0 200 200" role="img" aria-label="Spending by category"><g transform="rotate(-90 100 100)">'+segs+'</g></svg><div class="dc"><span id="dcL">Total</span><b class="num" id="dcV">'+inr(tot)+'</b></div></div><ul class="leg">'+leg+'</ul>';
  var segEls=host.querySelectorAll('.seg');
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    segEls.forEach(function(el){el.setAttribute('stroke-dasharray',el.getAttribute('data-len')+' '+C.toFixed(2))});
  })});
  function hl(id){
    segEls.forEach(function(el){el.classList.toggle('dim',!!id&&el.getAttribute('data-seg')!==id)});
    if(id){var cat=catOf(id);$('dcL').textContent=cat.name;$('dcV').textContent=inr(c.catTot[id]||0)}
    else{$('dcL').textContent='Total';$('dcV').textContent=inr(tot)}
  }
  host.onpointerover=function(e){var t=e.target.closest('[data-seg],[data-leg]');if(t)hl(t.getAttribute('data-seg')||t.getAttribute('data-leg'))};
  host.onpointerleave=function(){hl(null)};
  $('donutSub').textContent=catOf(list[0].cat.id).name+' takes '+Math.round(list[0].v/tot*100)+'% of this cycle';
}

/* ---------- weekday bars ---------- */
function renderWeek(c){
  var sums=[0,0,0,0,0,0,0],i;
  for(i=0;i<84;i++){var d=addDays(today,-i);sums[(d.getDay()+6)%7]+=c.byDay[ymd(d)]||0}
  var avg=sums.map(function(v){return v/12});
  var mx=Math.max.apply(null,avg),ti=avg.indexOf(mx),h='';
  avg.forEach(function(v,i){
    var pct=mx>0?Math.max(3,v/mx*100):3;
    h+='<div class="bar-col'+(i===ti&&mx>0?' topc':'')+'" data-tip="'+DOWL[i]+'s: about '+inr(v)+' on an average day"><span class="bar-v">'+(v>0?short(v):'')+'</span><div class="bar'+(i===ti&&mx>0?' top':'')+'" data-h="'+pct.toFixed(1)+'"></div><span class="bar-l">'+DOWS[i].charAt(0)+'</span></div>';
  });
  $('bars').innerHTML=h;
  var bars=$('bars').querySelectorAll('.bar');
  requestAnimationFrame(function(){requestAnimationFrame(function(){bars.forEach(function(b){b.style.height=b.getAttribute('data-h')+'%'})})});
  $('weekSub').textContent=mx>0?DOWL[ti]+'s cost you the most, about '+inr(mx)+' a day.':'Average spend per weekday, last 12 weeks.';
}

/* ---------- heatmap ---------- */
var dayFilter=null;
function renderHeat(c){
  var mon=addDays(today,-((today.getDay()+6)%7));
  var start=addDays(mon,-77),cells='',vals=[],i,d,key;
  for(i=0;i<84;i++){d=addDays(start,i);if(d<=today){var v=c.byDay[ymd(d)]||0;if(v>0)vals.push(v)}}
  vals.sort(function(a,b){return a-b});
  function q(p){return vals.length?vals[Math.min(vals.length-1,Math.floor(p*vals.length))]:0}
  var q1=q(.25),q2=q(.5),q3=q(.8);
  for(var col=0;col<12;col++)for(var row=0;row<7;row++){
    i=col*7+row;d=addDays(start,i);key=ymd(d);
    var fut=d>today,val=c.byDay[key]||0,lv=0;
    if(val>0)lv=val<=q1?1:(val<=q2?2:(val<=q3?3:4));
    cells+='<button type="button" class="cell'+(lv?' l'+lv:'')+(fut?' fut':'')+(dayFilter===key?' sel':'')+'" data-date="'+key+'" style="--d:'+i+'" data-tip="'+dLong(d)+'\n'+(val>0?inr(val)+' spent':'No spend')+'" aria-label="'+dLong(d)+', '+(val>0?inr(val):'no spend')+'"></button>';
  }
  $('hmGrid').innerHTML=cells;
  var m='',prev=-1;
  for(col=0;col<12;col++){var cd=addDays(start,col*7);var mo=cd.getMonth();m+='<span>'+(mo!==prev?MON[mo]:'')+'</span>';prev=mo}
  $('hmMonths').innerHTML=m;
}
$('hmGrid').addEventListener('click',function(e){
  var b=e.target.closest('.cell');if(!b||b.classList.contains('fut'))return;
  var k=b.getAttribute('data-date');dayFilter=dayFilter===k?null:k;
  $('hmGrid').querySelectorAll('.cell').forEach(function(x){x.classList.toggle('sel',x.getAttribute('data-date')===dayFilter)});
  listLimit=20;renderList();
  if(dayFilter)$('txs').scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
});

/* ---------- jar ---------- */
function renderJar(){
  var saved=0,coins=0;
  state.expenses.forEach(function(e){if(e.createdAt>state.jarSince){var r=roundUp(e.amt);if(r>0){saved+=r;coins++}}});
  var goal=Math.max(+state.jarGoal||1000,10),fill=Math.min(1,saved/goal);
  setNum($('jarAmt'),saved,inr);
  $('jarSub').textContent='Every expense rounds up to the next ₹'+state.roundTo+'.';
  $('jarNote').textContent=coins?'from '+coins+' purchases'+(state.banked>0?'. Banked so far: '+inr(state.banked):''):(state.banked>0?'Banked so far: '+inr(state.banked):'Add expenses and watch it fill.');
  $('jarGoalTxt').textContent=Math.round(fill*100)+'% of '+inr(goal);
  var liq=$('liquid');
  liq.style.transform='translateY(150px)';
  requestAnimationFrame(function(){requestAnimationFrame(function(){liq.style.transform='translateY('+(34+(1-fill)*100-4).toFixed(1)+'px)'})});
  var bar=$('jarBar');bar.style.width='0%';
  requestAnimationFrame(function(){requestAnimationFrame(function(){bar.style.width=(fill*100).toFixed(1)+'%'})});
  $('emptyJar').disabled=saved<=0;
  $('emptyJar')._saved=saved;
}
$('emptyJar').addEventListener('click',function(){
  var s=this._saved||0;if(s<=0)return;
  state.banked=Math.round((state.banked+s)*100)/100;state.jarSince=Date.now();save();
  toast(inr(s)+' moved to savings. The jar is empty again.');renderJar();
});

/* ---------- regret + streak ---------- */
function renderRegret(c){
  var tot=c.spent,m=c.moodTot;
  var pct=tot>0?m.regret/tot*100:0;
  setNum($('regretPct'),pct,function(v){return Math.round(v)+'%'});
  $('regretNote').textContent=tot>0?inr(m.regret)+' of this cycle went on things you regret.':'Nothing recorded this cycle yet.';
  var bar='',list='';
  MOODS.forEach(function(md){
    var w=tot>0?(m[md.id]||0)/tot*100:0;
    bar+='<i data-w="'+w.toFixed(1)+'" style="background:'+md.color+'" data-tip="'+md.name+': '+inr(m[md.id]||0)+'"></i>';
    list+='<div><i style="background:'+md.color+'"></i>'+md.name+'<b class="num">'+inr(m[md.id]||0)+'</b></div>';
  });
  if(c.topRegret)list+='<p class="note" style="margin-top:4px">Biggest regret: '+esc(c.topRegret.note)+', '+inr2(c.topRegret.amt)+'.</p>';
  $('moodBar').innerHTML=bar;$('moodList').innerHTML=list;
  var segs=$('moodBar').querySelectorAll('i');
  requestAnimationFrame(function(){requestAnimationFrame(function(){segs.forEach(function(s){s.style.width=s.getAttribute('data-w')+'%'})})});
}
function renderStreak(c){
  var k=0;
  while(k<84&&!(c.byDay[ymd(addDays(today,-k))]>0))k++;
  var best=0,run=0,i;
  for(i=83;i>=0;i--){if(c.byDay[ymd(addDays(today,-i))]>0)run=0;else{run++;if(run>best)best=run}}
  setNum($('streakNum'),k,function(v){return Math.round(v)+(Math.round(v)===1?' day':' days')});
  $('streakNote').textContent=k===0?'You spent today. Tomorrow is a fresh start.':'Nothing spent since '+dShort(addDays(today,-(k-1)))+'. Best run: '+best+(best===1?' day.':' days.');
  var dots='';
  for(i=13;i>=0;i--){
    var d=addDays(today,-i),v=c.byDay[ymd(d)]||0;
    dots+='<i class="'+(v>0?'spent':'')+'" style="--d:'+(13-i)+'" data-tip="'+dLong(d)+'\n'+(v>0?inr(v)+' spent':'No spend')+'"></i>';
  }
  $('streakDots').innerHTML=dots;
}

/* ---------- budgets ---------- */
function renderBudgets(c){
  var h='';
  CATS.forEach(function(cat){
    var sp=c.catTot[cat.id]||0,lim=+state.catLimits[cat.id]||0,pct=lim>0?sp/lim*100:0,over=lim>0&&sp>lim;
    h+='<li><div class="t"><span><i class="dt" style="background:'+cat.color+'"></i>'+cat.name+'</span><small'+(over?' class="over"':'')+'>'+inr(sp)+(lim>0?' of '+inr(lim)+(over?' · over by '+inr(sp-lim):''):'')+'</small></div><div class="track"><div data-w="'+Math.min(pct,100).toFixed(1)+'" style="background:'+(over?'var(--bad)':cat.color)+'"></div></div></li>';
  });
  $('budgets').innerHTML=h;
  var bars=$('budgets').querySelectorAll('.track div');
  requestAnimationFrame(function(){requestAnimationFrame(function(){bars.forEach(function(b){b.style.width=b.getAttribute('data-w')+'%'})})});
}

/* ---------- ledger ---------- */
var listLimit=20,catFilter='all',lastAdded=null;
function dayLabel(s){
  var n=diffDays(today,parseYmd(s));
  if(n===0)return 'Today';if(n===1)return 'Yesterday';
  return dLong(parseYmd(s));
}
function renderFilterChips(){
  var h='<button type="button" class="chip" data-f="all" aria-pressed="'+(catFilter==='all')+'">All</button>';
  CATS.forEach(function(c){h+='<button type="button" class="chip" data-f="'+c.id+'" aria-pressed="'+(catFilter===c.id)+'"><i style="background:'+c.color+'"></i>'+c.name+'</button>'});
  $('filterChips').innerHTML=h;
}
function renderList(){
  var q=$('search').value.trim().toLowerCase();
  var items=state.expenses.filter(function(e){
    if(catFilter!=='all'&&e.cat!==catFilter)return false;
    if(dayFilter&&e.date!==dayFilter)return false;
    if(q&&(e.note.toLowerCase().indexOf(q)<0&&catOf(e.cat).name.toLowerCase().indexOf(q)<0))return false;
    return true;
  }).sort(function(a,b){return a.date<b.date?1:(a.date>b.date?-1:b.createdAt-a.createdAt)});
  var shown=items.slice(0,listLimit),h='',cur='';
  var dayTot={};items.forEach(function(e){dayTot[e.date]=(dayTot[e.date]||0)+e.amt});
  shown.forEach(function(e){
    if(e.date!==cur){cur=e.date;h+='<li class="day-h"><span>'+dayLabel(cur)+'</span><span class="num">'+inr(dayTot[cur])+'</span></li>'}
    var cat=catOf(e.cat),md=moodOf(e.mood);
    h+='<li class="tx'+(e.id===lastAdded?' new':'')+'" data-id="'+e.id+'"><span class="dot" style="background:'+cat.color+'"></span><div class="tx-main"><b>'+esc(e.note)+'</b><span>'+cat.name+' · <button type="button" class="mood" data-mood="'+e.id+'" style="--mc:'+md.color+'" title="Change how this felt">'+md.name+'</button></span></div><span class="amt">'+inr2(e.amt)+'</span><button type="button" class="x" data-del="'+e.id+'" aria-label="Delete '+esc(e.note)+'">×</button></li>';
  });
  lastAdded=null;
  $('txs').innerHTML=h||'<li class="empty">'+(state.expenses.length?'Nothing matches those filters.':'No expenses yet. Add your first one above.')+'</li>';
  var more=$('moreBtn');more.hidden=items.length<=listLimit;
  more.textContent='Show '+Math.min(20,items.length-listLimit)+' more';
  $('ledgerSub').textContent=items.length+(items.length===1?' expense':' expenses')+' · '+inr(items.reduce(function(a,e){return a+e.amt},0));
  var df=$('dayFilter');
  if(dayFilter){df.hidden=false;df.innerHTML='Showing '+dLong(parseYmd(dayFilter))+' <button type="button" aria-label="Clear day filter" id="clearDay">×</button>'}
  else df.hidden=true;
}
$('filterChips').addEventListener('click',function(e){
  var b=e.target.closest('[data-f]');if(!b)return;
  catFilter=b.getAttribute('data-f');listLimit=20;renderFilterChips();renderList();
});
$('search').addEventListener('input',function(){listLimit=20;renderList()});
$('moreBtn').addEventListener('click',function(){listLimit+=20;renderList()});
$('dayFilter').addEventListener('click',function(e){
  if(e.target.id==='clearDay'){dayFilter=null;renderList();var cs=$('hmGrid').querySelectorAll('.cell.sel');cs.forEach(function(x){x.classList.remove('sel')})}
});
$('txs').addEventListener('click',function(e){
  var mb=e.target.closest('[data-mood]');
  if(mb){
    var id=+mb.getAttribute('data-mood');
    state.expenses.forEach(function(x){if(x.id===id){var order=['worth','ok','regret'];x.mood=order[(order.indexOf(x.mood)+1)%3]}});
    save();var c=compute();renderRegret(c);renderList();return;
  }
  var db=e.target.closest('[data-del]');
  if(db){
    var did=+db.getAttribute('data-del'),li=db.closest('.tx');
    li.classList.add('out');
    setTimeout(function(){
      var idx=-1;state.expenses.forEach(function(x,i){if(x.id===did)idx=i});
      if(idx<0)return;
      var removed=state.expenses.splice(idx,1)[0];save();renderAll();
      toast('Deleted '+removed.note,'Undo',function(){state.expenses.push(removed);save();renderAll()});
    },260);
  }
});

/* ---------- add expense ---------- */
var pickCat=null,pickMood='ok';
function buildChips(){
  var h='';
  CATS.forEach(function(c){h+='<button type="button" class="chip" data-c="'+c.id+'" aria-pressed="false"><i style="background:'+c.color+'"></i>'+c.name+'</button>'});
  $('catChips').innerHTML=h;
  h='';
  MOODS.forEach(function(m){h+='<button type="button" class="chip" data-m="'+m.id+'" aria-pressed="'+(m.id===pickMood)+'"><i style="background:'+m.color+'"></i>'+m.name+'</button>'});
  $('moodChips').innerHTML=h;
}
function parseEntry(text){
  var m=text.match(/(\d[\d,]*\.?\d*)\s*(k\b)?/i);
  if(!m)return null;
  var amt=parseFloat(m[1].replace(/,/g,''));
  if(!isFinite(amt)||amt<=0)return null;
  if(m[2])amt*=1000;
  amt=Math.round(amt*100)/100;
  var note=(text.slice(0,m.index)+' '+text.slice(m.index+m[0].length)).replace(/₹|\brs\.?\b|\binr\b/ig,' ').replace(/\s+/g,' ').trim();
  var words=note.toLowerCase().split(/[^a-z\-]+/),cat=null,i,j,id;
  outer:for(i=0;i<words.length;i++){
    for(id in KW){for(j=0;j<KW[id].length;j++){if(KW[id][j]===words[i]){cat=id;break outer}}}
    for(j=0;j<CATS.length;j++){if(CATS[j].id===words[i]||CATS[j].name.toLowerCase()===words[i]){cat=CATS[j].id;break outer}}
  }
  var dc=pickCat||cat||'other';
  if(!note)note=catOf(dc).name;
  else note=note.charAt(0).toUpperCase()+note.slice(1);
  return {amt:amt,note:note,cat:dc,detected:!!cat};
}
function updatePreview(){
  var p=parseEntry($('smart').value);
  var dv=$('dateIn').value||ymd(today);
  if(!$('smart').value.trim()){$('preview').textContent='Example: "swiggy dinner 380" becomes ₹380 in Food.';return}
  if(!p){$('preview').textContent='Add an amount, like 250.';return}
  var r=roundUp(p.amt);
  $('preview').innerHTML='<b>'+inr2(p.amt)+'</b> · '+catOf(p.cat).name+(pickCat?' (chosen)':(p.detected?' (auto)':' (no match, pick one above)'))+' · '+dayLabel(dv)+(r>0?' · +'+inr2(r)+' to the jar':'');
}
$('smart').addEventListener('input',updatePreview);
$('dateIn').addEventListener('change',updatePreview);
$('catChips').addEventListener('click',function(e){
  var b=e.target.closest('[data-c]');if(!b)return;
  var id=b.getAttribute('data-c');pickCat=pickCat===id?null:id;
  $('catChips').querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x.getAttribute('data-c')===pickCat))});
  updatePreview();
});
$('moodChips').addEventListener('click',function(e){
  var b=e.target.closest('[data-m]');if(!b)return;
  pickMood=b.getAttribute('data-m');
  $('moodChips').querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',String(x.getAttribute('data-m')===pickMood))});
});
$('addForm').addEventListener('submit',function(e){
  e.preventDefault();
  var p=parseEntry($('smart').value);
  if(!p){var f=$('smart');f.classList.remove('shake');void f.offsetWidth;f.classList.add('shake');$('preview').textContent='Add an amount first, like "chai 40".';return}
  var date=$('dateIn').value||ymd(today);
  var ex={id:state.nextId++,amt:p.amt,cat:p.cat,note:p.note,date:date,mood:pickMood,createdAt:Date.now()};
  state.expenses.push(ex);lastAdded=ex.id;save();
  $('smart').value='';pickCat=null;pickMood='ok';buildChips();updatePreview();
  renderAll();
  var r=roundUp(p.amt);
  toast('Added '+inr2(p.amt)+' to '+catOf(p.cat).name+(r>0?'. +'+inr2(r)+' in the jar.':'.'));
});

/* ---------- settings / csv / palette ---------- */
function openModal(id){var m=$(id);m.hidden=false;var f=m.querySelector('input,textarea,button');if(f)setTimeout(function(){f.focus()},30)}
function closeModals(){['settings','csvModal'].forEach(function(id){$(id).hidden=true})}
document.querySelectorAll('[data-close]').forEach(function(b){b.addEventListener('click',closeModals)});
document.querySelectorAll('.modal').forEach(function(m){m.addEventListener('pointerdown',function(e){if(e.target===m)closeModals()})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModals()});
$('openSettings').addEventListener('click',function(){
  $('setBudget').value=state.budget;$('setDay').value=state.cycleDay;$('setRound').value=String(state.roundTo);$('setGoal').value=state.jarGoal;
  var h='';
  CATS.forEach(function(c){h+='<label for="lim-'+c.id+'">'+c.name+'<input class="field num" id="lim-'+c.id+'" type="number" min="0" step="100" value="'+(state.catLimits[c.id]||0)+'"></label>'});
  $('limitGrid').innerHTML=h;
  $('eraseAll').textContent='Erase all data';$('eraseAll')._armed=false;
  openModal('settings');
});
$('saveSettings').addEventListener('click',function(){
  var b=parseFloat($('setBudget').value),d=parseInt($('setDay').value,10),g=parseFloat($('setGoal').value);
  if(isFinite(b)&&b>=0)state.budget=b;
  if(isFinite(d))state.cycleDay=Math.min(28,Math.max(1,d));
  state.roundTo=parseInt($('setRound').value,10)||10;
  if(isFinite(g)&&g>=10)state.jarGoal=g;
  CATS.forEach(function(c){var v=parseFloat($('lim-'+c.id).value);if(isFinite(v)&&v>=0)state.catLimits[c.id]=v});
  save();closeModals();renderAll();toast('Settings saved.');
});
$('eraseAll').addEventListener('click',function(){
  var b=this;
  if(!b._armed){b._armed=true;b.textContent='Tap again to erase everything';setTimeout(function(){b._armed=false;b.textContent='Erase all data'},4000);return}
  var pal=state.palette;state=defaults();state.palette=pal;save();closeModals();dayFilter=null;catFilter='all';renderFilterChips();renderAll();toast('All data erased.');
});
$('clearSample').addEventListener('click',function(){
  state.expenses=state.expenses.filter(function(e){return !e.s});state.sample=false;state.jarSince=Date.now();save();dayFilter=null;renderAll();toast('Example data cleared. It is all yours now.');
});
$('openCsv').addEventListener('click',function(){
  var rows=['date,amount,category,note,feeling'];
  state.expenses.slice().sort(function(a,b){return a.date<b.date?-1:1}).forEach(function(e){
    rows.push([e.date,e.amt,catOf(e.cat).name,'"'+String(e.note).replace(/"/g,'""')+'"',moodOf(e.mood).name].join(','));
  });
  $('csvText').value=rows.join('\n');openModal('csvModal');
  $('csvText').select();
});
$('copyCsv').addEventListener('click',function(){
  var t=$('csvText');t.focus();t.select();
  var ok=false;
  try{ok=document.execCommand&&document.execCommand('copy')}catch(e){}
  if(!ok&&navigator.clipboard){navigator.clipboard.writeText(t.value).then(function(){toast('Copied to clipboard.')},function(){toast('Select the text and copy it with your keyboard.')});return}
  toast(ok?'Copied to clipboard.':'Select the text and copy it with your keyboard.');
});
function applyPalette(p){
  document.documentElement.setAttribute('data-palette',p);
  document.querySelectorAll('.sw').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-pal')===p))});
}
document.querySelector('.swatches').addEventListener('click',function(e){
  var b=e.target.closest('.sw');if(!b)return;
  state.palette=b.getAttribute('data-pal');applyPalette(state.palette);save();
});

/* ---------- main render ---------- */
function renderAll(){
  var c=compute();
  var h=nowD.getHours();
  $('hello').textContent=(h<12?'Good morning':(h<17?'Good afternoon':'Good evening'))+' · '+DOWL[(today.getDay()+6)%7]+', '+today.getDate()+' '+MON[today.getMonth()]+' · Cycle '+dShort(c.start)+' to '+dShort(c.end)+', day '+c.elapsed+' of '+c.len;
  $('banner').hidden=!state.sample;
  renderHero(c);renderTrend(c);renderDonut(c);renderWeek(c);renderHeat(c);
  renderJar();renderRegret(c);renderStreak(c);renderBudgets(c);renderList();
  firstRender=false;
}

applyPalette(state.palette||'orange');
$('dateIn').value=ymd(today);$('dateIn').max=ymd(today);
buildChips();renderFilterChips();updatePreview();renderAll();
})();
