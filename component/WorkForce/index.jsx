import React, { useState, useRef } from "react";
import style from "./workForce.module.scss";

function WorkForce({
	title = "Building a Skilled Emirati Workforce",
	video = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
	poster = "/images/emirati-workforce-poster.jpg",
	description = [
		"Our approach focuses on creating long-term career opportunities for UAE Nationals, offering comprehensive training, mentoring and hands-on experience designed to build skills and leadership capabilities. We are committed to providing an inclusive work environment where Emiratis are empowered to grow, contribute and take on key roles across our organisation.",
		"Through our Emiratisation initiatives, we aim not only to uphold national priorities but to help develop the next generation of professionals who will lead and innovate within the UAE's built environment.",
	],
	videoAlt = "Emirati Workforce Development",
}) {
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const videoRef = useRef(null);

	const handlePlayPause = () => {
		if (videoRef.current) {
			if (isVideoPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
		}
	};

	const handleVideoPause = () => {
		setIsVideoPlaying(false);
	};

	const handleVideoPlayEvent = () => {
		setIsVideoPlaying(true);
	};

	return (
		<div className={`${style.workforce_section} pb_80 pt_80`}>
			<div className="container">
				<div className={style.workforce_content}>
					<div className={style.workforce_text} data-aos="fade-up">
						<h2 className="main_title hp_space_mb">{title}</h2>
						<div className={style.workforce_description}>
							{description.map((paragraph, index) => (
								<div key={index}>{paragraph}</div>
							))}
						</div>
					</div>
					<div className={style.workforce_image} data-aos="fade-up">
						<div className={style.video_container}>
							<div className={style.video_wrapper}>
								<video
									ref={videoRef}
									className={style.workforce_video}
									poster={poster}
									onPlay={handleVideoPlayEvent}
									onPause={handleVideoPause}
									onEnded={handleVideoPause}
									preload="metadata"
									playsInline
								>
									<source src={video} type="video/mp4" />
									Your browser does not support the video tag.
								</video>
								<div
									className={`${style.playButtonOverlay} ${
										isVideoPlaying ? style.playing : ""
									}`}
									onClick={handlePlayPause}
								>
									<div className={style.playButton}>
										{isVideoPlaying ? (
											<div className={style.pauseIcon}>
												<span className={style.pauseBar}></span>
												<span className={style.pauseBar}></span>
											</div>
										) : (
											<div className={style.playIcon}></div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default WorkForce;
