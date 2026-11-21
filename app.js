const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rp=n=>"Rp"+Math.round(n||0).toLocaleString("id-ID");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const fmtD=s=>{const[a,b,c]=s.split("-");return c+"/"+b+"/"+a};
const BL=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const KEY="aoabi_journal_v2";
const mkS=()=>({exp:[],ord:[],kas:[],todo:[],jr:{},ctl:[],bible:{},wish:[],cyc:{p:[],d:{},cl:28,pl:5},remi:[],bsn:[],rst:{op:'Aman',om:'Aman',car:'Oke'},kond:{},sim:{ao:{gaji:0,items:[]},abi:{gaji:0,items:[]}}});let S=mkS();const DEF=mkS();
try{let r=localStorage.getItem(KEY);if(r)Object.assign(S,JSON.parse(r));else{r=localStorage.getItem("lajoei_catatan_v1");if(r){const o=JSON.parse(r);S.exp=(o.exp||[]).map(x=>({...x,w:"Ao"}));S.ord=o.ord||[];S.kas=(o.kas||[]).map(x=>x.t=="mod"?{...x,t:"mAo"}:x);S.todo=o.todo||[];S.jr=o.jr||{};if(o.sim&&o.sim.items)S.sim.ao=o.sim}}}catch(e){}
const KEYS=['exp','ord','kas','todo','jr','ctl','bible','wish','cyc','remi','bsn','rst','kond','sim'];
let DB=null,lastJ={},tm=null;
const setSync=t=>{const e=document.getElementById('sync');if(e)e.textContent=t};
function push(){if(!DB)return;KEYS.forEach(k=>{const j=JSON.stringify(S[k]);if(j!==lastJ[k]){lastJ[k]=j;DB.doc(k).set({v:S[k]}).catch(()=>setSync('Gagal menyimpan ke server'))}})}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}clearTimeout(tm);tm=setTimeout(push,700)};
function initDb(){setSync('Data tersimpan di browser ini (localhost)')}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
let cur=ymd(new Date()),simP="ao",ctlF="Semua",vOver=null;
const tgl=$("#tgl"),bln=$("#bln"),thn=$("#thn");
const y0=new Date().getFullYear();
bln.innerHTML=BL.map((b,i)=>`<option value="${i+1}">${b}</option>`).join("");
thn.innerHTML=[y0-2,y0-1,y0,y0+1,y0+2].map(y=>`<option>${y}</option>`).join("");
function setDate(s){cur=s;vOver=null;tgl.value=s;const[y,m]=s.split("-");bln.value=+m;if(![...thn.options].some(o=>o.value==y))thn.add(new Option(y,y));thn.value=y;
 $("#hari").textContent=new Date(s+"T00:00").toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
 $$("form input[type=date]").forEach(i=>i.value=s);render()}
tgl.onchange=()=>tgl.value&&setDate(tgl.value);
const pick=()=>{const d=+cur.split("-")[2];const dt=new Date(thn.value,bln.value,0).getDate();setDate(thn.value+"-"+String(bln.value).padStart(2,"0")+"-"+String(Math.min(d,dt)).padStart(2,"0"))};
bln.onchange=pick;thn.onchange=pick;
const mon=()=>cur.slice(0,7);
const inM=a=>a.filter(x=>x.d.startsWith(mon())).sort((a,b)=>b.d.localeCompare(a.d));

$("#nav").onclick=e=>{const t=e.target.dataset.t;if(!t)return;$$("#nav button").forEach(b=>b.classList.toggle("on",b===e.target));$$(".sec").forEach(s=>s.classList.toggle("on",s.id===t));document.body.classList.toggle("lj",t=="lj")};
$$(".sub[data-k]").forEach(el=>el.onclick=e=>{const v=e.target.dataset.s;if(!v)return;const k=el.dataset.k;[...el.children].forEach(b=>b.classList.toggle("on",b===e.target));if(k=="sim")simP=v;$$(`[data-p^="${k}:"]`).forEach(p=>p.style.display=p.dataset.p==k+":"+v?"":"none");render()});

