import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import styles from './VideoSection.module.scss';

const VideoSection = ({thumbnail, videoUrl, thumbnailAlt = "Video thumbnail"}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePlayClick = () => {
    setShowVideo(true);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
  };

  return (
    <>
      <section className={`${styles.videoSection}`}>
        <div className={styles.videoThumbnail} onClick={handlePlayClick}>
          <Image
            src={thumbnail}
            alt={thumbnailAlt}
            width={1200}
            height={870}
            className={styles.thumbnailImage}
          />
          <div className={styles.playButton}>
            <svg width="119" height="119" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="40" fill="rgba(255, 255, 255,.4)"/>
              <path d="M30 25L55 40L30 55V25Z" fill="#E40032"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Video Popup Modal - Rendered as portal to document body */}
      {showVideo && mounted && createPortal(
        <div className={styles.videoModal} onClick={handleCloseVideo}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseVideo}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={styles.videoWrapper}>
              <iframe
                width="100%"
                height="100%"
                src={videoUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default VideoSection;
