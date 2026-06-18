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
