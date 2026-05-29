import { useState } from 'react';
import images from '../data/images.js';

function ImageCard({ src, alt, className = '', imageClassName = '', children, loading = 'lazy', overlay = true, ...props }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={['relative overflow-hidden bg-gradient-to-br from-primary-600 to-indigo-600', className].join(' ')}
      style={hasError ? { background: images.fallbackGradient } : undefined}
      {...props}
    >
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onError={() => setHasError(true)}
          className={['h-full w-full object-cover', imageClassName].join(' ')}
        />
      ) : null}
      {overlay ? <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" /> : null}
      {children ? <div className="absolute inset-0">{children}</div> : null}
    </div>
  );
}

export default ImageCard;
