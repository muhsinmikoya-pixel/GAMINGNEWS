import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const db=createClient('https://feiyuiypwjddbypttwwj.supabase.co','sb_publishable_Qvqi5ZLdxSgohxzALB3rCA_Wx8FVV74');
const $=s=>document.querySelector(s);
$('#menuBtn').addEventListener('click',()=>$('#nav').classList.toggle('open'));\n$('#nav').addEventListener('click',e=>{if(e.target.closest('a'))$('#nav').classList.remove('open');});
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let currentUser=null,isAdmin=false;
function status(sel,msg){$(sel).textContent=msg;}
function isOpen(g){const now=Date.now();return g.status==='active'&&new Date(g.starts_at).getTime()<=now&&new Date(g.ends_at).getTime()>=now;}
async function loadGiveaways(){
 const {data,error}=await db.from('giveaways').select('*').order('created_at',{ascending:false});
 const host=$('#giveaways');
 if(error){host.innerHTML='<div class="empty-state">Could not load giveaways right now. Please refresh.</div>';return;}
 const visible=(data||[]).filter(g=>g.status!=='draft');
 if(!visible.length){host.innerHTML='<div class="empty-state">No giveaways are live right now. Check back soon!</div>';return;}
 host.innerHTML=visible.map(g=>{const open=isOpen(g),ended=g.status==='ended'||new Date(g.ends_at).getTime()<Date.now();const label=open?'OPEN':ended?'ENDED':'UPCOMING';return '<article class="giveaway"><div class="giveaway-img">'+(g.image_url?'<img src="'+esc(g.image_url)+'" alt="'+esc(g.prize)+'">':'<span>GIVEAWAY</span>')+'</div><div class="giveaway-body"><span class="giveaway-tag">'+label+'</span><h3>'+esc(g.title)+'</h3><div class="prize">PRIZE: '+esc(g.prize)+'</div><p>'+esc(g.description)+'</p><p><b>Ends:</b> '+new Date(g.ends_at).toLocaleString()+'</p>'+(g.winner_username?'<p><b>Winner:</b> '+esc(g.winner_username)+'</p>':'')+(open?'<form class="entry-form" data-entry="'+g.id+'"><input name="username" minlength="3" maxlength="20" pattern="[A-Za-z0-9_]+" placeholder="Your Roblox username" required><button>ENTER</button></form><div class="entry-status" id="entry-'+g.id+'">One entry per Roblox username.</div>':'<div class="entry-status">'+(ended?'Entries are closed.':'Entries open at the start time.')+'</div>')+'</div></article>';}).join('');
 host.querySelectorAll('[data-entry]').forEach(form=>form.addEventListener('submit',enterGiveaway));
}
async function enterGiveaway(e){
 e.preventDefault();const form=e.currentTarget,id=form.dataset.entry,username=new FormData(form).get('username').trim();
 const note=$('#entry-'+id);note.textContent='Submitting entry…';const {error}=await db.from('giveaway_entries').insert({giveaway_id:id,roblox_username:username});
 if(error){note.textContent=error.code==='23505'?'This Roblox username has already entered.':error.message.includes('row-level security')?'Entries are not open for this giveaway.':error.message;return;}
 note.textContent='Entry received! Good luck.';form.reset();
}
async function checkAdmin(){
 const {data:{session}}=await db.auth.getSession();if(!session)return;
 currentUser=session.user;
 const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',currentUser.id).maybeSingle();
 if(error||!data){await db.auth.signOut();status('#loginStatus','This account is not an authorized admin yet. Please complete admin setup in Supabase.');return;}
 isAdmin=true;$('#adminLogin').classList.add('hidden');$('#adminDashboard').classList.remove('hidden');await loadAdminGiveaways();
}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();status('#loginStatus','Signing in…');const {error}=await db.auth.signInWithPassword({email:$('#adminEmail').value.trim(),password:$('#adminPassword').value});if(error){status('#loginStatus',error.message);return;}await checkAdmin();});
$('#giveawayForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!isAdmin)return;const f=new FormData(e.currentTarget);const starts=new Date(f.get('starts_at')),ends=new Date(f.get('ends_at'));
 if(!(ends>starts)){status('#createStatus','End time must be after start time.');return;}
 const row={title:String(f.get('title')).trim(),prize:String(f.get('prize')).trim(),description:String(f.get('description')).trim(),image_url:String(f.get('image_url')||'').trim()||null,starts_at:starts.toISOString(),ends_at:ends.toISOString(),status:'active',created_by:currentUser.id};
 const {error}=await db.from('giveaways').insert(row);status('#createStatus',error?.message||'Giveaway published!');if(!error){e.currentTarget.reset();await loadGiveaways();await loadAdminGiveaways();}
});
async function loadAdminGiveaways(){
 const {data,error}=await db.from('giveaways').select('*').order('created_at',{ascending:false});if(error){status('#manageStatus',error.message);return;}
 const host=$('#adminGiveaways');if(!data?.length){host.innerHTML='<p class="muted">No giveaways created yet.</p>';return;}
 host.innerHTML='';
 for(const g of data){
  const {count}=await db.from('giveaway_entries').select('*',{count:'exact',head:true}).eq('giveaway_id',g.id);
  const el=document.createElement('div');el.className='admin-entry-item';el.innerHTML='<div><b>'+esc(g.title)+'</b><small>'+esc(g.status.toUpperCase())+' · '+(count??0)+' entries · Prize: '+esc(g.prize)+'</small></div><div><button data-entries="'+g.id+'">VIEW ENTRIES</button> <button data-end="'+g.id+'">END</button></div>';host.appendChild(el);
 }
 host.querySelectorAll('[data-entries]').forEach(b=>b.addEventListener('click',()=>showEntries(b.dataset.entries)));
 host.querySelectorAll('[data-end]').forEach(b=>b.addEventListener('click',async()=>{const g=data.find(x=>x.id===b.dataset.end);const winner=prompt('Winner Roblox username (leave blank if not selected yet):',g.winner_username||'');if(winner===null)return;const {error}=await db.from('giveaways').update({status:'ended',winner_username:winner.trim()||null,updated_at:new Date().toISOString()}).eq('id',g.id);status('#manageStatus',error?.message||'Giveaway ended and winner saved.');await loadGiveaways();await loadAdminGiveaways();}));
}
async function showEntries(id){
 const {data,error}=await db.from('giveaway_entries').select('roblox_username,created_at').eq('giveaway_id',id).order('created_at',{ascending:true});
 if(error){status('#manageStatus',error.message);return;}
 status('#manageStatus',(data||[]).map((x,i)=>(i+1)+'. '+x.roblox_username+' — '+new Date(x.created_at).toLocaleString()).join('\n')||'No entries yet.');
}
db.auth.onAuthStateChange(()=>{});
loadGiveaways();checkAdmin();
db.channel('giveaway-feed').on('postgres_changes',{event:'*',schema:'public',table:'giveaways'},loadGiveaways).subscribe();