const fd=f=>Object.fromEntries(new FormData(f));
function add(id,list,fn){const f=$(id);f.onsubmit=e=>{e.preventDefault();S[list].push({id:uid(),...fn(fd(f))});save();f.reset();f.querySelectorAll("input[type=date]").forEach(i=>i.value=cur);render()}}
add("#fe","exp",v=>({d:v.d,w:v.w,k:v.k,n:v.n,j:+v.j}));
add("#fk","kas",v=>({d:v.d,t:v.t,n:v.n,j:+v.j}));
add("#fc","ctl",v=>({d:v.d,w:v.w,n:v.n}));
add("#fw","wish",v=>({w:v.w,n:v.n,ok:false}));
$("#fo").onsubmit=e=>{e.preventDefault();const v=fd(e.target);const o={id:uid(),d:v.d,c:v.c,p:v.p,h:+v.h,lunas:v.s=="Lunas"};if(o.lunas)S.kas.push({id:uid(),d:o.d,t:"in",n:"Pesanan "+o.c+": "+o.p,j:o.h,oid:o.id});S.ord.push(o);save();e.target.reset();e.target.querySelector("[type=date]").value=cur;render()};
$("#ft").onsubmit=e=>{e.preventDefault();S.todo.push({id:uid(),d:cur,n:fd(e.target).n,ok:false});save();e.target.reset();render()};
$("#fs").onsubmit=e=>{e.preventDefault();const v=fd(e.target);S.sim[simP].items.push({id:uid(),n:v.n,j:+v.j});save();e.target.reset();render()};
$("#gaji").oninput=e=>{S.sim[simP].gaji=+e.target.value;save();renderSim()};
$("#jr").oninput=e=>{S.jr[cur]=e.target.value;save()};
$("#imp").onclick=()=>{const nm=simP=="ao"?"Ao":"Abi",g={};inM(S.exp).filter(x=>x.w==nm).forEach(x=>g[x.k]=(g[x.k]||0)+x.j);S.sim[simP].items=Object.entries(g).map(([n,j])=>({id:uid(),n,j}));save();renderSim()};
["ao","abi"].forEach(p=>["r","n"].forEach(f=>$("#b"+f+"_"+p).oninput=e=>{((S.bible[cur]=S.bible[cur]||{})[p]=S.bible[cur][p]||{})[f]=e.target.value;save()}));

function del(list,id){S[list]=S[list].filter(x=>x.id!=id);save();render()}
function delOrd(id){S.ord=S.ord.filter(x=>x.id!=id);S.kas=S.kas.filter(k=>k.oid!=id);save();render()}
function toggleOrd(id){const o=S.ord.find(x=>x.id==id);o.lunas=!o.lunas;if(o.lunas)S.kas.push({id:uid(),d:cur>o.d?cur:o.d,t:"in",n:"Pesanan "+o.c+": "+o.p,j:o.h,oid:o.id});else S.kas=S.kas.filter(k=>k.oid!=id);save();render()}
function tg(list,id){const t=S[list].find(x=>x.id==id);t.ok=!t.ok;save();render()}
const X=(f,id)=>`<button class="x" aria-label="Hapus" onclick="${f}('${id}')">×</button>`;
const table=(h,rows,empty)=>rows.length?`<table><thead><tr>${h}</tr></thead><tbody>${rows.join("")}</tbody></table>`:`<div class="empty">${empty}</div>`;
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);

