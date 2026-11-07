const STORAGE_KEY = 'blox-cataloh-community-posts-v1';
const starterStories = [
  {id:'starter-guides',category:'Guides',game:'Roblox',title:'Where to check official Roblox announcements',summary:'A quick guide to finding platform news, developer updates and service notices without relying on rumours.',body:'When you hear about a major Roblox change, check the official Roblox Newsroom for company announcements, the Roblox Developer Forum for creator-facing updates, and the Roblox Status page for service incidents. Community posts can be useful leads, but always verify important claims with an official source before sharing them.',date:'2026-11-07',starter:true},
  {id:'starter-community',category:'Community',game:'Roblox',title:'A viral leak is not the same as a confirmed update',summary:'Before reposting a screenshot or rumour, take a moment to check where it came from and whether it has been confirmed.',body:'Roblox communities move quickly, and screenshots can lose their context as they spread. Look for the original post, check the date, and see whether the information is supported by an official announcement or a named developer. If something is still a rumour, label it clearly instead of presenting it as confirmed news.',date:'2026-11-07',starter:true},
  {id:'starter-games',category:'Games',game:'Roblox experiences',title:'Finding your next favourite Roblox experience',summary:'Try something outside your usual genre, read recent player feedback and check the experience page before jumping in.',body:'The Roblox platform has experiences for many different moods: exploration, roleplay, strategy, social hangouts and competitive games. Use Roblox search and discovery, check the experience description and creator details, and read recent feedback. Be mindful of off-platform links and never share your password or account codes.',date:'2026-11-07',starter:true}
];
const state = {filter:'All',query:''};
const $ = (selector) => document.querySelector(selector);
function escapeHTML(value='') {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function getCommunityStories() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveCommunityStories(stories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}
function getAllStories() {
  return [...getCommunityStories(), ...starterStories].sort((a,b) => new Date(b.date) - new Date(a.date));
}
function formatDate(value) {
  const date = new Date(value + (String(value).length === 10 ? 'T12:00:00' : ''));
  return Number.isNaN(date.getTime()) ? 'COMMUNITY STORY' : date.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}).toUpperCase();
}
function renderStories() {
  const host = $('#storyGrid');
  if (!host) return;
  const query = state.query.trim().toLowerCase();
  const filtered = getAllStories().filter(story => {
    const categoryMatch = state.filter === 'All' || story.category === state.filter;
    const searchable = [story.title,story.summary,story.body,story.game,story.category].join(' ').toLowerCase();
    return categoryMatch && (!query || searchable.includes(query));
  });
  if (!filtered.length) {
    host.innerHTML = '<div class="empty-state">No stories match that search yet. Try another keyword or category.</div>';
    return;
  }
  host.innerHTML = filtered.map((story,index) => {
    const visualClass = story.category === 'Games' ? 'visual-games' : story.category === 'Community' ? 'visual-community' : story.category === 'Guides' ? 'visual-guides' : '';
    const mark = story.category === 'Games' ? 'PLAY' : story.category === 'Community' ? 'COMMUNITY' : story.category === 'Guides' ? 'FIELD GUIDE' : 'UPDATE';
    return `<article class="story-card">
      <div class="story-visual ${visualClass}"><span class="visual-index">BC / ${String(index+1).padStart(2,'0')}</span><span class="visual-mark">${mark}</span></div>
      <div class="story-content"><div class="story-meta"><span>${escapeHTML(story.category)}</span><span>•</span><span>${escapeHTML(story.game || 'Roblox')}</span></div>
      <h3>${escapeHTML(story.title)}</h3><p>${escapeHTML(story.summary || story.body)}</p>
      <div class="story-foot"><span>${formatDate(story.date)}</span><span class="read-more">${story.starter ? 'EDITORIAL' : 'COMMUNITY POST'}</span></div></div>
    </article>`;
  }).join('');
}
function setFilter(filter) {
  state.filter = filter;
  document.querySelectorAll('.filter').forEach(button => button.classList.toggle('active',button.dataset.filter === filter));
  renderStories();
}
$('#filters')?.addEventListener('click',event => {
  const button = event.target.closest('[data-filter]');
  if (button) setFilter(button.dataset.filter);
});
$('#searchInput')?.addEventListener('input',event => {
  state.query = event.target.value;
  renderStories();
});
$('#menuBtn')?.addEventListener('click',() => $('#mainNav')?.classList.toggle('open'));
$('#mainNav')?.addEventListener('click',event => {
  if (event.target.closest('a')) $('#mainNav').classList.remove('open');
});
const dialog = $('#postDialog');
function openDialog() { if (dialog?.showModal) dialog.showModal(); }
$('#openPost')?.addEventListener('click',openDialog);
$('#closePost')?.addEventListener('click',() => dialog?.close());
$('#postForm')?.addEventListener('submit',event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const story = {
    id: 'community-' + Date.now(),
    title: String(data.get('title') || '').trim(),
    category: String(data.get('category') || 'Community'),
    game: String(data.get('game') || '').trim() || 'Roblox',
    body: String(data.get('body') || '').trim(),
    summary: String(data.get('body') || '').trim().slice(0,150) + (String(data.get('body') || '').length > 150 ? '…' : ''),
    date: new Date().toISOString().slice(0,10),
    starter:false
  };
  if (!story.title || !story.body) return;
  const stories = getCommunityStories();
  stories.push(story);
  saveCommunityStories(stories);
  form.reset();
  dialog.close();
  setFilter('All');
  $('#searchInput').value = '';
  state.query = '';
  renderStories();
  $('#latest').scrollIntoView({behavior:'smooth'});
});
renderStories();