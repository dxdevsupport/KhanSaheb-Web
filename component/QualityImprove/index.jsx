import React, { isValidElement } from "react";
import style from "./qualityImprove.module.scss";
import Image from "next/image";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

function QualityImprove({
	title,
	imageAlt,
	objectives,
	imgUrl,
	videoUrl,
	desc,
	content,
}) {
	const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
	const videoRef = React.useRef(null);

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
		<div
			className={`${style.header_container} pb_80 pt_80`}
		>
			<div className="container">
				<div className={style.content_grid}>
					<div className={style.text_section}>
						<h2 className={`${style.title}  main_title`}>{extractTextFromObject(title)}</h2>
						{content ? (
							<div className={style.content_wrapper}>
								{isValidElement(content) || Array.isArray(content)
									? content
									: typeof content === "string"
									? parse(content)
									: parse(extractTextFromObject(content))}
							</div>
						) : (
							<>
								{desc && (
									<div className={style.content_desc}>
										{isValidElement(desc) || Array.isArray(desc)
											? desc
											: typeof desc === "string"
											? parse(desc)
											: parse(extractTextFromObject(desc))}
									</div>
								)}
								<ul className={style.objectives_list}>
									{objectives?.map((objective, index) => (
										<li key={index} className={style.objective_item}>
											{isValidElement(objective) || Array.isArray(objective)
												? objective
												: typeof objective === "string" && objective.includes("<")
												? parse(objective)
												: parse(extractTextFromObject(objective))}
										</li>
									))}
								</ul>
							</>
						)}
					</div>
					<div className={style.image_section}>
						<div className={style.image_container}>
							{videoUrl ? (
								<div className={style.video_wrapper}>
									<video
										ref={videoRef}
										className={style.quality_video}
										poster={imgUrl}
										onPlay={handleVideoPlayEvent}
										onPause={handleVideoPause}
										onEnded={handleVideoPause}
										preload="metadata"
										playsInline
									>
										<source src={videoUrl} type="video/mp4" />
										Your browser does not support the video tag.
									</video>
									<div
										className={`${style.playButtonOverlay} ${isVideoPlaying ? style.playing : ''}`}
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
							) : (
								<Image
										src={imgUrl}
										alt={extractTextFromObject(imageAlt || title)}
										width={600}
										height={561}
										className={style.quality_image}
										priority
									/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default QualityImprove;
