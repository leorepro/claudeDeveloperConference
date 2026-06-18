// 語言切換：依 data-i18n / data-i18n-html 屬性套用 I18N（定義於 i18n.js）字典，
// 並把選擇記在 localStorage，下次造訪沿用。
function setLang(l){
  const dict = I18N[l] || I18N.zh;
  document.documentElement.lang = (l==='zh'?'zh-Hant':l);
  document.querySelectorAll('[data-i18n]').forEach(e=>{const k=e.getAttribute('data-i18n'); if(dict[k]!==undefined) e.textContent=dict[k];});
  document.querySelectorAll('[data-i18n-html]').forEach(e=>{const k=e.getAttribute('data-i18n-html'); if(dict[k]!==undefined) e.innerHTML=dict[k];});
  document.querySelectorAll('.langbtn').forEach(b=>b.classList.toggle('active', b.dataset.l===l));
  try{localStorage.setItem('forumLang',l);}catch(e){}
}
(function(){let l='zh';try{l=localStorage.getItem('forumLang')||'zh';}catch(e){}setLang(l);})();

// 手機漢堡選單：開合分區導覽，點連結或點選單外區域自動收合。
(function(){
  const btn=document.getElementById('navToggle'), links=document.getElementById('navlinks');
  if(!btn||!links) return;
  const set=open=>{links.classList.toggle('open',open);btn.setAttribute('aria-expanded',open);};
  btn.addEventListener('click',e=>{e.stopPropagation();set(!links.classList.contains('open'));});
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>set(false)));
  document.addEventListener('click',e=>{if(links.classList.contains('open')&&!links.contains(e.target)&&e.target!==btn)set(false);});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')set(false);});
})();

// 圖片輪播：左右按鈕、圓點、自動播放（滑鼠移入暫停）。
function initCarousel(id){
  const root=document.getElementById(id); if(!root) return;
  const track=root.querySelector('.carousel-track');
  const slides=[...root.querySelectorAll('.carousel-slide')];
  const dotsWrap=root.querySelector('.carousel-dots');
  const count=root.querySelector('.carousel-count');
  if(!track||!slides.length) return;
  let idx=0, timer=null;
  slides.forEach((_,i)=>{const b=document.createElement('button'); b.setAttribute('aria-label','第 '+(i+1)+' 張'); b.addEventListener('click',()=>{go(i);restart();}); dotsWrap.appendChild(b);});
  const dots=[...dotsWrap.children];
  function go(i){
    idx=(i+slides.length)%slides.length;
    track.style.transform='translateX(-'+(idx*100)+'%)';
    dots.forEach((d,j)=>d.classList.toggle('active',j===idx));
    if(count) count.textContent=(idx+1)+' / '+slides.length;
  }
  function restart(){clearInterval(timer); timer=setInterval(()=>go(idx+1),5000);}
  const next=root.querySelector('.carousel-btn.next'), prev=root.querySelector('.carousel-btn.prev');
  if(next) next.addEventListener('click',()=>{go(idx+1);restart();});
  if(prev) prev.addEventListener('click',()=>{go(idx-1);restart();});
  root.addEventListener('mouseenter',()=>clearInterval(timer));
  root.addEventListener('mouseleave',restart);
  // 觸控滑動
  let x0=null;
  root.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
  root.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(idx+(dx<0?1:-1));restart();}x0=null;},{passive:true});
  go(0); restart();
}
initCarousel('hallCarousel');

// 預算試算器：勾選即時加總，顯示新台幣與美金（匯率 1 USD ≈ 32.5 TWD）。
(function(){
  const root=document.getElementById('budgetCalc'); if(!root) return;
  const RATE=32.5;
  const twdEl=document.getElementById('calcTwd'), usdEl=document.getElementById('calcUsd');
  const usd=v=>Math.round(v/RATE/100)*100;
  function recalc(){
    let sum=0;
    const venue=root.querySelector('input[name="cVenue"]:checked');
    const gift=root.querySelector('input[name="cGift"]:checked');
    const tea=root.querySelector('input[name="cTea"]:checked');
    if(venue) sum+=+venue.value;
    if(gift) sum+=+gift.value;
    if(tea) sum+=+tea.value;
    root.querySelectorAll('input.calc-opt:checked').forEach(c=>sum+=+c.value);
    twdEl.textContent='NT$'+sum.toLocaleString('en-US');
    usdEl.textContent='≈ US$'+usd(sum).toLocaleString('en-US');
  }
  // 每個項目顯示對應美金（同匯率，四捨五入到百位）。
  root.querySelectorAll('label .amt i').forEach(el=>{
    const v=+el.closest('label').querySelector('input').value;
    el.textContent='≈ US$'+usd(v).toLocaleString('en-US');
  });
  root.querySelectorAll('input').forEach(i=>i.addEventListener('change',recalc));
  recalc();
})();

