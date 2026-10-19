'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, type Sermon } from '@/lib/api';
import { PageIntro } from '@/components/page-intro';
import { Icon } from '@/components/icon';
import { Pagination } from '@/components/pagination';

const PAGE_SIZE = 6;
export default function SermonsPage(): React.JSX.Element {
  const [items, setItems] = useState<Sermon[]>([]); const [page, setPage] = useState(1);
  useEffect(() => { api.sermons().then(setItems).catch(() => setItems([])); }, []);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE)); const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changePage = (value: number) => { setPage(value); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <><PageIntro label="MESSAGES" title="Hear the Word." accent="Carry it with you.">Recent messages and reflections from the City Mega Church pulpit.</PageIntro><section className="section"><div className="container content-list">{visible.length ? visible.map(item => <article className="content-card sermon-card" key={item.id}><p className="eyebrow">{new Date(item.preachedAt).toLocaleDateString()}</p><h2>{item.title}</h2><h3>{item.speaker}</h3><p className="content-preview">{item.summary}</p><Link className="text-link" href={`/sermons/${item.id}`}>Read more <Icon name="arrow-up" /></Link></article>) : <p>No sermons have been added yet. Please check back soon.</p>}<Pagination page={page} totalPages={totalPages} onChange={changePage}/></div></section></>;
}
