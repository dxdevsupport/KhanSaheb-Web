import { useEffect, useState } from 'react';
import Image from 'next/image';

const DynamicImage = ({ src, alt, width ,className}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new window.Image();
    img.src = src;

    img.onload = () => {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
  }, [src]);


  return (
    dimensions.width > 0 && (
      <Image
        src={src}
        quality={100}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        
        className={className}
        // style={width && { width: '100%', height: 'auto' }}
      />
    )
  );
};

export default DynamicImage;
