import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabase=createClient('https://feiyuiypwjddbypttwwj.supabase.co','sb_publishable_Qvqi5ZLdxSgohxzALB3rCA_Wx8FVV74');
const fallbackGames=[
{id:'blox',name:'Blox Fruits',genre:'Adventure',description:'Pirates · Fruits · RPG',symbol:'⚔',url:'https://www.roblox.com/games/2753915549/Blox-Fruits',thumbnail_url:'https://yupgames.io/_next/image?q=75&url=https%3A%2F%2Fs3.growsolutions.tech%2Fyupgames%2Fgames%2Fimages%2F1771909959321-Blox+Fruits.jpg&w=1080'},
{id:'brookhaven',name:'Brookhaven RP',genre:'Social',description:'Roleplay · Social',symbol:'⌂',url:'https://www.roblox.com/games/4924922222/Brookhaven-RP',thumbnail_url:''},
{id:'adopt',name:'Adopt Me!',genre:'Social',description:'Pets · Social',symbol:'♡',url:'https://www.roblox.com/games/920587237/Adopt-Me',thumbnail_url:''},
{id:'murder',name:'Murder Mystery 2',genre:'Horror',description:'Mystery · Survival',symbol:'✦',url:'https://www.roblox.com/games/142823291/Murder-Mystery-2',thumbnail_url:''},
{id:'grow',name:'Grow a Garden',genre:'Simulation',description:'Farming · Social',symbol:'✿',url:'https://www.roblox.com/games/126884695634066/Grow-a-Garden',thumbnail_url:''},
{id:'doors',name:'DOORS',genre:'Horror',description:'Horror · Survival',symbol:'◈',url:'https://www.roblox.com/games/6516141723/DOORS',thumbnail_url:''},
{id:'tower',name:'Tower of Hell',genre:'Action',description:'Obby · Challenge',symbol:'↟',url:'https://www.roblox.com/games/1962086868/Tower-of-Hell',thumbnail_url:''},
{id:'king',name:'King Legacy',genre:'RPG',description:'Adventure · RPG',symbol:'♜',url:'https://www.roblox.com/games/4520749081/King-Legacy',thumbnail_url:''}
];
let games=fallbackGames,activeFilter='All',query='',activeTopic='All',articles=[];
const grid=document.getElementById('gamesGrid'),empty=document.getElementById('empty');
const safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderGames(){
 const filtered=games.filter(g=>(activeFilter==='All'||String(g.genre||'').toLowerCase().includes(activeFilter.toLowerCase()))&&(g.name+' '+g.description+' '+g.genre).toLowerCase().includes(query));
 grid.innerHTML=filtered.map(g=>{const url=g.roblox_url||g.url||'#';const cover=g.thumbnail_url?'<img src="'+safe(g.thumbnail_url)+'" alt="'+safe(g.name)+' cover" loading="lazy">':'<span class="cover-symbol">'+safe(g.symbol||'✦')+'</span>';return '<article class="game-card"><a href="'+safe(url)+'" target="_blank" rel="noopener"><div class="game-cover">'+(g.featured?'<span class="cover-tag">FEATURED</span>':'')+cover+'</div><div class="game-info"><div><b>'+safe(g.name)+'</b><small>'+safe(g.description||g.genre||'Roblox experience')+'</small></div><span>↗</span></div></a></article>';}).join('');
 empty.hidden=filtered.length!==0;
}
function renderArticles(){
 const host=document.getElementById('articlesFeed');if(!host)return;
 const filtered=articles.filter(a=>activeTopic==='All'||a.game===activeTopic||(activeTopic==='Roblox'&&a.category?.toLowerCase().includes('roblox')));
 if(!filtered.length){host.innerHTML='<p class="muted">No stories in this category yet.</p>';return;}
 host.innerHTML=filtered.map(a=>'<article class="article-card"><a class="article-image" href="/article.html?id='+encodeURIComponent(a.id)+'">'+(a.thumbnail_url?'<img src="'+safe(a.thumbnail_url)+'" alt="'+safe(a.title)+'" loading="lazy">':'<span>GAMER NEWS</span>')+'<small>'+safe(a.category)+'</small></a><div class="article-copy"><div class="article-meta">'+safe(a.game)+' <i>·</i> '+(a.published_at?new Date(a.published_at).toLocaleDateString():'LATEST')+'</div><h3><a href="/article.html?id='+encodeURIComponent(a.id)+'">'+safe(a.title)+'</a></h3><p>'+safe(a.summary)+'</p><a class="read-more" href="/article.html?id='+encodeURIComponent(a.id)+'">READ STORY ↗</a></div></article>').join('');
}
async function loadGames(){
 const {data,error}=await supabase.from('games').select('id,name,genre,description,thumbnail_url,roblox_url,featured').eq('published',true).order('sort_order').order('name');
 if(!error&&data?.length)games=data;renderGames();
}
async function loadArticles(){
 const {data,error}=await supabase.from('articles').select('id,title,summary,category,game,thumbnail_url,published_at').eq('status','published').order('published_at',{ascending:false}).limit(30);
 if(error){document.getElementById('articlesFeed').innerHTML='<p class="muted">News feed is temporarily unavailable.</p>';return;}
 articles=data||[];renderArticles();
}
document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));renderGames();});
document.getElementById('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderGames();});
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('nav').classList.toggle('open'));
document.getElementById('nav').addEventListener('click',e=>{if(e.target.closest('a'))document.getElementById('nav').classList.remove('open');});
document.getElementById('topicTabs').addEventListener('click',e=>{const b=e.target.closest('[data-topic]');if(!b)return;activeTopic=b.dataset.topic;document.querySelectorAll('.topic').forEach(x=>x.classList.toggle('active',x===b));renderArticles();});
document.querySelectorAll('[data-jump-topic]').forEach(b=>b.addEventListener('click',()=>{activeTopic=b.dataset.jumpTopic;document.querySelectorAll('.topic').forEach(x=>x.classList.toggle('active',x.dataset.topic===activeTopic));renderArticles();}));
renderGames();loadGames();loadArticles();
supabase.channel('public-games-feed').on('postgres_changes',{event:'*',schema:'public',table:'games'},loadGames).subscribe();
supabase.channel('public-articles-feed').on('postgres_changes',{event:'*',schema:'public',table:'articles'},loadArticles).subscribe();
