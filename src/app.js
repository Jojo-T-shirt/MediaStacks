import { mount } from './router.js';

const app = document.getElementById('app');

async function render(){
  const hash = location.hash.slice(2);
  const [route] = hash.split('/');
  await mount(route || '', app);
}
window.addEventListener('hashchange', render);
window.addEventListener('load', render);

export function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  setTimeout(()=> t.hidden = true, 2000);
}
