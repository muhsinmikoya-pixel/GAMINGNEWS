import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabase = createClient('https://feiyuiypwjddbypttwwj.supabase.co','sb_publishable_Qvqi5ZLdxSgohxzALB3rCA_Wx8FVV74');
const fallbackGames=[
{id:'blox',name:'Blox Fruits',genre:'Action',description:'Adventure · RPG',symbol:'⚔',url:'https://www.roblox.com/games/2753915549/Blox-Fruits',thumbnail_url:''},
{id:'brookhaven',name:'Brookhaven RP',genre:'Social',description:'Roleplay · Social',symbol:'⌂',url:'https://www.roblox.com/games/4924922222/Brookhaven-RP',thumbnail_url:''},
{id:'adopt',name:'Adopt Me!',genre:'Social',description:'Pets · Social',symbol:'♡',url:'https://www.roblox.com/games/920587237/Adopt-Me',thumbnail_url:''},
{id:'murder',name:'Murder Mystery 2',genre:'Horror',description:'Mystery · Survival',symbol:'✦',url:'https://www.roblox.com/games/142823291/Murder-Mystery-2',thumbnail_url:''},
{id:'grow',name:'Grow a Garden',genre:'Simulation',description:'Farming · Social',symbol:'✿',url:'https://www.roblox.com/games/126884695634066/Grow-a-Garden',thumbnail_url:''},
{id:'doors',name:'DOORS',genre:'Horror',description:'Horror · Survival',symbol:'◈',url:'https://www.roblox.com/games/6516141723/DOORS',thumbnail_url:''},
{id:'tower',name:'Tower of Hell',genre:'Action',description:'Obby · Challenge',symbol:'↟',url:'https://www.roblox.com/games/1962086868/Tower-of-Hell',thumbnail_url:''},
{id:'king',name:'King Legacy',genre:'RPG',description:'Adventure · RPG',symbol:'♜',url:'https://www.roblox.com/games/4520749081/King-Legacy',thumbnail_url:''}
];
let games=fallbackGames,activeFilter='All',query='';
const grid=document.getElementById('gamesGrid'),empty=document.getElementById('empty');
const safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const filtered=games.filter(g=>(activeFilter==='All'||String(g.genre||'').toLowerCase().includes(activeFilter.toLowerCase()))&&(g.name+' '+g.description+' '+g.genre).toLowerCase().includes(query));
 grid.innerHTML=filtered.map(g=>{const url=g.roblox_url||g.url||'#';const cover=g.thumbnail_url?'<img src="'+safe(g.thumbnail_url)+'" alt="" loading="lazy">':'<span class="cover-symbol">'+safe(g.symbol||'✦')+'</span>';return '<article class="game-card"><a href="'+safe(url)+'" target="_blank" rel="noopener" aria-label="Play '+safe(g.name)+'"><div class="game-cover">'+(g.featured?'<span class="cover-tag">FEATURED</span>':'')+cover+'</div><div class="game-info"><div><b>'+safe(g.name)+'</b><small>'+safe(g.description||g.genre||'Roblox experience')+'</small></div><span>↗</span></div></a></article>';}).join('');
 empty.hidden=filtered.length!==0;
}
async function loadGames(){
 const {data,error}=await supabase.from('games').select('id,name,genre,description,thumbnail_url,roblox_url,featured').eq('published',true).order('sort_order').order('name');
 if(!error&&data?.length) games=data;
 render();
}
document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render();});
document.getElementById('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render();});
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('nav').classList.toggle('open'));
document.getElementById('nav').addEventListener('click',e=>{if(e.target.closest('a'))document.getElementById('nav').classList.remove('open');});
render();loadGames();supabase.channel('public-games-feed').on('postgres_changes',{event:'*',schema:'public',table:'games'},loadGames).subscribe();
async function loadArticles(){
 const host=document.getElementById('articlesFeed'); if(!host)return;
 const {data,error}=await supabase.from('articles').select('id,title,summary,category,game,published_at').eq('status','published').order('published_at',{ascending:false}).limit(6);
 if(error){host.innerHTML='<p>News feed is temporarily unavailable.</p>';return;}
 if(!data?.length){host.innerHTML='<p class="muted">New community stories will appear here when published.</p>';return;}
 host.innerHTML=data.map(a=>'<a href="/article.html?id='+encodeURIComponent(a.id)+'"><span><small>'+safe(a.category)+' · '+safe(a.game)+'</small><b>'+safe(a.title)+'</b><small>'+safe(a.summary)+'</small></span><strong>↗</strong></a>').join('');
}
loadArticles();
supabase.channel('public-articles-feed').on('postgres_changes',{event:'*',schema:'public',table:'articles'},loadArticles).subscribe();
