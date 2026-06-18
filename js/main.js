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
    if(venue) sum+=+venue.value;
    if(gift) sum+=+gift.value;
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
