const CHARS=[
  {id:1,name:"Tsuyu Asui",series:"My Hero Academia",rarity:"SSR",emoji:"🐸"},
  {id:2,name:"Hatsune Miku",series:"Project Sekai",rarity:"SSR",emoji:"🎤"},
  {id:3,name:"Corin Wickes",series:"Zenless Zone Zero",rarity:"SSR",emoji:"🪚"},
  {id:4,name:"Lucy",series:"Zenless Zone Zero",rarity:"SSR",emoji:"🔥"},
  {id:5,name:"Ochaco Uraraka",series:"My Hero Academia",rarity:"SSR",emoji:"🌌"},
  {id:6,name:"Kagamine Rin",series:"Project Sekai",rarity:"SSR",emoji:"🎹"},
  {id:7,name:"Izuku Midoriya",series:"My Hero Academia",rarity:"SR",emoji:"🥦"},
  {id:8,name:"Katsuki Bakugo",series:"My Hero Academia",rarity:"SR",emoji:"💥"},
  {id:9,name:"Shoto Todoroki",series:"My Hero Academia",rarity:"SR",emoji:"❄️"},
  {id:10,name:"Nicole Demara",series:"Zenless Zone Zero",rarity:"SR",emoji:"💰"},
  {id:11,name:"Anby Demara",series:"Zenless Zone Zero",rarity:"SR",emoji:"⚡"},
  {id:12,name:"Billy Kid",series:"Zenless Zone Zero",rarity:"SR",emoji:"🤖"},
  {id:13,name:"Ichika Nakano",series:"The Quintessential Quintuplets",rarity:"SR",emoji:"🎭"},
  {id:14,name:"Itsuki Nakano",series:"The Quintessential Quintuplets",rarity:"SR",emoji:"🍙"},
  {id:15,name:"Mafuyu Asahina",series:"Project Sekai",rarity:"SR",emoji:"🦋"},
  {id:16,name:"Tenya Iida",series:"My Hero Academia",rarity:"R",emoji:"🏃"},
  {id:17,name:"Eijiro Kirishima",series:"My Hero Academia",rarity:"R",emoji:"🪨"},
  {id:18,name:"Denki Kaminari",series:"My Hero Academia",rarity:"R",emoji:"⚡"},
  {id:19,name:"Kyoka Jiro",series:"My Hero Academia",rarity:"R",emoji:"🎧"},
  {id:20,name:"Mina Ashido",series:"My Hero Academia",rarity:"R",emoji:"💗"},
  {id:21,name:"Ellen Joe",series:"Zenless Zone Zero",rarity:"R",emoji:"🦈"},
  {id:22,name:"Lycoan",series:"Zenless Zone Zero",rarity:"R",emoji:"🦊"},
  {id:23,name:"Soukaku",series:"Zenless Zone Zero",rarity:"R",emoji:"👹"},
  {id:24,name:"Yotsuba Nakano",series:"The Quintessential Quintuplets",rarity:"R",emoji:"🍊"},
  {id:25,name:"Nino Nakano",series:"The Quintessential Quintuplets",rarity:"R",emoji:"🦋"},
  {id:26,name:"Emu Otori",series:"Project Sekai",rarity:"R",emoji:"🎡"},
  {id:27,name:"Minoru Mineta",series:"My Hero Academia",rarity:"C",emoji:"🍇"},
  {id:28,name:"Koji Koda",series:"My Hero Academia",rarity:"C",emoji:"🐰"},
  {id:29,name:"Mashirao Ojiro",series:"My Hero Academia",rarity:"C",emoji:"🐒"},
  {id:30,name:"Hanta Sero",series:"My Hero Academia",rarity:"C",emoji:"🩹"},
  {id:31,name:"Mezo Shoji",series:"My Hero Academia",rarity:"C",emoji:"🖐️"},
  {id:32,name:"Piper Wheel",series:"Zenless Zone Zero",rarity:"C",emoji:"🚗"},
];
const RORDER={SSR:0,SR:1,R:2,C:3};
const SSR_PITY=80;
const SINGLE_COST=160;
const TEN_COST=1600;
const STARTING_GEMS=3200;

