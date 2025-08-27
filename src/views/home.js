import { trendingAnime } from '../api/anilist.js';
import { trendingReel } from '../api/tmdb.js';

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
      <a href="#/detail/${it.id}" class="button primary">Voir</a>
    </div>`;
  return el;
}

export async function render(){
  const el = document.createElement('section');
  el.innerHTML = `
    <h2>Tendances</h2>
    <div class="grid" id="grid"></div>
  `;
  const grid = el.querySelector('#grid');
  const [animes, reels] = await Promise.all([trendingAnime(), trendingReel()]);
  [...animes.slice(0,8), ...reels.slice(0,8)].forEach(i => grid.appendChild(card(i)));
  return el;
}
