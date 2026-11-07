import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabase=createClient('https://feiyuiypwjddbypttwwj.supabase.co','sb_publishable_Qvqi5ZLdxSgohxzALB3rCA_Wx8FVV74');
const fallbackGames=[
{id:'blox',name:'Blox Fruits',genre:'Adventure',description:'Pirates · Fruits · RPG',symbol:'⚔',url:'https://www.roblox.com/games/2753915549/Blox-Fruits',thumbnail_url:''},
{id:'brookhaven',name:'Brookhaven RP',genre:'Social',description:'Roleplay · Social',symbol:'⌂',url:'https://www.roblox.com/games/4924922222/Brookhaven-RP',thumbnail_url:''},
{id:'adopt',name:'Adopt Me!',genre:'Social',description:'Pets · Social',symbol:'♡',url:'https://www.roblox.com/games/920587237/Adopt-Me',thumbnail_url:''},
{id:'murder',name:'Murder Mystery 2',genre:'Horror',description:'Mystery · Survival',symbol:'✦',url:'https://www.roblox.com/games/142823291/Murder-Mystery-2',thumbnail_url:''},
{id:'grow',name:'Grow a Garden',genre:'Simulation',description:'Farming · Social',symbol:'✿',url:'https://www.roblox.com/games/126884695634066/Grow-a-Garden',thumbnail_url:''},
{id:'doors',name:'DOORS',genre:'Horror',description:'Horror · Survival',symbol:'◈',url:'https://www.roblox.com/games/6516141723/DOORS',thumbnail_url:''},
{id:'tower',name:'Tower of Hell',genre:'Action',description:'Obby · Challenge',symbol:'↟',url:'https://www.roblox.com/games/1962086868/Tower-of-Hell',thumbnail_url:''},
{id:'king',name:'King Legacy',genre:'RPG',description:'Adventure · RPG',symbol:'♜',url:'https://www.roblox.com/games/4520749081/King-Legacy',thumbnail_url:''},
{id:'rivals',name:'RIVALS',genre:'Action',description:'Competitive FPS',symbol:'✦',url:'https://www.roblox.com/games/17625359962/RIVALS',thumbnail_url:''},
{id:'strongest',name:'The Strongest Battlegrounds',genre:'Action',description:'Anime fighting · PvP',symbol:'⚔',url:'https://www.roblox.com/games/10449761463/The-Strongest-Battlegrounds',thumbnail_url:''},
{id:'brainrot',name:'Steal a Brainrot',genre:'Simulation',description:'Collect · Steal · Rebirth',symbol:'🧠',url:'https://www.roblox.com/games/102414667939238/Steal-a-Brainrot',thumbnail_url:''}
];
let games=fallbackGames,activeFilter='All',query='',activeTopic='All',articles=[];
const robloxPlaceIds={'Blox Fruits':2753915549,'Brookhaven RP':4924922222,'Adopt Me!':920587237,'Murder Mystery 2':142823291,'Grow a Garden':126884695634066,'DOORS':6516141723,'Tower of Hell':1962086868,'King Legacy':4520749081,'RIVALS':17625359962,'The Strongest Battlegrounds':10449761463,'Steal a Brainrot':102414667939238};
const universeIds={},officialIcons={};
async function resolveUniverse(placeId){try{const r=await fetch('https://apis.roblox.com/universes/v1/places/'+placeId+'/universe');if(!r.ok)return null;const j=await r.json();return j.universeId||null;}catch{return null;}}
async function loadOfficialRobloxImages(){
 const pairs=await Promise.all(Object.entries(robloxPlaceIds).map(async([name,place])=>[name,await resolveUniverse(place)]));
 pairs.forEach(([name,id])=>{if(id)universeIds[name]=id;});
 const ids=[...new Set(Object.values(universeIds))];if(!ids.length)return;
 try{const r=await fetch('https://thumbnails.roblox.com/v1/games/icons?universeIds='+ids.join(',')+'&size=512x512&format=Png&isCircular=false');if(!r.ok)throw new Error('Roblox image service unavailable');
 const j=await r.json();(j.data||[]).forEach(x=>{if(x.imageUrl)officialIcons[String(x.targetId)]=x.imageUrl;});
 games=games.map(g=>{const id=universeIds[g.name];return id&&officialIcons[String(id)]?{...g,thumbnail_url:officialIcons[String(id)]}:g;});
 document.querySelectorAll('[data-roblox-place]').forEach(img=>{const place=img.getAttribute('data-roblox-place');const name=Object.keys(robloxPlaceIds).find(k=>String(robloxPlaceIds[k])===String(place));const id=name?universeIds[name]:null;if(id&&officialIcons[String(id)]){img.src=officialIcons[String(id)];img.addEventListener('error',()=>{img.style.display='none';},{once:true});}});
 renderGames();renderArticles();
 }catch(err){console.warn('Roblox official images unavailable',err);}
}
const grid=document.getElementById('gamesGrid'),empty=document.getElementById('empty');
const safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderGames(){
 const filtered=games.filter(g=>(activeFilter==='All'||String(g.genre||'').toLowerCase().includes(activeFilter.toLowerCase()))&&(g.name+' '+g.description+' '+g.genre).toLowerCase().includes(query));
 grid.innerHTML=filtered.map(g=>{const url=g.roblox_url||g.url||'#';const cover=g.thumbnail_url?'<img src="'+safe(g.thumbnail_url)+'" alt="'+safe(g.name)+' cover" loading="lazy">':'<span class="cover-symbol">'+safe(g.symbol||'✦')+'</span>';return '<article class="game-card"><a href="'+safe(url)+'" target="_blank" rel="noopener"><div class="game-cover">'+(g.featured?'<span class="cover-tag">FEATURED</span>':'')+cover+'</div><div class="game-info"><div><b>'+safe(g.name)+'</b><small>'+safe(g.description||g.genre||'Roblox experience')+'</small></div><span>↗</span></div></a></article>';}).join('');
 empty.hidden=filtered.length!==0;
}
function articleImage(a){const game=String(a.game||'').toLowerCase();const key=Object.keys(robloxPlaceIds).find(k=>game.includes(k.toLowerCase())||k.toLowerCase().includes(game));const id=key?universeIds[key]:null;if(id&&officialIcons[String(id)])return officialIcons[String(id)];return a.thumbnail_url||'';}
function renderArticles(){
 const host=document.getElementById('articlesFeed');if(!host)return;
 const filtered=articles.filter(a=>activeTopic==='All'||a.game===activeTopic||(activeTopic==='Roblox'&&a.category?.toLowerCase().includes('roblox')));
 if(!filtered.length){host.innerHTML='<p class="muted">No stories in this category yet.</p>';return;}
 host.innerHTML=filtered.map(a=>'<article class="article-card"><a class="article-image" href="/article.html?id='+encodeURIComponent(a.id)+'">'+(articleImage(a)?'<img src="'+safe(articleImage(a))+'" alt="'+safe(a.title)+'" loading="lazy">':'<span>GAMER NEWS</span>')+'<small>'+safe(a.category)+'</small></a><div class="article-copy"><div class="article-meta">'+safe(a.game)+' <i>·</i> '+(a.published_at?new Date(a.published_at).toLocaleDateString():'LATEST')+'</div><h3><a href="/article.html?id='+encodeURIComponent(a.id)+'">'+safe(a.title)+'</a></h3><p>'+safe(a.summary)+'</p><a class="read-more" href="/article.html?id='+encodeURIComponent(a.id)+'">READ STORY ↗</a></div></article>').join('');
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
renderGames();loadGames();loadArticles();loadOfficialRobloxImages();
supabase.channel('public-games-feed').on('postgres_changes',{event:'*',schema:'public',table:'games'},loadGames).subscribe();
supabase.channel('public-articles-feed').on('postgres_changes',{event:'*',schema:'public',table:'articles'},loadArticles).subscribe();

document.addEventListener('error',e=>{if(e.target&&e.target.tagName==='IMG'){e.target.style.display='none';}},true);