function loadNumber(key,fallback){
  const raw=localStorage.getItem(key);
  if(raw===null)return fallback;
  const value=Number(raw);
  return Number.isFinite(value)?value:fallback;
}

function loadJSON(key,fallback){
  try{
    const raw=localStorage.getItem(key);
    return raw===null?fallback:JSON.parse(raw);
  }catch(error){
    console.warn(`Could not load ${key}; using fallback.`,error);
    return fallback;
  }
}

let state={
  gems:loadNumber('ra_gems',STARTING_GEMS),
  pity:loadNumber('ra_pity',0),
  totalPulls:loadNumber('ra_total',0),
  inventory:loadJSON('ra_inv',[]),
  history:loadJSON('ra_hist',[])
};

let curFilter='All';

function save(){
  localStorage.setItem('ra_gems',state.gems);
  localStorage.setItem('ra_pity',state.pity);
  localStorage.setItem('ra_total',state.totalPulls);
  localStorage.setItem('ra_inv',JSON.stringify(state.inventory));
  localStorage.setItem('ra_hist',JSON.stringify(state.history));
}

function roll(){
  state.totalPulls++;state.pity++;
  let rarity;
  if(state.pity>=SSR_PITY){rarity='SSR';}
  else{
    const r=Math.random()*100;
    if(r<2)rarity='SSR';
    else if(r<10)rarity='SR';
    else if(r<30)rarity='R';
    else rarity='C';
  }
  if(rarity==='SSR')state.pity=0;
  const pool=CHARS.filter(c=>c.rarity===rarity);
  return pool[Math.floor(Math.random()*pool.length)];
}

function addToInv(char){
  const owned=state.inventory.find(i=>i.id===char.id);
  if(owned){owned.copies++;return false;}
  else{state.inventory.push({...char,copies:1});return true;}
}

function cardHTML(char,isNew,delay=0){
  const r=char.rarity.toLowerCase();
  const newBadge=isNew?'<span class="new-badge">NEW</span>':'';
  const copiesBadge=!isNew&&char.copies?`<span class="copies-badge">×${char.copies}</span>`:'';
  return `<div class="card ${r}" style="animation-delay:${delay}ms">
    ${newBadge}${copiesBadge}
    <div class="card-shine"></div>
    <div class="card-inner">
      <span class="card-emoji">${char.emoji}</span>
      <div class="card-name">${char.name}</div>
      <div class="card-series">${char.series}</div>
      <span class="rarity-chip">${char.rarity}</span>
    </div>
  </div>`;
}

function showReveal(chars){
  const placeholder=document.getElementById('reveal-placeholder');
  const cards=document.getElementById('reveal-cards');
  placeholder.style.display='none';
  cards.style.display='flex';

  const wasNew=chars.map(c=>addToInv(c));
  [...chars].reverse().forEach(c=>{
    state.history.unshift(c);
    if(state.history.length>50)state.history.pop();
  });

  cards.innerHTML=chars.map((c,i)=>cardHTML(c,wasNew[i],i*60)).join('');

  const hasSSR=chars.some(c=>c.rarity==='SSR');
  if(hasSSR){
    showToast('✦ SSR obtained!',true);
    const ra=document.getElementById('reveal-area');
    ra.style.boxShadow='0 0 40px var(--gold-glow)';
    setTimeout(()=>ra.style.boxShadow='',2000);
  }
}

function doSingle(){
  if(state.gems<SINGLE_COST){showToast('Not enough gems — top up?');return;}
  state.gems-=SINGLE_COST;
  const c=roll();
  showReveal([c]);
  updateUI();save();
}

function doTen(){
  if(state.gems<TEN_COST){showToast('Not enough gems — top up?');return;}
  state.gems-=TEN_COST;
  const pulled=[];
  for(let i=0;i<10;i++)pulled.push(roll());
  showReveal(pulled);
  updateUI();save();
}

