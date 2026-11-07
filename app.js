const games=[
{id:'blox',name:'Blox Fruits',category:['Action','Adventure','RPG'],type:'action',symbol:'⚔',tag:'FEATURED',detail:'Adventure · RPG',url:'https://www.roblox.com/games/2753915549/Blox-Fruits'},
{id:'brookhaven',name:'Brookhaven RP',category:['Social'],type:'adventure',symbol:'⌂',tag:'ROLEPLAY',detail:'Roleplay · Social',url:'https://www.roblox.com/games/4924922222/Brookhaven-RP'},
{id:'adopt',name:'Adopt Me!',category:['Social','Adventure'],type:'social',symbol:'♡',tag:'FAMILY',detail:'Pets · Social',url:'https://www.roblox.com/games/920587237/Adopt-Me'},
{id:'murder',name:'Murder Mystery 2',category:['Horror','Action'],type:'horror',symbol:'✦',tag:'MYSTERY',detail:'Mystery · Survival',url:'https://www.roblox.com/games/142823291/Murder-Mystery-2'},
{id:'grow',name:'Grow a Garden',category:['Social','Adventure'],type:'farm',symbol:'✿',tag:'SIMULATION',detail:'Farming · Social',url:'https://www.roblox.com/games/126884695634066/Grow-a-Garden'},
{id:'doors',name:'DOORS',category:['Horror','Adventure'],type:'horror',symbol:'◈',tag:'HORROR',detail:'Horror · Survival',url:'https://www.roblox.com/games/6516141723/DOORS'},
{id:'tower',name:'Tower of Hell',category:['Action'],type:'rpg',symbol:'↟',tag:'OBBY',detail:'Obby · Challenge',url:'https://www.roblox.com/games/1962086868/Tower-of-Hell'},
{id:'king',name:'King Legacy',category:['Action','Adventure','RPG'],type:'rpg',symbol:'♜',tag:'ADVENTURE',detail:'Adventure · RPG',url:'https://www.roblox.com/games/4520749081/King-Legacy'}
];
let activeFilter='All',query='';
const grid=document.getElementById('gamesGrid'),empty=document.getElementById('empty');
function render(){
 const filtered=games.filter(g=>(activeFilter==='All'||g.category.includes(activeFilter))&&(g.name+' '+g.detail+' '+g.category.join(' ')).toLowerCase().includes(query));
 grid.innerHTML=filtered.map(g=>`<article class="game-card"><a href="${g.url}" target="_blank" rel="noopener" aria-label="Play ${g.name}"><div class="game-cover cover-${g.type}"><span class="cover-tag">${g.tag}</span><span class="cover-symbol">${g.symbol}</span></div><div class="game-info"><div><b>${g.name}</b><small>${g.detail}</small></div><span>↗</span></div></a></article>`).join('');
 empty.hidden=filtered.length!==0;
}
document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render();});
document.getElementById('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render();});
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('nav').classList.toggle('open'));
document.getElementById('nav').addEventListener('click',e=>{if(e.target.closest('a'))document.getElementById('nav').classList.remove('open');});
render();