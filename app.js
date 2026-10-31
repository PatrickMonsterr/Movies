const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LS={get(k,d){try{const x=localStorage.getItem(k);return x===null?d:x}catch(e){return d}},set(k,x){try{localStorage.setItem(k,x)}catch(e){}}};
const CATS=[
{key:'foundations',name:'Podstawy',short:'Pod',weight:.30,subs:['Scenariusz','Reżyseria','Struktura i tempo'],q:'Czy fabuła jest spójna? Czy tempo nie dłuży się ani nie goni? Czy film był prowadzony pewną ręką?'},
{key:'imagery',name:'Obraz i dźwięk',short:'Obr',weight:.20,subs:['Zdjęcia','Dźwięk','Muzyka','Scenografia i kostiumy'],q:'Czy zapadł mi w pamięć jakiś kadr? Czy dźwięk i muzyka pomagały? Czy dobrze słyszałem dialogi?'},
{key:'story',name:'Warstwy fabuły',short:'Fab',weight:.25,subs:['Postacie','Dialogi','Oryginalność'],q:'Czy postacie mają motywacje i się zmieniają? Czy dialogi ujawniają charakter? Czy pomysł jest świeży?'},
{key:'motion',name:'Dynamika',short:'Dyn',weight:.15,subs:['Montaż','Płynność przejść','Napięcie i energia scen'],q:'Czy sprawdzałem telefon lub zegarek? Czy montaż budował napięcie we właściwych momentach? Czy dało się śledzić akcję?'},
{key:'subtext',name:'Podtekst',short:'Pdt',weight:.10,subs:['Tematy','Symbolika','Co zostaje po seansie'],q:'Czy film mówi o czymś więcej niż fabuła? Czy wracam do niego myślami? Czy symbole budują znaczenie?'}];
const DESC={0:'',1:'fatalne',2:'bardzo słabe',3:'słabe, razi',4:'poniżej średniej',5:'przeciętne',6:'przyzwoite',7:'dobre',8:'bardzo dobre',9:'wybitne',10:'bezbłędne, arcydzieło'};
const STEPS=['Film',...CATS.map(c=>c.name),'Podsumowanie'];
let movies=[];try{movies=JSON.parse(LS.get('films_ratings','[]'))||[]}catch(e){movies=[]}
let mode=LS.get('films_mode','step'),theme=LS.get('films_theme','auto'),step=0,editing=null,picked=null;
const v={},na={},subOn={},sub={};
const save=()=>LS.set('films_ratings',JSON.stringify(movies));
const col=x=>`hsl(${Math.round((Math.max(1,x)-1)/9*120)},62%,40%)`;
const esc=s=>{const d=document.createElement('div');d.textContent=s;return d.innerHTML};
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const catScore=k=>na[k]?null:(subOn[k]?mean(sub[k]):v[k]);
const scoresNow=()=>{const o={};CATS.forEach(c=>o[c.key]=catScore(c.key));return o};
function filmsScore(sc){let s=0,w=0;CATS.forEach(c=>{const x=sc[c.key];if(typeof x==='number'){s+=x*c.weight;w+=c.weight}});return w>0?s/w:null}
const toLB=f=>Math.round(f)/2;
const stars=x=>x===null?'':'★'.repeat(Math.floor(x))+(x%1>=.5?'½':'');
function borderOpts(f){const fr=f-Math.floor(f);return Math.abs(fr-.5)<=.15?[Math.floor(f)/2,(Math.floor(f)+1)/2]:null}

