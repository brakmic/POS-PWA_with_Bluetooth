import React, { useState } from 'react';
import './CachedImage.css';

interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
}

const CachedImage: React.FC<CachedImageProps> = ({ src, alt, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className={`cached-image-container ${className}`}>
      {(!isLoaded || hasError) && (
        <div className="image-placeholder">
          <span>{alt.charAt(0).toUpperCase()}</span>
        </div>
      )}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={`cached-image ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default CachedImage;
