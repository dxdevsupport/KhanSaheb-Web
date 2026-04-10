import React, { useState, useRef, useEffect } from "react";
import style from "./videoContaine.module.scss";

function VideoContainer({
  videoUrl,
  leftTriangle,
  thumbImg,
  onInViewChange,
  fullHeight,
  rightTriangle,
}) { 
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const posterImage = thumbImg || "/images/employee-welfare-poster.jpg";

  return (
    <div
      ref={containerRef}
      className={`${style.videoWrapper} ${fullHeight ? style.full_height : ""} ${
        isPlaying ? style.videoPlaying : ""
      }`}
      style={{
        backgroundImage: `url(${posterImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <video
        ref={videoRef}
        className={style.video}
        poster={posterImage}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error("Video error:", e);
          setVideoError(true);
        }}
        onLoadStart={() => console.log("Video loading started")}
        onCanPlay={() => console.log("Video can play")}
        preload="metadata"
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {!videoError && (
        <div
          className={`${style.playButtonOverlay} ${
            isPlaying ? style.playing : ""
          }`}
          onClick={handlePlayPause}
        >
          <div className={style.playButton}>
            {isPlaying ? (
              <div className={style.pauseIcon}>
                <span className={style.pauseBar}></span>
                <span className={style.pauseBar}></span>
              </div>
            ) : (
              <div className={style.playIcon}></div>
            )}
          </div>
        </div>
      )}

      {/* {videoError && (
        <div className={style.errorOverlay}>
          <div className={style.errorMessage}>
            <p>Video not available</p>
            <p>Please check your internet connection</p>
          </div>
        </div>
      )} */}
      {leftTriangle ? (
        <div className={style.topLeftTriangle}></div>
      ) : rightTriangle ? (
        <div className={style.topRightTriangle}></div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default VideoContainer;
