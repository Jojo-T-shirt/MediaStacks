import { TMDB_API_KEY, TMDB_IMAGE_BASE } from '../config.js';

const BASE = "https://api.themoviedb.org/3";

function configured(){ return !!TMDB_API_KEY; }

function normalizeStatusTV(s){
  const v = (s||'').toLowerCase();
  if (v.includes('ended')) return 'ended';
  if (v.includes('returning')) return 'airing';
  if (v.includes('canceled') || v.includes('cancelled')) return 'cancelled';
  if (v.includes('in production')) return 'announced';
  return 'unknown';
}

async function tmdb(path, params={}){
  if(!configured()) throw new Error('TMDB not configured');
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "fr-FR");
  for(const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if(!res.ok) throw new Error('TMDB error');
  return res.json();
}

export async function getGenres(){
  try{
    const [gm, gt] = await Promise.all([
      tmdb("/genre/movie/list"),
      tmdb("/genre/tv/list")
    ]);
    const map = new Map();
    gm.genres.forEach(g=>map.set(g.id, g.name));
    gt.genres.forEach(g=>map.set(g.id, g.name));
    return map;
  }catch(e){
    return new Map();
  }
}

function mapMovie(m, genreMap){
  return {
    id: "tmdb_movie_" + m.id,
    source: "tmdb",
    type: "reel",
    title: m.title || m.original_title,
    description: m.overview || "",
    episodes: 1,
    status: "ended",
    rating: (m.vote_average || 0),
    poster: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : "",
    genres: (m.genre_ids||[]).map(id => genreMap.get(id)).filter(Boolean),
    lang: { vf: true, vostfr: true }
  };
}
function mapTV(m, genreMap){
  return {
    id: "tmdb_tv_" + m.id,
    source: "tmdb",
    type: "reel",
    title: m.name || m.original_name,
    description: m.overview || "",
    episodes: (m.number_of_episodes || 0),
    status: normalizeStatusTV(m.status || ''),
    rating: (m.vote_average || 0),
    poster: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : "",
    genres: (m.genre_ids||[]).map(id => genreMap.get(id)).filter(Boolean),
    lang: { vf: true, vostfr: true }
  };
}

export async function trendingReel(){
  try{
    const genreMap = await getGenres();
    const [movies, tv] = await Promise.all([
      tmdb("/trending/movie/week"),
      tmdb("/trending/tv/week")
    ]);
    const mapMovieList = movies.results.slice(0,20).map(m => mapMovie(m, genreMap));
    const mapTvList = tv.results.slice(0,20).map(m => mapTV(m, genreMap));
    return [...mapMovieList, ...mapTvList];
  }catch(e){
    return [];
  }
}

export async function searchReel(query){
  try{
    const genreMap = await getGenres();
    const [movies, tv] = await Promise.all([
      tmdb("/search/movie", { query }),
      tmdb("/search/tv", { query })
    ]);
    const mapMovieList = movies.results.slice(0,30).map(m => mapMovie(m, genreMap));
    const mapTvList = tv.results.slice(0,30).map(m => mapTV(m, genreMap));
    return [...mapMovieList, ...mapTvList];
  }catch(e){
    return [];
  }
}

export async function tmdbById(globalId){
  if(!configured()) throw new Error('TMDB not configured');
  if(globalId.startsWith("tmdb_movie_")){
    const id = globalId.replace("tmdb_movie_", "");
    const d = await tmdb(`/movie/${id}`);
    return mapMovie({ ...d, genre_ids: d.genres?.map(g=>g.id)||[] }, await getGenres());
  } else {
    const id = globalId.replace("tmdb_tv_", "");
    const d = await tmdb(`/tv/${id}`);
    return mapTV({ ...d, genre_ids: d.genres?.map(g=>g.id)||[], status: d.status }, await getGenres());
  }
}
