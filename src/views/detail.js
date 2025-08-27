import { getState, actions, subscribe } from '../store.js';
import { animeById } from '../api/anilist.js';
import { tmdbById } from '../api/tmdb.js';

function log(msg){
  const j = JSON.parse(localStorage.getItem('mediastacks_journal')||'[]');
  j.push({ t: Date.now(), msg });
  localStorage.setItem('mediastacks_journal', JSON.stringify(j));
}

async function fetchDetail(globalId){
  if(globalId.startsWith('anilist_')) return animeById(globalId.split('_')[1]);
  if(globalId.startsWith('tmdb_')) return tmdbById(globalId);
  throw new Error('Type inconnu');
}

export async function render(){
  const el = document.createElement('section');
  const id = location.hash.split('/')[2];
  const it = await fetchDetail(id).catch(()=>null);
  if(!it){ el.innerHTML = '<p>Introuvable.</p>'; return el; }

  const s = getState();
  const ep = s.progress[id]||0;
  const inToWatch = s.lists.toWatch.includes(id);
  const inProg = s.lists.inProgress.includes(id);
  const inFin = s.lists.finished.includes(id);

  el.innerHTML = `
    <div style="display:grid;grid-template-columns: 200px 1fr;gap:1rem;align-items:start;max-width:900px">
      <img src="${it.poster}" alt="${it.title}" style="width:100%;border-radius:12px"/>
      <div>
        <h2>${it.title}</h2>
        <p style="opacity:.8">${it.description || 'Description à venir.'}</p>
        <p><span class="badge">${it.type==='anime'?'Anime':'Réel'}</span> · ${it.episodes||'—'} ep. · ⭐ ${it.rating||'—'}</p>
        <p class="muted">${(it.genres||[]).join(', ')}</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin:.5rem 0">
          ${!inToWatch?'<button id="bToWatch" class="primary">+ À voir</button>':''}
          ${!inProg?'<button id="bInProg">Mettre en cours</button>':''}
          ${!inFin?'<button id="bFin">Marquer terminé</button>':''}
        </div>
        ${it.type==='anime' ? `
        <div style="margin-top:1rem">
          <strong>Progression</strong>
          <div style="display:flex;gap:.5rem;align-items:center;margin-top:.3rem">
            <button id="minus">−</button>
            <div id="progress">${ep}/${it.episodes||'?'}</div>
            <button id="plus">+</button>
          </div>
        </div>` : ''}
      </div>
    </div>`;

  const repaint = ()=>{
    const s2 = getState();
    const cur = s2.progress[id]||0;
    const total = it.episodes || '?';
    const p = el.querySelector('#progress');
    if(p) p.textContent = `${cur}/${total}`;
  };

  el.querySelector('#bToWatch')?.addEventListener('click', ()=>{ actions.addTo('toWatch', id); log(`${it.title} ajouté à À voir`); });
  el.querySelector('#bInProg')?.addEventListener('click', ()=>{ actions.addTo('inProgress', id); log(`${it.title} est en cours`); });
  el.querySelector('#bFin')?.addEventListener('click', ()=>{ actions.addTo('finished', id); actions.setProgress(id, it.episodes||0); log(`${it.title} terminé`); });
  el.querySelector('#plus')?.addEventListener('click', ()=>{ const n = Math.min((getState().progress[id]||0)+1, it.episodes||Infinity); actions.setProgress(id, n); if(it.episodes && n===it.episodes){ actions.addTo('finished', id); log(`${it.title} terminé`); } });
  el.querySelector('#minus')?.addEventListener('click', ()=>{ const n = Math.max((getState().progress[id]||0)-1, 0); actions.setProgress(id, n); });

  const unsub = subscribe(repaint);
  el.addEventListener('remove', unsub, { once:true });
  return el;
}
