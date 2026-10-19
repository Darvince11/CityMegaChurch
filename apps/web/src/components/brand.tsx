import Image from 'next/image';
import Link from 'next/link';
import { church } from '@/lib/church';

export function Brand({ light = false, variant }: { light?: boolean; variant?: 'light' }): React.JSX.Element {
  // The legacy portal variant intentionally renders no second logo; the
  // administration workspace has its own compact navigation identity.
  if (variant === 'light') return <></>;
  light = light || variant === 'light';
  return <Link href="/" className={'brand brand--official' + (light ? ' brand--light' : '')} aria-label={`${church.name} home`}>
    <Image src="/images/city-mega-church-logo-transparent.png" alt="City Mega Church" width={349} height={102} priority className="official-logo" />
  </Link>;
}