function build(){
 const gut='<option value="">— nie wpisuję —</option>'+[...Array(10)].map((_,i)=>`<option value="${(i+1)/2}">${(i+1)/2}★</option>`).join('');
 let h=`<section class="blk" data-b="0"><div class="lbl">Tytuł filmu</div><input type="text" id="title" placeholder="np. Incepcja (2010)" autocomplete="off"><div class="lbl">Data obejrzenia</div><input type="date" id="date"><div class="lbl">Test intuicji: ile gwiazdek czujesz? (opcjonalnie, przed oceną)</div><select id="gut">${gut}</select></section>`;
 CATS.forEach((c,i)=>{const k=c.key;
  h+=`<section class="blk" data-b="${i+1}"><div class="lblrow"><h3>${c.name} <small>${Math.round(c.weight*100)}%</small></h3><label class="na"><input type="checkbox" id="n_${k}"> nie dotyczy</label></div><div class="qtxt">${c.q}</div><div class="btns" id="b_${k}">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button type="button" data-k="${k}" data-n="${n}">${n}</button>`).join('')}</div><div class="desc" id="d_${k}"></div><button type="button" class="chip" data-sub="${k}" id="sb_${k}">Podkategorie ▾</button><div class="subs" id="sub_${k}" hidden>${c.subs.map((n,j)=>`<div class="subrow"><span>${n}</span><input type="range" min="1" max="10" id="ss_${k}_${j}" data-ss="${k}:${j}"><b id="sv_${k}_${j}"></b></div>`).join('')}</div></section>`});
 h+=`<section class="blk" data-b="6"><div id="pv" class="pv"></div><details id="more"><summary>Więcej opcji</summary><div class="lbl">Status oceny</div><select id="status"><option value="pre">Wstępna (zaraz po seansie)</option><option value="final">Ostateczna</option></select><div class="lbl">Przyjemność (nie liczy się do oceny): <b id="ev">7</b></div><input type="range" min="1" max="10" id="enjoy" value="7"><div class="lbl">Notatki</div><textarea id="notes" placeholder="np. najlepszy montaż dźwięku w tym roku"></textarea></details></section>`;
 $('#app').innerHTML=h;
}

function refresh(){
 CATS.forEach(c=>{const k=c.key,s=catScore(k),r=s===null?0:Math.round(s);
  $('#n_'+k).checked=na[k];
  $$('#b_'+k+' button').forEach(b=>{const n=+b.dataset.n,on=!na[k]&&n===v[k];b.classList.toggle('on',on);b.style.background=on?col(n):''});
  $('#b_'+k).hidden=subOn[k]&&!na[k];$('#b_'+k).classList.toggle('dim',na[k]);
  $('#d_'+k).innerHTML=na[k]?'nie dotyczy — kategoria pominięta w wyniku':(subOn[k]?`średnia z podkategorii: <b style="color:${col(s)}">${s.toFixed(1)}</b> · `:'')+DESC[r];
  $('#sub_'+k).hidden=!subOn[k]||na[k];
  $('#sb_'+k).textContent=subOn[k]?'Podkategorie ▴ (średnia)':'Podkategorie ▾';
  c.subs.forEach((n,j)=>{$(`#sv_${k}_${j}`).textContent=sub[k][j];$(`#ss_${k}_${j}`).value=sub[k][j]});
 });
 const f=filmsScore(scoresNow()),opts=f===null?null:borderOpts(f);
 if(!opts||(picked!==null&&!opts.includes(picked)))picked=null;
 const shown=f===null?null:(picked!==null?picked:toLB(f));
 let h=f===null?'Oceń przynajmniej jedną kategorię.':`<div class="big"><b style="background:${col(f)}">${f.toFixed(2)}</b> / 10 <span class="stars">${stars(shown)}</span> ${shown}★</div>`;
 if(opts)h+=`<div class="hint">Wynik na granicy gwiazdek — wybierz według odczucia:</div><div class="optrow">${opts.map(o=>`<button type="button" class="opt${o===shown?' sel':''}" data-o="${o}">${o}★</button>`).join('')}</div>`;
 const g=parseFloat($('#gut').value);
 if(shown!==null&&!isNaN(g)&&Math.abs(g-shown)>=1)h+=`<div class="warn">Intuicja (${g}★) różni się od wyniku (${shown}★) o ${Math.abs(g-shown)}★ — sprawdź, czy któraś kategoria nie zawyża lub zaniża oceny.</div>`;
 $('#pv').innerHTML=h;
 $('#bscore').innerHTML=f===null?'—':`<b style="background:${col(f)}">${f.toFixed(1)}</b><span class="stars">${stars(shown)}</span><span class="sm">${shown}★${opts&&picked===null?' ⚖':''}</span>`;
 document.body.className=mode;
 $$('.blk').forEach(b=>b.classList.toggle('cur',+b.dataset.b===step));
 $('#stepbar').innerHTML=`<div class="stxt">Krok ${step+1}/7 — ${STEPS[step]}</div><div class="prog"><i style="width:${(step+1)/7*100}%"></i></div>`;
 $('#prev').hidden=mode==='quick'||step===0;
 $('#next').textContent=(mode==='quick'||step===6)?(editing!==null?'Zapisz zmiany':'Zapisz'):'Dalej →';
 $('#ev').textContent=$('#enjoy').value;
 $('#banner').innerHTML=editing!==null&&movies[editing]?`<span>Edytujesz: <b>${esc(movies[editing].title||'')}</b></span><button class="chip" id="cancel">Anuluj</button>`:'';
 $('#modeBtn').textContent=mode==='step'?'Krok po kroku':'Szybki';
}
function resetForm(){CATS.forEach(c=>{v[c.key]=7;na[c.key]=false;subOn[c.key]=false;sub[c.key]=c.subs.map(()=>7)});picked=null;editing=null;step=0;
 $('#title').value='';$('#date').value=today();$('#gut').value='';$('#status').value='pre';$('#enjoy').value=7;$('#notes').value='';refresh()}
