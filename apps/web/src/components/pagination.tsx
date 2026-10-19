'use client';

type Props = { page: number; totalPages: number; onChange: (page: number) => void };

export function Pagination({ page, totalPages, onChange }: Props): React.JSX.Element | null {
  if (totalPages <= 1) return null;
  return <nav className="pagination" aria-label="Pagination"><button type="button" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next</button></nav>;
}
