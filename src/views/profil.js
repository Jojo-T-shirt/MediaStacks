import { getState, actions, subscribe } from '../store.js';

function listSection(title, key, items){
  const el = document.createElement('section');
  el.innerHTML = `<h3>${title}</h3><div class="grid" id="g"></div>`;
  const g = el.querySelector('#g');
  items.forEach(it=>{
    const card = document.createElement('article');
    card.className='card';
    card.innerHTML = `
      <div class="p" style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
        <strong>${it}</strong>
        <div style="display:flex;gap:.4rem">
          ${key!=='toWatch'?'<button data-move="toWatch">À voir</button>':''}
          ${key!=='inProgress'?'<button data-move="inProgress">En cours</button>':''}
          ${key!=='finished'?'<button data-move="finished">Terminé</button>':''}
          <button data-remove>Retirer</button>
        </div>
      </div>`;
    card.querySelector('[data-remove]')?.addEventListener('click',()=>actions.removeFrom(key, it));
    card.querySelectorAll('[data-move]')?.forEach(btn=>btn.addEventListener('click',()=>actions.move(it, key, btn.dataset.move)));
    g.appendChild(card);
  });
  return el;
}

export async function render(){
  const root = document.createElement('section');
  root.innerHTML = `
    <h2>Mon profil</h2>
    <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin:.5rem 0 1rem">
      <label>Pseudo: <input id="pseudo" style="width:120px"/></label>
      <label>Préférence audio:
        <select id="lang">
          <option>VOSTFR</option>
          <option>VF</option>
        </select>
      </label>
      <div class="badge" id="stats"></div>
    </div>
    <p class="muted">Astuce: ajoute des titres depuis la page Détail (boutons À voir / En cours / Terminé).</p>
    <div id="lists"></div>
  `;

  function paint(){
    const s = getState();
    root.querySelector('#pseudo').value = s.profile.username;
    root.querySelector('#lang').value = s.profile.langPref;
    const stats = root.querySelector('#stats');
    const total = ['toWatch','inProgress','finished'].reduce((n,k)=>n+s.lists[k].length,0);
    stats.textContent = `${total} titres · ${s.lists.finished.length} terminés`;

    const lists = root.querySelector('#lists');
    lists.innerHTML = '';
    lists.appendChild(listSection('À voir','toWatch', s.lists.toWatch));
    lists.appendChild(listSection('En cours','inProgress', s.lists.inProgress));
    lists.appendChild(listSection('Terminés','finished', s.lists.finished));
  }

  root.querySelector('#lang').addEventListener('change', (e)=>actions.setLangPref(e.target.value));
  root.querySelector('#pseudo').addEventListener('input', (e)=>actions.setUsername(e.target.value));
  paint();
  const unsub = subscribe(paint);
  root.addEventListener('remove', unsub, { once:true });
  return root;
}
