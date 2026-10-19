'use client';

import { useEffect, useState } from 'react';
import { api, type GalleryPhoto } from '@/lib/api';

export default function GalleryPage(): React.JSX.Element {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.gallery().then(setPhotos).catch(() => setPhotos([])).finally(() => setLoading(false)); }, []);
  const display = photos.slice(0, 18);
  const movingPhotos = display.slice(0, 8);
  return <main className="gallery-page"><section className="gallery-hero"><div className="container"><p className="eyebrow eyebrow--light">CITY MEGA CHURCH · IN PICTURES</p><h1>Moments of faith.<br/><em>Stories of grace.</em></h1><p>A living collection of worship, community, and the moments we share.</p></div></section><section className="gallery-stage">{loading && <div className="container gallery-loading"><span/><span/><span/></div>}{!loading && display.length === 0 && <div className="container gallery-empty"><span>✦</span><h2>Our gallery is coming soon.</h2><p>No photos have been published yet. Please check back after our next gathering.</p></div>}{display.length > 0 && <><div className="gallery-marquee"><div className="gallery-track">{[...movingPhotos,...movingPhotos].map((photo,index)=><figure key={`${photo.id}-${index}`}><img src={photo.imageUrl} alt={photo.title} loading={index < 2 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" referrerPolicy="no-referrer"/><figcaption><span>{String((index%movingPhotos.length)+1).padStart(2,'0')}</span><div><h2>{photo.title}</h2>{photo.caption&&<p>{photo.caption}</p>}</div></figcaption></figure>)}</div></div><div className="container gallery-grid">{display.map((photo,index)=><figure className={index%3===0?'gallery-tile gallery-tile--wide':'gallery-tile'} key={photo.id}><img src={photo.imageUrl} alt={photo.title} loading="lazy" decoding="async" referrerPolicy="no-referrer"/><figcaption><p>{photo.title}</p><span>{photo.caption}</span></figcaption></figure>)}</div></>}</section></main>;
}
