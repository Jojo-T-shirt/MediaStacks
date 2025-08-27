export async function render(){
  const el = document.createElement('section');
  el.innerHTML = `<h2>Communauté</h2><p class="muted">Prototype de flux local. Les vraies données arriveront avec la base.</p><div id="feed"></div>`;
  const feed = el.querySelector('#feed');
  const journal = JSON.parse(localStorage.getItem('mediastacks_journal')||'[]');
  if(!journal.length){
    feed.innerHTML = '<p class="muted">Aucune activité pour le moment.</p>';
  } else {
    for(const it of journal.slice(-30).reverse()){
      const row = document.createElement('div');
      row.style.cssText = 'border-bottom:1px solid #1f1f1f;padding:.6rem 0;';
      row.textContent = `• ${new Date(it.t).toLocaleString()} – ${it.msg}`;
      feed.appendChild(row);
    }
  }
  return el;
}
