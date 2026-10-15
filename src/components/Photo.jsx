import { wedding } from '../data/wedding';

export const photoSrc = (slug, w = 1280) => `/photos/${slug}-${w}.webp`;

export default function Photo({ slug, sizes = '100vw', alt = '', className = '', eager = true, ...rest }) {
  const p = wedding.photos.find((x) => x.slug === slug);
  if (!p) return null;
  return (
    <img
      className={className}
      src={photoSrc(slug, 1280)}
      srcSet={[640, 1280, 2000].map((w) => `${photoSrc(slug, w)} ${w}w`).join(', ')}
      sizes={sizes}
      width={p.w}
      height={p.h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      {...rest}
    />
  );
}
