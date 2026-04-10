import React, { useRef } from "react";
import style from "./ourPromise.module.scss";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

function OurPromise({ title, desc, objectives, videoUrl,  thumbnail }) {
	const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
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
		<div className={`${style.header_container} pt_80`}>
			<div className="container">
				<div className={style.content_grid}>
					<div
						className={style.text_section}
						data-aos="fade-up"
						data-aos-delay="800"
					>
						<h2 className="main_title">{title ? parse(extractTextFromObject(title)) : ""}</h2>
						{desc && <p className={style.content_desc}>{parse(extractTextFromObject(desc))}</p>}
						<ul className={style.objectives_list}>
							{objectives.map((objective, index) => (
								<li key={index} className={style.objective_item}>
									<span>
										<strong>{objective.title ? parse(extractTextFromObject(objective.title)) : ""}</strong>
									</span>
									<div>{objective.desc ? parse(extractTextFromObject(objective.desc)) : ""} </div>
								</li>
							))}
						</ul>
					</div>
					<div className={style.image_section} data-aos="fade-up">
						<div className={style.image_container}>
							<div className={style.video_wrapper}>
								<video
									ref={videoRef}
									className={style.quality_video}
									poster={thumbnail}
									onPlay={handleVideoPlayEvent}
									onPause={handleVideoPause}
									onEnded={handleVideoPause}
									preload="metadata"
									playsInline
								>
									<source src={videoUrl} type="video/mp4" />
									Your browser does not support the video tag.
								</video>
								{videoUrl && (
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
								)}
								 
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default OurPromise;
