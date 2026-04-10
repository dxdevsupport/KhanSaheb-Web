import React, { useEffect, isValidElement } from "react";
import style from "../../public/css/careerDevelopement.module.scss";
import OptimizedImage from "../OptimizedImage";
import AOS from "aos";
import "aos/dist/aos.css";
import { extractTextFromObject } from "@/libs/utils/helpers";
import parse from "html-react-parser";

function Klearing({
	title,
	image,
	description,
	topGreenTriangle,
	bgColor = "#fff",
}) {
	useEffect(() => {
		AOS.init({
			duration: 1000,
			easing: "ease-in-out",
			once: true,
			offset: 100,
		});
	}, []);

	return (
		<div
			className={`${style.legacyFuture_section} pt_80 pb_80`}
			style={{ backgroundColor: bgColor }}
		>
			<div className="container">
				<div className={style.legacyFuture_content}>
					<div data-aos="fade-up">
						<div className={style.legacyFuture_image}>
							<OptimizedImage src={image} alt={"learning"} fill />
						</div>
					</div>
					<div data-aos="fade-up">
						<div className={style.legacyFuture_text}>
							{title && <h2 className="main_title hp_space_mb">{extractTextFromObject(title)}</h2>}
							<div className={style.legacyFuture_description}>
								{Array.isArray(description)
									? description.map((paragraph, index) => (
											<div key={index}>
												{isValidElement(paragraph)
													? paragraph
													: Array.isArray(paragraph)
													? paragraph
													: extractTextFromObject(paragraph)
													? parse(extractTextFromObject(paragraph))
													: ""}
											</div>
									  ))
									: isValidElement(description)
									? description
									: extractTextFromObject(description)
									? parse(extractTextFromObject(description))
									: ""}
							</div>
						</div>
					</div>
				</div>
			</div>
			{topGreenTriangle && <div className={style.green_triangle}></div>}
		</div>
	);
}

export default Klearing;
