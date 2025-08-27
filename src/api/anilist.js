const ENDPOINT = "https://graphql.anilist.co";

function normalizeStatus(s){
  const m = (s||'').toUpperCase();
  if (m === 'FINISHED') return 'ended';
  if (m === 'RELEASING') return 'airing';
  if (m === 'NOT_YET_RELEASED') return 'announced';
  if (m === 'HIATUS') return 'hiatus';
  if (m === 'CANCELLED') return 'cancelled';
  return 'unknown';
}

async function gql(query, variables){
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  if(!res.ok) throw new Error('AniList error');
  const data = await res.json();
  return data.data;
}

function mapMedia(m){
  return {
    id: "anilist_" + m.id,
    source: "anilist",
    type: "anime",
    title: m.title?.romaji || m.title?.english || m.title?.native || "Sans titre",
    description: m.description || "",
    episodes: m.episodes || 0,
    status: normalizeStatus(m.status),
    rating: (m.averageScore || 0) / 10,
    poster: m.coverImage?.large || "",
    genres: m.genres || [],
    lang: { vf: false, vostfr: true }
  };
}

export async function trendingAnime(){
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(type: ANIME, sort: TRENDING_DESC) {
          id title { romaji english native } episodes status averageScore genres
          coverImage { large }
        }
      }
    }`;
  const d = await gql(query, {});
  return d.Page.media.map(mapMedia);
}

export async function searchAnime(q){
  const query = `
    query ($q: String) {
      Page(page: 1, perPage: 30) {
        media(type: ANIME, search: $q, sort: POPULARITY_DESC) {
          id title { romaji english native } episodes status averageScore genres
          coverImage { large }
        }
      }
    }`;
  const d = await gql(query, { q });
  return d.Page.media.map(mapMedia);
}

export async function animeById(anilistId){
  const id = parseInt(anilistId, 10);
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id title { romaji english native } description(asHtml: false)
        episodes status averageScore genres coverImage { large }
      }
    }`;
  const d = await gql(query, { id });
  return mapMedia(d.Media);
}
