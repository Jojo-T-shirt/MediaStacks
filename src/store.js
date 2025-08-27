const LS_KEY = 'mediastacks_store_gp_v2';
const listeners = new Set();

const defaultState = {
  profile: { username: 'Invité', langPref: 'VOSTFR' },
  lists: { toWatch: [], inProgress: [], finished: [] },
  progress: {}
};

function load(){
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || defaultState; } catch { return defaultState; }
}
function save(state){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
let state = load();

export function getState(){ return structuredClone(state); }
export function subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); }
function emit(){ for(const fn of listeners) fn(getState()); }

export const actions = {
  addTo(list, id){ const s=getState(); if(!s.lists[list].includes(id)) s.lists[list].push(id); state=s; save(s); emit(); },
  move(id, from, to){ const s=getState(); s.lists[from]=s.lists[from].filter(x=>x!==id); if(!s.lists[to].includes(id)) s.lists[to].push(id); state=s; save(s); emit(); },
  removeFrom(list, id){ const s=getState(); s.lists[list]=s.lists[list].filter(x=>x!==id); state=s; save(s); emit(); },
  setProgress(id, ep){ const s=getState(); s.progress[id]=ep; state=s; save(s); emit(); },
  setLangPref(pref){ const s=getState(); s.profile.langPref=pref; state=s; save(s); emit(); }
};
