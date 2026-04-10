import Image from "next/image";
import { useState, useEffect, useMemo, memo } from "react";
import axios from "axios";

/**
 * OptimizedImage - A smart image component that automatically optimizes images
 *
 * Features:
 * - Automatically uses Next.js Image for raster formats (JPG, PNG, WebP)
 * - Falls back to regular <img> for SVGs (which don't benefit from Next.js optimization)
 * - Lazy loading by default
 * - Automatic WebP/AVIF conversion
 * - Responsive sizing
 * - Error handling with fallback
 *
 * @param {string} src - Image source URL or path
 * @param {string} alt - Alternative text for accessibility
 * @param {string} className - CSS classes
 * @param {number} width - Image width (required for static images)
 * @param {number} height - Image height (required for static images)
 * @param {boolean} fill - Use fill mode for responsive containers
 * @param {string} sizes - Responsive sizes attribute
 * @param {number} quality - Image quality (1-100, default: 75)
 * @param {boolean} priority - Load image with high priority (disable lazy loading)
 * @param {string} objectFit - CSS object-fit property when using fill mode
 * @param {function} onLoad - Callback when image loads
 * @param {function} onError - Callback when image fails to load
 */
const OptimizedImage = ({
  src,
  alt = "",
  className = "",
  width,
  height,
  fill = false,
  sizes,
  quality = 75,
  priority = false,
  objectFit = "cover",
  onLoad,
  onError,
  style,
  objectPosition,
  ...rest
}) => {
  const [imageError, setImageError] = useState(false);
  const [fetchedSrc, setFetchedSrc] = useState(null);

  const normalizedSrc = useMemo(() => {
    if (!src) return src;
    if (typeof src === "object") {
      if (src.url) return src.url;
      if (src.sizes && src.sizes["1536x1536"]) return src.sizes["1536x1536"];
    }
    return src;
  }, [src]);

  // Check if src is a numeric ID (WordPress Media ID)
  const isNumericSrc =
    normalizedSrc &&
    (typeof normalizedSrc === "number" ||
      (typeof normalizedSrc === "string" && /^\d+$/.test(normalizedSrc)));

  useEffect(() => {
    if (isNumericSrc) {
      const fetchMedia = async () => {
        try {
          const baseURL = process.env.NEXT_PUBLIC_API_URL;
          const res = await axios.get(`${baseURL}/media/${normalizedSrc}`);
          if (res.data?.source_url) {
            setFetchedSrc(res.data.source_url);
          }
        } catch (error) {
          console.error(`Error fetching media for ID ${normalizedSrc}:`, error);
        }
      };
      fetchMedia();
    } else {
      setFetchedSrc(null);
    }
  }, [normalizedSrc, isNumericSrc]);

  const finalSrc = isNumericSrc ? fetchedSrc : normalizedSrc;

  // Don't render until we have the resolved URL for numeric IDs
  if (isNumericSrc && !finalSrc) {
    return null;
  }

  // Check if the image is an SVG
  const isSVG = finalSrc?.toString().toLowerCase().endsWith(".svg");

  // Handle image load error
  const handleError = (e) => {
    setImageError(true);
    if (onError) onError(e);
  };

  // For SVG images or if optimization failed, use regular img tag
  if (isSVG || imageError) {
    return (
      <img
        src={finalSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        onLoad={onLoad}
        quality={100}
        onError={onError} // Don't loop if regular img fails
        style={{
          ...style,
          ...(fill && {
            position: "absolute",
            height: "100%",
            width: "100%",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            objectFit: objectFit || "cover",
            objectPosition: objectPosition || "center",
          }),
        }}
        {...rest}
      />
    );
  }

  // For raster images (JPG, PNG, WebP), use Next.js Image for optimization
  if (fill) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        fill
        sizes={sizes || "100vw"}
        quality={quality}
        priority={priority}
        className={className}
        style={{ objectFit, objectPosition, ...style }}
        onLoad={onLoad}
        onError={handleError}
        {...rest}
      />
    );
  }

  // Standard mode with width and height
  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      priority={priority}
      className={className}
      sizes={sizes}
      onLoad={onLoad}
      onError={handleError}
      style={style}
      {...rest}
    />
  );
};

const arePropsEqual = (prev, next) => {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;
  for (const key of prevKeys) {
    if (key === "src") continue;
    if (prev[key] !== next[key]) return false;
  }
  if (prev.src === next.src) return true;
  if (typeof prev.src === "object" && typeof next.src === "object" && prev.src && next.src) {
     return (prev.src.url === next.src.url) && (prev.src.ID === next.src.ID) && (prev.src.id === next.src.id);
  }
  return false;
};

export default memo(OptimizedImage, arePropsEqual);