function startEdit(i){const m=movies[i];resetForm();editing=i;
 $('#title').value=m.title||'';$('#date').value=m.date||today();$('#gut').value=m.gut?String(m.gut):'';$('#status').value=m.status==='pre'?'pre':'final';$('#enjoy').value=m.enjoy||7;$('#notes').value=m.notes||'';
 CATS.forEach(c=>{const k=c.key,x=m.scores[k],sb=m.subs&&m.subs[k];na[k]=typeof x!=='number';if(sb){subOn[k]=true;sub[k]=[...sb]}v[k]=na[k]?7:Math.max(1,Math.round(x))});
 picked=typeof m.stars==='number'?m.stars:null;refresh();window.scrollTo(0,0)}
function doSave(){
 const title=$('#title').value.trim();if(!title){step=0;refresh();$('#title').focus();return}
 const sc=scoresNow();if(filmsScore(sc)===null){alert('Oceń przynajmniej jedną kategorię.');return}
 const subs={};CATS.forEach(c=>{if(subOn[c.key]&&!na[c.key])subs[c.key]=[...sub[c.key]]});
 const e={title,date:$('#date').value,scores:sc,subs,enjoy:+$('#enjoy').value,notes:$('#notes').value.trim(),gut:parseFloat($('#gut').value)||null,stars:picked,status:$('#status').value,created:(editing!==null&&movies[editing].created)||Date.now()};
 if(editing!==null)movies[editing]=e;else movies.push(e);
 save();resetForm();renderList();$('#list').scrollIntoView({behavior:'smooth'})}
function radar(sc){const R=40,C=56,n=5,pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[C+r*Math.cos(a),C+r*Math.sin(a)]},f=a=>a.map(x=>x.toFixed(1)).join(',');
 const ring=r=>CATS.map((_,i)=>f(pt(i,r))).join(' ');
 const val=CATS.map((c,i)=>f(pt(i,R*(typeof sc[c.key]==='number'?sc[c.key]:0)/10))).join(' ');
 const lab=CATS.map((c,i)=>{const[x,y]=pt(i,R+10);return`<text x="${x.toFixed(1)}" y="${(y+3).toFixed(1)}" text-anchor="middle">${c.short}</text>`}).join('');
 return`<svg viewBox="0 0 112 112" class="radar"><polygon points="${ring(R)}" class="rg"/><polygon points="${ring(R/2)}" class="rg"/><polygon points="${val}" class="rv"/>${lab}</svg>`}
