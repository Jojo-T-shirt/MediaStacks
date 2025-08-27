import { trendingAnime, searchAnime } from '../api/anilist.js';
import { trendingReel, searchReel } from '../api/tmdb.js';

function debounce(fn, ms=400){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); };
}

function card(it){
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <img src="${it.poster}" alt="${it.title}" loading="lazy"/>
    <div class="p">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
        <strong>${it.title}</strong>
        <span class="badge">${it.type==='anime'?'Anime':'Réel'}</span>
      </div>
      <div class="muted" style="font-size:.9rem">⭐ ${typeof it.rating==='number' ? it.rating.toFixed(1) : it.rating}</div>
      <div class="muted" style="font-size:.8rem">${(it.genres||[]).slice(0,3).join(', ')}</div>
      <a href="#/detail/${it.id}" class="button">Détails</a>
    </div>`;
  return el;
}

export async function render(){
  const wrap = document.createElement('section');
  wrap.innerHTML = `
    <div class="filters">
      <input class="search" id="q" placeholder="Rechercher un titre (anime, film, série)..." />
      <select id="type">
        <option value="all">Tout</option>
        <option value="anime">Anime</option>
        <option value="reel">Réel (films & séries)</option>
      </select>
      <select id="status">
        <option value="all">Tous statuts</option>
        <option value="airing">En cours</option>
        <option value="ended">Terminé</option>
        <option value="announced">Annoncé</option>
        <option value="hiatus">Hiatus</option>
        <option value="cancelled">Annulé</option>
      </select>
      <select id="sort">
        <option value="popular">Populaire</option>
        <option value="title">Titre A→Z</option>
      </select>
      <span id="loading" class="loading" hidden>Chargement…</span>
    </div>
    <div class="grid" id="grid"></div>`;

  const grid = wrap.querySelector('#grid');
  const q = wrap.querySelector('#q');
  const type = wrap.querySelector('#type');
  const status = wrap.querySelector('#status');
  const sort = wrap.querySelector('#sort');
  const loading = wrap.querySelector('#loading');

  let baseData = [];

  async function loadTrending(){
    loading.hidden = false;
    const [animes, reels] = await Promise.all([trendingAnime(), trendingReel()]);
    baseData = [...animes, ...reels];
    loading.hidden = true;
    apply();
  }

  function apply(){
    grid.innerHTML = '';
    let arr = [...baseData];
    const query = q.value.trim().toLowerCase();

    if (query) arr = arr.filter(i => (i.title||'').toLowerCase().includes(query));
    if (type.value!=='all') arr = arr.filter(i => i.type === type.value);
    if (status.value!=='all') arr = arr.filter(i => (i.status||'').toLowerCase() === status.value);
    if (sort.value==='title') arr.sort((a,b)=> (a.title||'').localeCompare(b.title||''));
    if (sort.value==='popular') arr.sort((a,b)=> (b.rating||0) - (a.rating||0));

    if (!arr.length){
      const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'Aucun résultat.';
      grid.appendChild(p);
      return;
    }
    arr.forEach(i=>grid.appendChild(card(i)));
  }

  const doSearch = debounce(async ()=>{
    const query = q.value.trim();
    if(!query){ await loadTrending(); return; }
    loading.hidden = false;
    const [animes, reels] = await Promise.all([searchAnime(query), searchReel(query)]);
    baseData = [...animes, ...reels];
    loading.hidden = true;
    apply();
  }, 500);

  q.addEventListener('input', doSearch);
  type.addEventListener('change', apply);
  status.addEventListener('change', apply);
  sort.addEventListener('change', apply);

  loadTrending();
  return wrap;
}
