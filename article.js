import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const db=createClient('https://feiyuiypwjddbypttwwj.supabase.co','sb_publishable_Qvqi5ZLdxSgohxzALB3rCA_Wx8FVV74');
const id=new URLSearchParams(location.search).get('id');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanHtml=html=>{const doc=new DOMParser().parseFromString(String(html||''),'text/html');const allowed=new Set(['P','H2','H3','UL','OL','LI','STRONG','B','EM','I','CODE','A','BLOCKQUOTE']);const walk=node=>{[...node.childNodes].forEach(child=>{if(child.nodeType===1){if(!allowed.has(child.tagName)){child.replaceWith(...child.childNodes);return;}[...child.attributes].forEach(attr=>{if(child.tagName==='A'&&['href','target','rel'].includes(attr.name))return;child.removeAttribute(attr.name);});if(child.tagName==='A'){const href=child.getAttribute('href')||'';if(!/^https?:\/\//i.test(href)){child.removeAttribute('href');}else{child.setAttribute('target','_blank');child.setAttribute('rel','noopener noreferrer');}}walk(child);}else if(child.nodeType!==3)child.remove();});};walk(doc.body);return doc.body.innerHTML;};
async function officialBloxImage(){try{const r=await fetch('https://thumbnails.roblox.com/v1/games/icons?universeIds=994732206&size=512x512&format=Png&isCircular=false');if(!r.ok)return null;const j=await r.json();return j.data?.[0]?.imageUrl||null;}catch{return null;}}
const host=document.getElementById('story');
if(!id){host.textContent='Story not found.';}else{
 const {data,error}=await db.from('articles').select('title,summary,content,category,game,thumbnail_url,published_at').eq('id',id).eq('status','published').maybeSingle();
 if(error||!data){host.textContent='This story is unavailable.';}else{
 const date=data.published_at?new Date(data.published_at).toLocaleDateString():'';
 let image=data.thumbnail_url;
 if(data.game==='Blox Fruits')image=await officialBloxImage()||image;
 host.innerHTML='<small class="story-meta">'+esc(data.category)+' · '+esc(data.game)+' · '+esc(date)+'</small><h1>'+esc(data.title)+'</h1><p class="story-summary">'+esc(data.summary)+'</p>'+(image?'<img class="story-cover" src="'+esc(image)+'" alt="'+esc(data.title)+'">':'')+'<div class="story-body">'+cleanHtml(data.content)+'</div>';
 document.title=data.title+' — Gamer News';
 }
}