function renderList(){const L=$('#list');
 if(!movies.length){L.innerHTML='<div class="empty">Brak ocenionych filmów. Dodaj pierwszy powyżej.</div>';return}
 L.innerHTML=movies.map((m,i)=>({m,i})).reverse().map(({m,i})=>{const f=filmsScore(m.scores);if(f===null)return'';
  const st=typeof m.stars==='number'?m.stars:toLB(f),pre=m.status==='pre',due=pre&&m.created&&Date.now()-m.created>864e5;
  const bd=CATS.map(c=>{const x=m.scores[c.key];return`<span>${c.name}: ${typeof x==='number'?Math.round(x*10)/10:'n/d'}${m.subs&&m.subs[c.key]?' ('+c.subs.map((n,j)=>n+' '+m.subs[c.key][j]).join(', ')+')':''}</span>`}).join('');
  return`<div class="movie"><div class="mtop"><div><div class="mt">${esc(m.title||'Bez tytułu')}</div><div class="md">${m.date||''}${pre?'<span class="pre">wstępna</span>':''}</div>${due?'<div class="hint">⏰ Minęła doba — zatwierdź lub popraw ocenę</div>':''}</div><div style="text-align:right"><div class="badge" style="background:${col(f)}">${f.toFixed(2)} / 10</div><div class="stars">${stars(st)} <span class="md">(${st}★)</span></div></div></div><div class="mid"><div class="bd">${bd}${m.enjoy?`<span>Przyjemność: ${m.enjoy}</span>`:''}</div>${radar(m.scores)}</div>${m.notes?`<div class="notes">${esc(m.notes)}</div>`:''}${pre?`<button class="act" data-ok="${i}">Zatwierdź</button>`:''}<button class="act" data-edit="${i}">Edytuj</button><button class="act del" data-del="${i}">Usuń</button></div>`}).join('')}

function onIn(e){const t=e.target;
 if(t.dataset.ss){const[k,j]=t.dataset.ss.split(':');sub[k][+j]=+t.value;refresh()}
 else if(t.id&&t.id.startsWith('n_')){na[t.id.slice(2)]=t.checked;refresh()}
 else if(t.id==='gut'||t.id==='enjoy')refresh()}
$('#app').addEventListener('input',onIn);$('#app').addEventListener('change',onIn);
$('#app').addEventListener('click',e=>{
 const b=e.target.closest('button[data-n]');if(b){v[b.dataset.k]=+b.dataset.n;refresh();return}
 const s=e.target.closest('[data-sub]');if(s){subOn[s.dataset.sub]=!subOn[s.dataset.sub];refresh();return}
 const o=e.target.closest('.opt');if(o){picked=+o.dataset.o;refresh()}});
$('#list').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.edit!==undefined)startEdit(+b.dataset.edit);
 else if(b.dataset.del!==undefined){const i=+b.dataset.del;movies.splice(i,1);if(editing===i)resetForm();save();renderList()}
 else if(b.dataset.ok!==undefined){movies[+b.dataset.ok].status='final';save();renderList()}});
$('#banner').addEventListener('click',e=>{if(e.target.id==='cancel')resetForm()});
$('#prev').onclick=()=>{step--;refresh();window.scrollTo(0,0)};
$('#next').onclick=()=>{if(mode==='step'&&step<6){if(step===0&&!$('#title').value.trim()){$('#title').focus();return}step++;refresh();window.scrollTo(0,0);return}doSave()};
function applyMode(){$('#more').open=mode==='step';refresh()}
$('#modeBtn').onclick=()=>{mode=mode==='step'?'quick':'step';LS.set('films_mode',mode);step=0;applyMode()};
function applyTheme(){document.documentElement.dataset.theme=theme==='auto'?'':theme;$('#themeBtn').textContent={auto:'◐ Auto',light:'☀ Jasny',dark:'☾ Ciemny'}[theme]}
$('#themeBtn').onclick=()=>{theme={auto:'light',light:'dark',dark:'auto'}[theme];LS.set('films_theme',theme);applyTheme()};
build();applyTheme();resetForm();applyMode();renderList();