const KIT="Kejadian,Keluaran,Imamat,Bilangan,Ulangan,Yosua,Hakim-hakim,Rut,1 Samuel,2 Samuel,1 Raja-raja,2 Raja-raja,1 Tawarikh,2 Tawarikh,Ezra,Nehemia,Ester,Ayub,Mazmur,Amsal,Pengkhotbah,Kidung Agung,Yesaya,Yeremia,Ratapan,Yehezkiel,Daniel,Hosea,Yoel,Amos,Obaja,Yunus,Mikha,Nahum,Habakuk,Zefanya,Hagai,Zakharia,Maleakhi,Matius,Markus,Lukas,Yohanes,Kisah Para Rasul,Roma,1 Korintus,2 Korintus,Galatia,Efesus,Filipi,Kolose,1 Tesalonika,2 Tesalonika,1 Timotius,2 Timotius,Titus,Filemon,Ibrani,Yakobus,1 Petrus,2 Petrus,1 Yohanes,2 Yohanes,3 Yohanes,Yudas,Wahyu".split(",");
const AYAT=[["Yohanes 3:16","Allah begitu mengasihi dunia sehingga memberikan Anak-Nya, supaya setiap orang yang percaya beroleh hidup kekal."],["Mazmur 23:1","Tuhan adalah gembalaku, aku tidak akan kekurangan."],["Filipi 4:13","Dalam Kristus yang memberi kekuatan, aku sanggup menghadapi segala perkara."],["Amsal 3:5","Percayalah kepada Tuhan dengan segenap hati, jangan bersandar pada pengertianmu sendiri."],["Yeremia 29:11","Tuhan punya rancangan damai sejahtera untuk kita, untuk memberi masa depan yang penuh harapan."],["Yosua 1:9","Kuatkan dan teguhkan hatimu, jangan takut, sebab Tuhan menyertaimu ke mana pun engkau pergi."],["Roma 8:28","Dalam segala hal Allah turut bekerja untuk kebaikan mereka yang mengasihi Dia."],["Matius 11:28","Yesus mengundang semua yang letih lesu untuk datang kepada-Nya dan mendapat kelegaan."],["Yesaya 41:10","Jangan takut, sebab Tuhan menyertai, menguatkan, dan menolong kita."],["1 Korintus 13:4","Kasih itu sabar dan murah hati."],["Filipi 4:6","Jangan khawatir akan apa pun, nyatakan keinginanmu kepada Allah dalam doa dengan ucapan syukur."],["Mazmur 46:2","Allah adalah tempat perlindungan dan kekuatan, penolong yang selalu siap dalam kesesakan."],["Pengkhotbah 4:9","Berdua lebih baik daripada seorang diri, sebab mereka mendapat upah yang baik dalam jerih payahnya."],["Amsal 16:3","Serahkan pekerjaanmu kepada Tuhan, maka rencanamu akan terlaksana."],["1 Tesalonika 5:16","Bersukacitalah senantiasa, berdoalah tiada henti, dan mengucap syukurlah dalam segala hal."],["Matius 6:33","Carilah dahulu Kerajaan Allah dan kebenarannya, maka semuanya itu akan ditambahkan kepadamu."],["Mazmur 121:2","Pertolonganku datang dari Tuhan yang menjadikan langit dan bumi."],["Roma 12:12","Bersukacitalah dalam pengharapan, sabar dalam kesesakan, dan bertekunlah dalam doa."],["Efesus 3:20","Allah sanggup melakukan jauh lebih banyak daripada yang kita doakan atau pikirkan."],["Galatia 6:9","Janganlah jemu berbuat baik, sebab pada waktunya kita akan menuai."]];
const link=r=>"https://alkitab.sabda.org/passage.php?passage="+encodeURIComponent(r);
$("#kt").innerHTML=KIT.map(k=>`<option>${k}</option>`).join("");
const upRd=()=>$("#rd").href=link($("#kt").value+" "+($("#ps").value||1));
$("#kt").onchange=upRd;$("#ps").oninput=upRd;upRd();
$("#vn").onclick=()=>{vOver=Math.floor(Math.random()*AYAT.length);renderBib()};
$$("[data-add]").forEach(b=>b.onclick=()=>{const p=b.dataset.add,i=$("#br_"+p),t=$("#kt").value+" "+($("#ps").value||1);i.value=i.value?i.value+", "+t:t;i.oninput({target:i})});
function renderBib(){
 const n=vOver!=null?vOver:[...cur].reduce((a,c)=>a*31+c.charCodeAt(0),7)%AYAT.length,[r,t]=AYAT[n];
 $("#vs").innerHTML=`<b>${r}</b><p>${t}</p><a href="${link(r)}" target="_blank" rel="noopener">Baca teks lengkap</a><br><br>`;
 const b=S.bible[cur]||{};["ao","abi"].forEach(p=>{$("#br_"+p).value=(b[p]||{}).r||"";$("#bn_"+p).value=(b[p]||{}).n||""})}

