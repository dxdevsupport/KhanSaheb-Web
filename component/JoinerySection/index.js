import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './JoinerySection.module.scss';

const JoinerySection = ({ subtitle, title, description, facilityDescription, reputationDescription, videoUrl, videoCoverImage, videoCoverImageAlt, rightImage, rightImageAlt, leftImage, leftImageAlt }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showCover, setShowCover] = useState(true);
  const [imageHeight, setImageHeight] = useState(494); // Default fallback height
  const videoRef = useRef(null);

  // Determine if we should show video or image
  const hasVideo = videoUrl && videoCoverImage;
  const hasImage = leftImage && !hasVideo;

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        setShowCover(false);
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation(); // Prevent video play/pause when clicking volume button
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      
      // Start playing when unmuting
      if (isMuted) {
        videoRef.current.play();
        setIsPlaying(true);
        setShowCover(false);
      }
    }
  };

  const handleImageLoad = (event) => {
    const img = event.target;
    const naturalHeight = img.naturalHeight;
    setImageHeight(naturalHeight);
  };
  return (
    <section className={styles.joinerySection}>
      <div className="container">
        <div className={styles.joineryWrapper}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            <div className={styles.textContent}>
              <span className="tag">{subtitle}</span>
              <h2 className={`main_title ${styles.main_title}`}>{title}</h2>
              {Array.isArray(description) ? (
                description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p>{description}</p>
              )}
            </div>
            
            {hasVideo ? (
              <div className={styles.videoContainer}>
                <video
                  ref={videoRef}
                  className={styles.video}
                  muted={isMuted}
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {showCover && videoCoverImage && (
                  <div className={styles.videoCover}>
                    <Image 
                      src={videoCoverImage} 
                      alt={videoCoverImageAlt || "Video cover image"} 
                      fill 
                      className={styles.coverImage}
                    />
                  </div>
                )}
                
                <button 
                  className={styles.volumeButton} 
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  <Image 
                    src={isMuted ? "/images/mute.png" : "/images/unmute.png"} 
                    alt={isMuted ? "Unmute" : "Mute"} 
                    width={24} 
                    height={24}
                  />
                </button>
              </div>
            ) : hasImage ? (
              <div className={styles.imageLeft}>
                <Image 
                  src={leftImage} 
                  alt={leftImageAlt || "Service image"} 
                  width={690}
                  height={416}
                />
              </div>
            ) : null}
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <div 
              className={styles.detailImage}
              style={{ height: `${imageHeight}px` }}
            >
              <Image 
                src={rightImage} 
                alt={rightImageAlt || "Service image"} 
                fill 
                className={styles.craftImage}
                onLoad={handleImageLoad}
              />
            </div>
            
            <div className={styles.bottomContent}>
              <p>{facilityDescription}</p>
              <p>{reputationDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinerySection;
