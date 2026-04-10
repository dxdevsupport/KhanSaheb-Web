import React, { useEffect, useRef, useState } from "react";
import style from "./awarWinning.module.scss";
import parse from "html-react-parser";
import AOS from "aos";
import "aos/dist/aos.css";

import { extractTextFromObject } from "@/libs/utils/helpers";

function AwardWinning({ data }) { 
	const sectionRef = useRef(null);
	const [isInView, setIsInView] = useState(false);
	// Helper function to format description - parse HTML if present, otherwise format plain text
	const formatDescription = (text) => {
		if (!text) return "";

		const safeText = extractTextFromObject(text);

		// Check if text contains HTML tags
		const hasHtmlTags = /<[^>]+>/.test(safeText);

		if (hasHtmlTags) {
			// Parse HTML content
			return parse(safeText);
		} else {
			// Format plain text with line breaks
			const lines = safeText.split(/\r\n|\n/).filter((line) => line.trim() !== "");
			if (lines.length === 0) return "";

			return (
				<>
					<p>{lines[0]}</p>
					{lines.slice(1).map((line, idx) => (
						<span key={idx}>{line}</span>
					))}
				</>
			);
		}
	};

	useEffect(() => {
		AOS.init({
			duration: 1000,
			easing: "ease-in-out",
			once: true,
			offset: 100,
		});
	}, []);

	return (
		<div ref={sectionRef} className={`${style.header_container}`}>
			<div className={style.content_grid}>
				<div className={style.text_panel} data-aos="fade-up">
					<h3 className={style.content_title}>
						{extractTextFromObject(data?.acf?.dc_aw_title) || ""}
					</h3>
					<div className={style.content_description}>
						{formatDescription(data?.acf?.dc_aw_description)}
					</div>
				</div>
				<div className={style.image_panel} data-aos="fade-up">
					<img
						src={data?.acf?.dc_aw_image?.url || "/images/excellence.png"}
						alt={data?.acf?.dc_aw_image?.alt || ""}
						className={style.content_image}
					/>
				</div>
			</div>
		</div>
	);
}

export default AwardWinning;