function render(){
 const em=inM(S.exp);
 $("#e1").textContent=rp(sum(S.exp.filter(x=>x.d==cur),x=>x.j));
 $("#e2").textContent=rp(sum(em,x=>x.j));
 $("#e3").textContent=rp(sum(em.filter(x=>x.w=="Ao"),x=>x.j));
 $("#e4").textContent=rp(sum(em.filter(x=>x.w=="Abi"),x=>x.j));
 $("#le").innerHTML=table("<th>Tanggal</th><th>Siapa</th><th>Kategori</th><th>Keterangan</th><th class=n>Jumlah</th><th></th>",
  em.map(x=>`<tr><td>${fmtD(x.d)}</td><td>${esc(x.w||"-")}</td><td><span class=tag>${esc(x.k)}</span></td><td>${esc(x.n)}</td><td class=n>${rp(x.j)}</td><td>${X("delExp",x.id)}</td></tr>`),"Belum ada pengeluaran di bulan ini. Isi form di atas untuk mulai mencatat.");
 const k=S.kas,sm=t=>sum(k.filter(x=>x.t==t),x=>x.j);
 const mAo=sm("mAo"),mAbi=sm("mAbi"),mi=sm("in"),mo=sm("out"),piut=sum(S.ord.filter(o=>!o.lunas),o=>o.h);
 $("#ljsum").innerHTML=`<div><small>Modal awal Ao</small><b>${rp(mAo)}</b></div><div><small>Modal awal Abi</small><b>${rp(mAbi)}</b></div><div><small>Uang masuk</small><b class=in>${rp(mi)}</b></div><div><small>Uang keluar</small><b class=out>${rp(mo)}</b></div><div><small>Saldo kas</small><b>${rp(mAo+mAbi+mi-mo)}</b></div><div><small>Laba (masuk - keluar)</small><b class="${mi-mo>=0?"in":"out"}">${rp(mi-mo)}</b></div><div><small>Belum dibayar</small><b>${rp(piut)}</b></div>`;
 $("#lo").innerHTML=table("<th>Tanggal</th><th>Customer</th><th>Pesanan</th><th class=n>Harga</th><th>Status</th><th></th>",
  [...S.ord].sort((a,b)=>b.d.localeCompare(a.d)).map(o=>`<tr><td>${fmtD(o.d)}</td><td>${esc(o.c)}</td><td>${esc(o.p)}</td><td class=n>${rp(o.h)}</td><td><button class="tag ${o.lunas?"ok":""}" onclick="toggleOrd('${o.id}')">${o.lunas?"Lunas":"Belum lunas"}</button></td><td>${X("delOrd",o.id)}</td></tr>`),"Belum ada pesanan. Catat nama customer dan pesanannya di atas.");
 const L={in:"Masuk",out:"Keluar",mAo:"Modal awal Ao",mAbi:"Modal awal Abi"};
 $("#lk").innerHTML=table("<th>Tanggal</th><th>Jenis</th><th>Keterangan</th><th class=n>Jumlah</th><th></th>",
  [...k].sort((a,b)=>b.d.localeCompare(a.d)).map(x=>`<tr><td>${fmtD(x.d)}</td><td class="${x.t=="out"?"out":x.t=="in"?"in":""}">${L[x.t]||"Modal"}</td><td>${esc(x.n)}</td><td class=n>${rp(x.j)}</td><td>${x.oid?"":X("delKas",x.id)}</td></tr>`),"Kas masih kosong. Mulai dengan mencatat modal awal Ao dan Abi.");
 const t=S.todo.filter(x=>x.d==cur);
 $("#lt").innerHTML=t.length?t.map(x=>`<div class="todo ${x.ok?"d":""}"><input type=checkbox ${x.ok?"checked":""} onchange="tg('todo','${x.id}')" aria-label="Selesai"><span>${esc(x.n)}</span>${X("delTodo",x.id)}</div>`).join(""):`<div class="empty">Belum ada rencana untuk tanggal ini.</div>`;
 $("#jr").value=S.jr[cur]||"";
 const P=["Semua","Papa","Mama","Ao Ao","Abi","Ii Ucy"];
 $("#cf").innerHTML=P.map(p=>`<button class="${p==ctlF?"on":""}" onclick="ctlF='${p}';render()">${p}</button>`).join("");
 const today=ymd(new Date());
 $("#lc").innerHTML=table("<th>Tanggal</th><th>Siapa</th><th>Keterangan</th><th>Status</th><th></th>",
  S.ctl.filter(c=>ctlF=="Semua"||c.w==ctlF).sort((a,b)=>a.d.localeCompare(b.d)).map(c=>`<tr><td>${fmtD(c.d)}</td><td><span class="tag bl">${esc(c.w)}</span></td><td>${esc(c.n)}</td><td><button class="tag ${c.ok?"ok":""}" onclick="tg('ctl','${c.id}')">${c.ok?"Sudah":c.d<today?"Terlewat":"Akan datang"}</button></td><td>${X("delCtl",c.id)}</td></tr>`),"Belum ada jadwal kontrol. Pilih nama dan tanggalnya di atas.");
 ["Ao","Abi"].forEach(w=>{const a=S.wish.filter(x=>x.w==w);$("#wl_"+w).innerHTML=a.length?a.map(x=>`<div class="todo ${x.ok?"d":""}"><span>${esc(x.n)}</span><button class="tag ${x.ok?"ok":""}" onclick="tg('wish','${x.id}')">${x.ok?"Tercapai":"Dalam doa"}</button>${X("delWish",x.id)}</div>`).join(""):`<div class="empty">Belum ada wishlist.</div>`});
 renderBib();renderSim();renderCyc();renderRem();
}
const delExp=id=>del("exp",id),delKas=id=>del("kas",id),delTodo=id=>del("todo",id),delCtl=id=>del("ctl",id),delWish=id=>del("wish",id);
function delSim(id){S.sim[simP].items=S.sim[simP].items.filter(x=>x.id!=id);save();renderSim()}
function renderSim(){
 const q=S.sim[simP],g=q.gaji||0,tot=sum(q.items,x=>x.j),sisa=g-tot;
 $("#simh").textContent="Gaji "+(simP=="ao"?"Ao":"Abi");
 const nm=simP=='ao'?'Ao':'Abi',ac={};
 inM(S.exp).forEach(x=>{const v=x.w==nm?x.j:x.w=='Bersama'?x.j/2:0;if(v)ac[x.k]=(ac[x.k]||0)+v});
 const at=sum(Object.values(ac),v=>v);
 $('#real').innerHTML=`<h3>Realisasi bulan ${BL[+mon().slice(5)-1]}</h3><p class=note>Terhubung otomatis dengan menu Pengeluaran. Pengeluaran Bersama dibagi dua.</p>`+table('<th>Kategori</th><th class=n>Aktual</th><th class=n>% gaji</th>',Object.entries(ac).map(([k,v])=>`<tr><td>${esc(k)}</td><td class=n>${rp(v)}</td><td class=n>${g?(v/g*100).toFixed(1):0}%</td></tr>`),'Belum ada pengeluaran atas nama '+nm+' bulan ini.')+`<div class=row style='justify-content:space-between;margin-top:10px'><b>Total aktual</b><b class=out>${rp(at)}</b></div><div class=row style='justify-content:space-between'><span>Sisa gaji (aktual)</span><b class='${g-at>=0?'in':'out'}'>${rp(g-at)}</b></div><div class=row style='justify-content:space-between'><span>Dibanding rencana</span><b class='${at<=tot?'in':'out'}'>${at<=tot?'Hemat ':'Lebih '}${rp(Math.abs(at-tot))}</b></div>`;
 if(document.activeElement!==$("#gaji"))$("#gaji").value=g||"";
 $("#ssum").innerHTML=`<div><small>Gaji</small><b>${rp(g)}</b></div><div><small>Total pengeluaran</small><b class=out>${rp(tot)}</b></div><div><small>Sisa / tabungan</small><b class="${sisa>=0?"in":"out"}">${rp(sisa)}</b></div><div><small>Pengeluaran dari gaji</small><b>${g?Math.round(tot/g*100):0}%</b></div>`;
 $("#ls").innerHTML=table("<th>Pos</th><th class=n>Jumlah</th><th class=n>% gaji</th><th></th>",q.items.map(x=>`<tr><td>${esc(x.n)}</td><td class=n>${rp(x.j)}</td><td class=n>${g?(x.j/g*100).toFixed(1):0}%</td><td>${X("delSim",x.id)}</td></tr>`),"Belum ada pos pengeluaran. Tambahkan sewa, makan, transport, dan lainnya.");
 $("#rule").innerHTML=`<h3>Pembanding 50/30/20</h3><p class=note>Patokan umum: 50% kebutuhan, 30% keinginan, 20% tabungan.</p>`+[["Kebutuhan",.5],["Keinginan",.3],["Tabungan",.2]].map(([n,p])=>`<div class=row style="justify-content:space-between;margin-top:8px"><span>${n}</span><span>${rp(g*p)}</span></div><div class=bar><i style="width:${p*100}%"></i></div>`).join("")+`<p class=note>${g?(sisa/g>=.2?"Sisa gaji sudah mencapai 20% atau lebih.":"Sisa gaji masih di bawah 20%."):"Isi gaji untuk melihat perbandingan."}</p>`;
}
const dn=s=>Math.round(Date.parse(s+'T00:00:00Z')/864e5),ds=n=>new Date(n*864e5).toISOString().slice(0,10),fm=n=>fmtD(ds(n));
const PH={mens:['Menstruasi','c-mens'],fol:['Folikuler','c-fol'],ovu:['Ovulasi dan masa subur','c-ovu'],lut:['Luteal','c-lut']};
$('#leg').innerHTML=Object.values(PH).map(([n,c])=>`<span class='tag ${c}'>${n}</span>`).join('')+`<span class='tag'>♥ intim</span>`;
const FI={mens:{r:['Kram perut atau nyeri punggung bawah','Mudah lelah dan energi turun','Sakit kepala atau mood sensitif'],b:['Istirahat cukup','Kompres hangat di perut','Makanan bergizi dan zat besi (sayur hijau, telur, daging)','Minum air hangat'],a:['Tawarkan bantu pekerjaan rumah','Belikan minuman hangat atau camilan favorit','Tanya apa yang paling membantu']},fol:{r:['Energi dan mood cenderung naik','Lebih semangat dan fokus','Kulit biasanya lebih baik'],b:['Manfaatkan untuk olahraga dan aktivitas berat','Makan seimbang dengan protein cukup'],a:['Waktu yang pas untuk ajak jalan atau punya rencana seru berdua']},ovu:{r:['Libido bisa meningkat','Lendir serviks lebih bening dan licin','Sebagian merasa nyeri ringan di satu sisi perut','Energi dan percaya diri tinggi'],b:['Minum air cukup','Kesepakatan berdua soal pengaman atau program hamil'],a:['Ini masa subur, bicarakan pengaman atau rencana kehamilan dengan jelas']},lut:{r:['Mood naik turun, mudah sensitif atau cemas (PMS)','Cepat lelah dan sulit tidur','Payudara nyeri dan perut kembung','Ingin makan manis atau asin','Jerawat dan sakit kepala bisa muncul menjelang haid'],b:['Tidur cukup dan waktu tenang','Kurangi kafein, garam, dan gula berlebih','Banyak minum air, makan sayur dan kacang-kacangan','Olahraga ringan seperti jalan atau yoga','Dukungan emosional dan tidak dituntut berlebihan'],a:['Lebih sabar dan dengarkan tanpa buru-buru memberi solusi','Bantu kurangi beban kerjaan dan urusan rumah','Siapkan camilan dan minuman hangat','Jangan ambil hati kalau mood berubah']}};
function cycAvg(){const st=S.cyc.p.map(p=>dn(p.s)).sort((a,b)=>a-b);if(st.length<2)return S.cyc.cl;const d=[];for(let i=1;i<st.length;i++)d.push(st[i]-st[i-1]);const l=d.slice(-6);return Math.round(sum(l,x=>x)/l.length)}
function phaseOf(date){
 const ps=[...S.cyc.p].sort((a,b)=>a.s.localeCompare(b.s)),n=dn(date);let i=-1;
 ps.forEach((p,j)=>{if(dn(p.s)<=n)i=j});if(i<0)return null;
 const s=dn(ps[i].s),last=i==ps.length-1,cl=last?cycAvg():dn(ps[i+1].s)-s;
 let diff=n-s,proj=false;if(last&&diff>=cl){proj=true;diff%=cl}
 const cd=diff+1,pl=ps[i].e&&!proj?dn(ps[i].e)-s+1:S.cyc.pl,ov=Math.max(pl+3,cl-14);
 const ph=cd<=pl?'mens':cd<ov-5?'fol':cd<=ov+1?'ovu':'lut';
 return{ph,cd,ov,pred:proj||n>dn(ymd(new Date()))}}
