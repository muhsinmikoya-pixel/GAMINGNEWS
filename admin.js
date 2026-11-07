import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabase = createClient('https://feiyuiypwjddbypttwwj.supabase.co','sb_publishable_Qvqi5ZLdxSgohxzALB3rCA_Wx8FVV74');
const $ = s => document.querySelector(s);
let currentUser = null;
function say(id,msg){ $(id).textContent=msg; }
function slugify(s){return s.toLowerCase().trim().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'post';}
async function checkSession(){
 const {data:{session}}=await supabase.auth.getSession();
 if(!session){$('#loginView').classList.remove('hidden');$('#dashboard').classList.add('hidden');return;}
 const {data:{user}}=await supabase.auth.getUser(); currentUser=user;
 const {data:admin,error}=await supabase.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
 if(error||!admin){await supabase.auth.signOut();$('#loginView').classList.remove('hidden');$('#dashboard').classList.add('hidden');say('#loginStatus','This account is not an authorized administrator.');return;}
 $('#loginView').classList.add('hidden');$('#dashboard').classList.remove('hidden');$('#whoami').textContent='SIGNED IN AS '+user.email;
 await Promise.all([loadGames(),loadArticles()]);
}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();say('#loginStatus','Signing in…');const {error}=await supabase.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});if(error){say('#loginStatus',error.message);return;}await checkSession();});
$('#logout').addEventListener('click',async()=>{await supabase.auth.signOut();location.reload();});
async function loadGames(){
 const {data,error}=await supabase.from('games').select('*').order('sort_order').order('name');
 if(error){say('#gameStatus',error.message);return;}
 $('#gamesList').innerHTML=(data||[]).map(g=>'<div class="admin-item"><div><b>'+esc(g.name)+'</b><small>'+esc(g.genre)+' · '+(g.published?'Visible':'Hidden')+'</small></div><button data-game="'+g.id+'">Delete</button></div>').join('')||'<p class="muted">No games yet.</p>';
 $('#gamesList').querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Delete this game?'))return;const {error}=await supabase.from('games').delete().eq('id',b.dataset.game);say('#gameStatus',error?.message||'Game deleted.');loadGames();}));
}
async function loadArticles(){
 const {data,error}=await supabase.from('articles').select('*').order('created_at',{ascending:false}).limit(30);
 if(error){say('#articleStatus',error.message);return;}
 $('#articlesList').innerHTML=(data||[]).map(a=>'<div class="admin-item"><div><b>'+esc(a.title)+'</b><small>'+esc(a.category)+' · '+esc(a.status)+'</small></div><button data-article="'+a.id+'">Delete</button></div>').join('')||'<p class="muted">No articles yet.</p>';
 $('#articlesList').querySelectorAll('[data-article]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Delete this article?'))return;const {error}=await supabase.from('articles').delete().eq('id',b.dataset.article);say('#articleStatus',error?.message||'Article deleted.');loadArticles();}));
}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
$('#gameForm').addEventListener('submit',async e=>{
 e.preventDefault();const f=new FormData(e.currentTarget);const name=String(f.get('name')).trim();
 const row={name,slug:slugify(name),genre:f.get('genre'),roblox_url:f.get('roblox_url')||null,thumbnail_url:f.get('thumbnail_url')||null,description:f.get('description')||'',featured:f.has('featured'),published:f.has('published'),sort_order:0};
 const {error}=await supabase.from('games').upsert(row,{onConflict:'slug'});say('#gameStatus',error?.message||'Game saved. Public catalog will refresh from the database.');if(!error){e.currentTarget.reset();loadGames();}
});
$('#articleForm').addEventListener('submit',async e=>{
 e.preventDefault();const f=new FormData(e.currentTarget);const title=String(f.get('title')).trim();const row={title,slug:slugify(title)+'-'+Date.now().toString(36),category:f.get('category'),game:f.get('game')||'Roblox',thumbnail_url:f.get('thumbnail_url')||null,summary:f.get('summary'),content:f.get('content'),status:'published',published_at:new Date().toISOString(),created_by:currentUser.id};
 const {error}=await supabase.from('articles').insert(row);say('#articleStatus',error?.message||'Article published.');if(!error){e.currentTarget.reset();loadArticles();}
});
supabase.auth.onAuthStateChange(()=>{});
checkSession();