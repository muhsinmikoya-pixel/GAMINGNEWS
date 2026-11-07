import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const db=createClient('https://feiyuiypwjddbypttwwj.supabase.co','sb_publishable_Qvqi5ZLdxSgohxzALB3rCA_Wx8FVV74');
const id=new URLSearchParams(location.search).get('id');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const host=document.getElementById('story');
if(!id){host.textContent='Story not found.';}else{
 const {data,error}=await db.from('articles').select('title,summary,content,category,game,published_at').eq('id',id).eq('status','published').maybeSingle();
 if(error||!data){host.textContent='This story is unavailable.';}else{
 const date=data.published_at?new Date(data.published_at).toLocaleDateString(): '';
 host.innerHTML='<small>'+esc(data.category)+' · '+esc(data.game)+' · '+esc(date)+'</small><h1>'+esc(data.title)+'</h1><p style="color:#aab0c0">'+esc(data.summary)+'</p><hr style="border-color:#292b38;margin:24px 0"><div class="story-body">'+esc(data.content)+'</div>';
 document.title=data.title+' — Blox Cataloh';
 }
}