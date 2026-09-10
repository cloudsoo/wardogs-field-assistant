const TILE_ROOT='https://assets.wardogs-artillery.com/releases/assets-v1/maps/tiles/';
const SAFE_MAP=/^[a-z0-9-]{1,40}$/;

export default {
  async fetch(request, env, ctx) {
    const url=new URL(request.url);
    if(url.pathname.startsWith('/tiles/')){
      const parts=url.pathname.split('/').filter(Boolean);
      if(parts.length===4){
        const [,map,zoomPart,file]=parts;
        const zm=/^zoom_(\d+)$/.exec(zoomPart);
        const match=/^(\d+)_(\d+)\.(webp|png)$/i.exec(file);
        const zoom=zm?Number(zm[1]):-1;
        if(SAFE_MAP.test(map)&&match&&zoom>=0&&zoom<=7){
          const upstream=`${TILE_ROOT}${map}/zoom_${zoom}/${file}`;
          const cacheKey=new Request(upstream,{method:'GET'});
          const cache=caches.default;
          const cached=await cache.match(cacheKey);
          if(cached){
            const h=new Headers(cached.headers);h.set('Access-Control-Allow-Origin','*');h.set('X-Terrain-Proxy','HIT');return new Response(cached.body,{status:cached.status,headers:h});
          }
          const res=await fetch(upstream,{cf:{cacheTtl:31536000,cacheEverything:true}});
          if(!res.ok)return new Response('Tile unavailable',{status:res.status,headers:{'Cache-Control':'no-store'}});
          const h=new Headers(res.headers);h.set('Content-Type','image/webp');h.set('Cache-Control','public,max-age=31536000,immutable');h.set('Access-Control-Allow-Origin','*');h.set('X-Terrain-Proxy','MISS');
          const out=new Response(res.body,{status:200,headers:h});ctx.waitUntil(cache.put(cacheKey,out.clone()));return out;
        }
        return new Response('Bad tile path',{status:400});
      }
    }
    return env.ASSETS.fetch(request);
  }
};