function renderCyc(){
 const y=+cur.slice(0,4),m=+cur.slice(5,7),off=new Date(Date.UTC(y,m-1,1)).getUTCDay(),dim=new Date(Date.UTC(y,m,0)).getUTCDate(),tdy=ymd(new Date());
 $('#cm').textContent=BL[m-1]+' '+y;
 let h=['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d=>`<b>${d}</b>`).join('');
 for(let i=0;i<off;i++)h+='<i></i>';
 for(let d=1;d<=dim;d++){const s=y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'),p=phaseOf(s),dd=S.cyc.d[s]||{};
  h+=`<button type='button' class='${p?PH[p.ph][1]:''} ${p&&p.pred?'pr':''} ${s==cur?'sel':''} ${s==tdy?'td':''} ${p&&p.ph=='ovu'&&p.cd==p.ov?'ov':''}' onclick="setDate('${s}')">${d}${dd.x?'<em>♥</em>':''}</button>`}
 $('#cal').innerHTML=h;
 const p=phaseOf(cur),dd=S.cyc.d[cur]||{};
 $('#cdh').textContent=new Date(cur+'T00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
 $('#cdp').textContent=p?`Fase ${PH[p.ph][0]}, hari ke-${p.cd} siklus${p.pred?' (perkiraan)':''}.`:'Belum ada data haid. Catat hari pertama haid untuk mulai melacak.';
 $('#fi').innerHTML=p?(()=>{const f=FI[p.ph],L=a=>'<ul style="margin:4px 0 10px;padding-left:20px">'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>';return `<h3>Fase ${PH[p.ph][0]}</h3><b>Yang mungkin dirasakan</b>${L(f.r)}<b>Yang dibutuhkan</b>${L(f.b)}<b>Tips untuk Abi</b>${L(f.a)}<p class=note>Tiap orang berbeda. Kalau nyeri sangat berat atau siklus tidak teratur, konsultasikan ke dokter.</p>`})():`<h3>Info fase</h3><div class=empty>Muncul setelah hari pertama haid dicatat.</div>`;
 $('#sx').checked=!!dd.x;$('#pg').value=dd.pg||'';if(document.activeElement!==$('#cn2'))$('#cn2').value=dd.n||'';
 if(document.activeElement!==$('#cl'))$('#cl').value=S.cyc.cl;if(document.activeElement!==$('#pl'))$('#pl').value=S.cyc.pl;
 const asc=[...S.cyc.p].sort((a,b)=>a.s.localeCompare(b.s)),avg=cycAvg(),tn=dn(tdy);
 let st='';if(asc.length){let ns=dn(asc[asc.length-1].s)+avg;while(ns<=tn)ns+=avg;st=`<div><small>Haid berikutnya (perkiraan)</small><b>${fm(ns)}</b></div><div><small>Ovulasi (perkiraan)</small><b>${fm(ns-14)}</b></div>`}
 $('#cs').innerHTML=`<div><small>Rata-rata siklus</small><b>${avg} hari</b></div><div><small>Fase tanggal terpilih</small><b>${p?PH[p.ph][0].split(' ')[0]:'-'}</b></div>`+st;
 $('#chl').innerHTML=table('<th>Mulai</th><th>Selesai</th><th class=n>Lama haid</th><th class=n>Siklus</th><th></th>',[...asc].reverse().map(q=>{const nx=asc[asc.indexOf(q)+1];return `<tr><td>${fmtD(q.s)}</td><td>${q.e?fmtD(q.e):'-'}</td><td class=n>${q.e?dn(q.e)-dn(q.s)+1+' hari':'-'}</td><td class=n>${nx?dn(nx.s)-dn(q.s)+' hari':'-'}</td><td>${X('delCyc',q.id)}</td></tr>`}),'Belum ada riwayat haid. Tekan Haid mulai hari ini di tanggal pertama haid.');
}
const delCyc=id=>{S.cyc.p=S.cyc.p.filter(p=>p.id!=id);save();render()};
function shiftM(k){setDate(new Date(Date.UTC(+cur.slice(0,4),+cur.slice(5,7)-1+k,1)).toISOString().slice(0,10))}
$('#cp').onclick=()=>shiftM(-1);$('#cnx').onclick=()=>shiftM(1);
$('#hs').onclick=()=>{if(!S.cyc.p.some(p=>p.s==cur)){S.cyc.p.push({id:uid(),s:cur,e:''});save();render()}};
$('#he').onclick=()=>{const c=[...S.cyc.p].filter(p=>p.s<=cur).sort((a,b)=>b.s.localeCompare(a.s))[0];if(c){c.e=cur;save();render()}};
const dset=(k,v)=>{const o=S.cyc.d[cur]=S.cyc.d[cur]||{};o[k]=v;save()};
$('#sx').onchange=e=>{dset('x',e.target.checked);renderCyc()};
$('#pg').onchange=e=>dset('pg',e.target.value);
$('#cn2').oninput=e=>dset('n',e.target.value);
$('#cl').oninput=e=>{S.cyc.cl=+e.target.value||28;save();renderCyc()};
$('#pl').oninput=e=>{S.cyc.pl=+e.target.value||5;save();renderCyc()};
const DN=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
const wkStart=s=>ds(dn(s)-((new Date(s+'T00:00:00Z').getUTCDay()+6)%7));
const delRem=id=>del('remi',id),delBsn=id=>del('bsn',id);
const remRow=(x,sd)=>`<div class='todo ${x.ok?'d':''}'><input type='checkbox' ${x.ok?'checked':''} onchange="tg('remi','${x.id}')" aria-label='Selesai'><span><span class='tag bl'>${esc(x.c)}</span> ${x.n?esc(x.n)+': ':''}${esc(x.t)}${sd?' ('+fmtD(x.d)+')':''}</span>${X('delRem',x.id)}</div>`;
const rows=a=>a.length?a.map(x=>remRow(x)).join(''):`<div class=empty>Belum ada rencana.</div>`;
const srt=a=>[...a].sort((x,y)=>x.d.localeCompare(y.d));
function renderRem(){
 const ws=wkStart(cur),w0=dn(ws),we=ds(w0+6),R=S.remi,al=[];
 if(S.rst.op!='Aman')al.push('Obat Papa: '+S.rst.op);if(S.rst.om!='Aman')al.push('Obat Mama: '+S.rst.om);if(S.rst.car!='Oke')al.push('Mobil: '+S.rst.car);
 $('#rkh').textContent=fmtD(ws)+' sampai '+fmtD(we);
 $('#rka').innerHTML=`<div style='margin-bottom:8px'>${al.length?al.map(a=>`<span class='tag' style='margin-right:6px'>${a}</span>`).join(''):'Obat dan mobil aman.'}</div>`;
 $('#rkw').innerHTML=[['Sabtu',ds(w0+5)],['Minggu',we]].map(([n,d])=>`<b>${n} ${fmtD(d)}</b>${rows(R.filter(x=>x.d==d))}`).join('');
 const old=srt(R.filter(x=>!x.ok&&x.d<ws));
 $('#rkl').style.display=old.length?'':'none';
 $('#rkl').innerHTML=old.length?`<h3>Belum selesai dari minggu sebelumnya</h3>`+old.map(x=>remRow(x,1)).join(''):'';
 const wk=srt(R.filter(x=>x.d>=ws&&x.d<=we));
 $('#rkd').innerHTML=`<h3>Semua rencana minggu ini</h3>`+(wk.length?DN.map((n,i)=>{const d=ds(w0+i),a=wk.filter(x=>x.d==d);return a.length?`<b>${n} ${fmtD(d)}</b>`+a.map(x=>remRow(x)).join(''):''}).join(''):`<div class=empty>Belum ada rencana minggu ini. Tambahkan di tab Daftar.</div>`);
 const kk=Object.keys(S.kond).filter(d=>d>=ws&&d<=we).sort();
 $('#rkk').innerHTML=`<h3>Kondisi Papa dan Mama</h3>`+(kk.length?kk.map(d=>`<div class=todo><span><b>${fmtD(d)}</b> Papa: ${esc(S.kond[d].p||'-')} | Mama: ${esc(S.kond[d].m||'-')}</span></div>`).join(''):`<div class=empty>Belum ada catatan kondisi minggu ini.</div>`);
 const k=S.kond[cur]||{};
 if(document.activeElement!==$('#kp'))$('#kp').value=k.p||'';if(document.activeElement!==$('#km'))$('#km').value=k.m||'';
 $('#so').value=S.rst.op;$('#sm').value=S.rst.om;$('#sc').value=S.rst.car;
 $('#rl').innerHTML=R.length?srt(R).map(x=>remRow(x,1)).join(''):`<div class=empty>Belum ada daftar. Isi form di atas untuk pasar, janji, kerjaan, atau titipan.</div>`;
 const bm=inM(S.bsn);
 $('#bs').innerHTML=`<div><small>Isi bensin bulan ini</small><b>${bm.length}x</b></div><div><small>Total liter</small><b>${sum(bm,x=>x.l||0).toFixed(1)} L</b></div><div><small>Total biaya</small><b>${rp(sum(bm,x=>x.j))}</b></div>`;
 $('#bl').innerHTML=table('<th>Tanggal</th><th class=n>Liter</th><th class=n>Biaya</th><th class=n>Odometer</th><th></th>',[...S.bsn].sort((a,b)=>b.d.localeCompare(a.d)).map(x=>`<tr><td>${fmtD(x.d)}</td><td class=n>${x.l||'-'}</td><td class=n>${rp(x.j)}</td><td class=n>${x.k?x.k+' km':'-'}</td><td>${X('delBsn',x.id)}</td></tr>`),'Belum ada catatan bensin. Bagian ini opsional.');
}
add('#fr','remi',v=>({d:v.d,c:v.c,n:v.n,t:v.t,ok:false}));
add('#fb','bsn',v=>({d:v.d,l:+v.l||0,j:+v.j,k:v.k}));
$('#wp').onclick=()=>setDate(ds(dn(cur)-7));$('#wn').onclick=()=>setDate(ds(dn(cur)+7));
const ksv=(f,v)=>{const o=S.kond[cur]=S.kond[cur]||{};o[f]=v;save();renderRem()};
$('#kp').oninput=e=>ksv('p',e.target.value);$('#km').oninput=e=>ksv('m',e.target.value);
$('#so').onchange=e=>{S.rst.op=e.target.value;save();renderRem()};
$('#sm').onchange=e=>{S.rst.om=e.target.value;save();renderRem()};
$('#sc').onchange=e=>{S.rst.car=e.target.value;save();renderRem()};
$('#bke').onclick=()=>{$('#bk').value=JSON.stringify(S);$('#bk').select();$('#bkm').textContent='Salin teks di atas dan simpan.'};
$('#bki').onclick=()=>{try{const o=JSON.parse($('#bk').value);KEYS.forEach(k=>{if(o[k]!==undefined)S[k]=o[k]});save();render();$('#bkm').textContent='Data berhasil diimpor.'}catch(e){$('#bkm').textContent='Teks cadangan tidak valid.'}};
initDb();
setDate(cur);
