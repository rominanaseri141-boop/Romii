const fa = new Intl.DateTimeFormat('fa-IR-u-ca-persian',{dateStyle:'full'});
const faShort = new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'long',day:'numeric'});
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const key=d=>`romi-day-${iso(d)}`;
const read=d=>JSON.parse(localStorage.getItem(key(d))||'{}');
const save=(d,o)=>localStorage.setItem(key(d),JSON.stringify(o));
const today=new Date();
let selected=new Date(today);

const schedule={
  6:[['09:45','12:15','شیمی آلی','🧪'],['15:45','18:30','مکانیک سیالات','💧']],
  0:[['09:45','12:00','مقدمه‌ای بر هوش مصنوعی','🤖'],['13:00','15:45','مدار الکتریکی','⚡'],['15:45','18:30','مواد مهندسی','🧬']],
  2:[['14:40','16:10','زبان تخصصی','📖'],['16:30','18:30','دانش خانواده','🌷']]
};
const dayNames=['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'];
const tasks=d=>{
  const base=[['uni','۲ ساعت مطالعه درس‌های دانشگاه','📚'],['evolve','مطالعه Evolve','🌱'],['shadow','تمرین Shadowing','🎧'],['words','کلمات و اصطلاحات','💌'],['oxford','مطالعه Oxford','📘'],['speaking','تمرین مکالمه','🗣️'],['grammar','تمرین گرامر','✨']];
  if([1,3].includes(d.getDay())) base.splice(1,0,['workout','ورزش','🩰']);
  return base;
};
function renderDate(d){
  document.querySelectorAll('[data-full-date]').forEach(x=>x.textContent=fa.format(d));
  document.querySelectorAll('[data-short-date]').forEach(x=>x.textContent=faShort.format(d));
}
function renderTasks(d){
 const box=document.querySelector('#taskList'); if(!box)return;
 const state=read(d); const done=state.tasks||{};
 box.innerHTML=tasks(d).map(([id,text,icon])=>`<label class="task ${done[id]?'done':''}"><input type="checkbox" data-task="${id}" ${done[id]?'checked':''}><span class="check">✓</span><span class="task-icon">${icon}</span><span>${text}</span></label>`).join('');
 box.querySelectorAll('[data-task]').forEach(i=>i.addEventListener('change',()=>{const s=read(d);s.tasks=s.tasks||{};s.tasks[i.dataset.task]=i.checked;save(d,s);i.closest('.task').classList.toggle('done',i.checked);updateProgress(d)}));
 updateProgress(d);
}
function updateProgress(d){const box=document.querySelector('#progress');if(!box)return;const list=tasks(d);const s=read(d);const n=list.filter(x=>s.tasks?.[x[0]]).length;const p=Math.round(n/list.length*100);box.textContent=p+'%';document.querySelector('#bar')?.style.setProperty('--p',p+'%');document.querySelector('#progressText')?.textContent=`${n} از ${list.length} کار انجام شده`}
function renderClasses(d){const box=document.querySelector('#classes');if(!box)return; const arr=schedule[d.getDay()]||[];box.innerHTML=arr.length?arr.map(x=>`<div class="class-card"><div class="class-time">${x[0]}<small>تا ${x[1]}</small></div><div><b>${x[3]} ${x[2]}</b><span>کلاس امروز</span></div></div>`).join(''):`<div class="empty">امروز کلاس نداری 🌸<br><small>وقت خوبیه برای مطالعه و استراحت.</small></div>`}
function renderMood(d){const s=read(d);document.querySelectorAll('[data-mood]').forEach(b=>{b.classList.toggle('selected',b.dataset.mood===s.mood);b.onclick=()=>{const x=read(d);x.mood=b.dataset.mood;save(d,x);renderMood(d)}}); const score=document.querySelector('#score');if(score){score.value=s.score||5;document.querySelector('#scoreVal').textContent=score.value;score.oninput=()=>{const x=read(d);x.score=score.value;save(d,x);document.querySelector('#scoreVal').textContent=score.value}}}
function initHome(){renderDate(selected);renderTasks(selected);renderClasses(selected);renderMood(selected);document.querySelector('#todayBtn')?.addEventListener('click',()=>{selected=new Date(today);renderDate(selected);renderTasks(selected);renderClasses(selected);renderMood(selected)});}
function initJournal(){renderDate(selected);const s=read(selected);const note=document.querySelector('#note');if(note){note.value=s.note||'';document.querySelector('#saveNote').onclick=()=>{const x=read(selected);x.note=note.value;save(selected,x);document.querySelector('#saved').textContent='ذخیره شد ✓';setTimeout(()=>document.querySelector('#saved').textContent='',1200)}};renderMood(selected)}
function initWeek(){const box=document.querySelector('#weekGrid');if(!box)return;const names=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];box.innerHTML=names.map((name,i)=>{const js=[6,0,1,2,3,4,5][i];const arr=schedule[js]||[];const workout=[1,3].includes(js);return `<div class="week-card"><h3>${name} ${workout?'🩰':''}</h3>${arr.length?arr.map(x=>`<p><b>${x[0]}</b> ${x[3]} ${x[2]}</p>`).join(''):'<p>مطالعه + زبان 🌷</p>'}</div>`}).join('')}
function initHistory(){const box=document.querySelector('#history');if(!box)return;const items=[];for(let i=0;i<120;i++){const d=new Date();d.setDate(d.getDate()-i);const s=read(d);if(Object.keys(s).length){const total=tasks(d).length,done=Object.values(s.tasks||{}).filter(Boolean).length;items.push(`<button class="history-item" data-back="${iso(d)}"><span>${faShort.format(d)}</span><b>${s.score||'-'}/10</b><em>${s.mood||'🌱'} · ${Math.round(done/total*100)}%</em></button>`)} }box.innerHTML=items.length?items.join(''):'هنوز روزی ثبت نشده؛ از امروز شروع کنیم 🌸';box.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{const d=new Date(b.dataset.back+'T12:00:00');selected=d;location.href='index.html?date='+b.dataset.back})}
function getQueryDate(){const q=new URLSearchParams(location.search).get('date');if(q){const d=new Date(q+'T12:00:00');if(!isNaN(d))return d}return new Date()}
selected=getQueryDate();
document.addEventListener('DOMContentLoaded',()=>{const page=document.body.dataset.page;if(page==='home')initHome();if(page==='journal')initJournal();if(page==='week')initWeek();if(page==='history')initHistory();document.querySelectorAll('.heart').forEach(h=>h.animate([{transform:'translateY(0)'},{transform:'translateY(-9px)'},{transform:'translateY(0)'}],{duration:1800,iterations:Infinity}));});
