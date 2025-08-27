const routes = {
  '': () => import('./views/home.js'),
  'catalogue': () => import('./views/catalogue.js'),
  'profil': () => import('./views/profil.js'),
  'communaute': () => import('./views/communaute.js'),
  'detail': () => import('./views/detail.js')
};
export async function mount(route, appEl){
  const mod = await (routes[route] || routes[''])();
  appEl.innerHTML = '';
  const v = await mod.render();
  appEl.appendChild(v);
}