// 時間軸「今天」進度指標：依今天日期，在各里程碑之間按實際天數比例定位，
// 並顯示距活動天數。視窗縮放與語言切換時會重新定位與更新文案。
(function(){
  const tl=document.querySelector('#timeline .timeline'); if(!tl) return;
  const pts=[...tl.querySelectorAll('.tl-item')]
    .map(el=>({el,d:new Date(el.dataset.date+'T00:00:00')}))
    .filter(p=>p.el.dataset.date && !isNaN(p.d));
  if(pts.length<2) return;
  const first=pts[0].d, last=pts[pts.length-1].d;

  const m=document.createElement('div'); m.className='tl-today';
  m.innerHTML='<div class="tl-today-flag"></div><div class="tl-today-stem"></div><div class="tl-today-dot"></div>';
  tl.appendChild(m);
  const flag=m.querySelector('.tl-today-flag');

  const L={
    zh:{t:'今天',go:n=>'距活動 '+n+' 天',day:'就是今天！',end:'活動已結束'},
    en:{t:'Today',go:n=>n+' days to go',day:'It’s today!',end:'Event ended'},
    ja:{t:'今日',go:n=>'開催まで '+n+' 日',day:'本日開催！',end:'終了しました'},
    ko:{t:'오늘',go:n=>'행사까지 '+n+'일',day:'바로 오늘!',end:'행사 종료'}
  };
  const lang=()=>{try{return localStorage.getItem('forumLang')||'zh';}catch(e){return 'zh';}};
  const today=()=>{const t=new Date();t.setHours(0,0,0,0);return t;};
  const center=el=>{const r=el.querySelector('.tl-dot').getBoundingClientRect();return r.left+r.width/2-tl.getBoundingClientRect().left;};

  function place(){
    if(getComputedStyle(tl).flexDirection==='column'){m.style.display='none';return;}
    m.style.display='';
    const t=today(); let x;
    if(t<=first) x=center(pts[0].el);
    else if(t>=last) x=center(pts[pts.length-1].el);
    else{
      let i=0; while(i<pts.length-1 && t>=pts[i+1].d) i++;
      const span=pts[i+1].d-pts[i].d, f=span>0?(t-pts[i].d)/span:0;
      x=center(pts[i].el)+f*(center(pts[i+1].el)-center(pts[i].el));
    }
    m.style.left=x+'px';
    const days=Math.round((last-t)/864e5), d=L[lang()]||L.zh;
    const sub=days>0?d.go(days):(days===0?d.day:d.end);
    flag.innerHTML='<b>'+d.t+'</b><span>'+sub+'</span>';
  }
  place();
  window.addEventListener('resize',place);
  setInterval(place,36e5); // 每小時依系統日期重算，跨日自動移動到新位置
  // 語言切換後同步更新指標文案
  document.querySelectorAll('.langbtn').forEach(b=>b.addEventListener('click',()=>setTimeout(place,0)));
})();

// 倒數計時器：距離活動開幕（2026/12/12 09:00 高雄當地時間）的天/時/分/秒，每秒更新。
(function(){
  const root=document.getElementById('countdown'); if(!root) return;
  const target=new Date('2026-12-12T09:00:00+08:00').getTime();
  const D=document.getElementById('cdD'),H=document.getElementById('cdH'),M=document.getElementById('cdM'),S=document.getElementById('cdS');
  const p2=n=>String(n).padStart(2,'0');
  let timer=null;
  function tick(){
    const diff=target-Date.now();
    if(diff<=0){
      const l=(()=>{try{return localStorage.getItem('forumLang')||'zh';}catch(e){return 'zh';}})();
      const msg={zh:'活動進行中 🎉',en:'Happening now 🎉',ja:'開催中 🎉',ko:'진행 중 🎉'}[l]||'活動進行中 🎉';
      const u=root.querySelector('.cd-units'); if(u) u.innerHTML='<div class="cd-live">'+msg+'</div>';
      if(timer) clearInterval(timer);
      return;
    }
    const s=Math.floor(diff/1000);
    if(D) D.textContent=Math.floor(s/86400);
    if(H) H.textContent=p2(Math.floor(s%86400/3600));
    if(M) M.textContent=p2(Math.floor(s%3600/60));
    if(S) S.textContent=p2(s%60);
  }
  tick(); timer=setInterval(tick,1000);
})();
