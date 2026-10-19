import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'City Mega Church | Faith. Family. Purpose.',
    template: '%s | City Mega Church',
  },
  description:
    'A welcoming community where faith, family, and purpose grow together.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