function updateUI(){
  document.getElementById('gem-count').textContent=state.gems.toLocaleString();
  document.getElementById('pity-val').textContent=`${state.pity} / ${SSR_PITY}`;
  const pct=(state.pity/SSR_PITY)*100;
  const fill=document.getElementById('pity-fill');
  fill.style.width=pct+'%';
  fill.className='pity-fill'+(pct>=75?' danger':'');

  const inv=state.inventory;
  const total=CHARS.length;
  document.getElementById('cstat-collected').innerHTML=`${inv.length}<span style="font-size:12px;color:var(--muted)"> / ${total}</span>`;
  document.getElementById('cstat-pulls').textContent=state.totalPulls;
  document.getElementById('cstat-ssr').textContent=inv.filter(c=>c.rarity==='SSR').length;
  document.getElementById('cstat-pct').textContent=((inv.length/total)*100).toFixed(0)+'%';
  document.getElementById('cstat-bar').style.width=((inv.length/total)*100)+'%';

  renderInv();
  renderHistory();
}

function renderInv(){
  const grid=document.getElementById('inv-grid');
  const filtered=state.inventory
    .filter(c=>curFilter==='All'||c.rarity===curFilter)
    .sort((a,b)=>RORDER[a.rarity]-RORDER[b.rarity]||a.name.localeCompare(b.name));

  if(!filtered.length){
    grid.innerHTML=`<div style="grid-column:span 2;text-align:center;color:var(--faint);font-size:13px;padding:32px 0">${state.inventory.length===0?'Start pulling to build your collection':'No '+curFilter+' cards yet'}</div>`;
    return;
  }
  grid.innerHTML=filtered.map(c=>{
    const r=c.rarity.toLowerCase();
    return `<div class="inv-card ${r}">
      <span class="card-emoji">${c.emoji}</span>
      <div class="card-name">${c.name}</div>
      <div class="card-series">${c.series}</div>
      <span class="rarity-chip">${c.rarity}</span>
      ${c.copies>1?`<span class="copies-badge">×${c.copies}</span>`:''}
    </div>`;
  }).join('');
}

function renderHistory(){
  const list=document.getElementById('history-list');
  if(!state.history.length){
    list.innerHTML='<div class="history-empty">No pulls yet</div>';return;
  }
  list.innerHTML=state.history.slice(0,30).map(c=>`
    <div class="history-item">
      <span class="history-emoji">${c.emoji}</span>
      <div class="history-info">
        <div class="history-name">${c.name}</div>
        <div class="history-series">${c.series}</div>
      </div>
      <span class="history-rarity ${c.rarity.toLowerCase()}">${c.rarity}</span>
    </div>`).join('');
}

function setFilter(f,el){
  curFilter=f;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderInv();
}

function showTab(tab,el){
  document.querySelectorAll('.sidebar-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-collection').style.display=tab==='collection'?'block':'none';
  document.getElementById('tab-history').style.display=tab==='history'?'block':'none';
}

function openTopup(){document.getElementById('topup-modal').classList.add('open')}
function closeTopup(){document.getElementById('topup-modal').classList.remove('open')}
function addGems(n){
  state.gems+=n;
  updateUI();save();
  closeTopup();
  showToast(`+${n.toLocaleString()} gems added`);
}

function confirmReset(){
  if(confirm('Reset all progress? This cannot be undone.')){
    state={gems:STARTING_GEMS,pity:0,totalPulls:0,inventory:[],history:[]};
    document.getElementById('reveal-placeholder').style.display='';
    document.getElementById('reveal-cards').style.display='none';
    document.getElementById('reveal-cards').innerHTML='';
    document.getElementById('reveal-area').style.boxShadow='';
    updateUI();save();
    showToast('Save reset');
  }
}

let toastTimer;
function showToast(msg,isSSR=false){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.className='toast'+(isSSR?' ssr-toast':'');
  clearTimeout(toastTimer);
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>t.classList.add('show'));
  });
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

const topupModal=document.getElementById('topup-modal');
if(topupModal){
  topupModal.addEventListener('click',function(e){
    if(e.target===this)closeTopup();
  });
}

updateUI();