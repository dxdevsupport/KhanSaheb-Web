import React, { useEffect, useRef, useState } from "react";
import style from "./qualityPolicy.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";

function QualityPolicy({ title, dataList, imgUrl }) {
	const containerRef = useRef(null);
	const backgroundRef = useRef(null);
	const [parallaxOffset, setParallaxOffset] = useState(0);

	const backgroundImageUrl = imgUrl ? imgUrl : "/images/quality-policy.png";

	return (
		<div
			ref={containerRef}
			className={style.qualityPolicyContainer}
			style={{
				backgroundImage: `url(${backgroundImageUrl})`,
			}}
		>
			<div className={`container ${style.contentOverlay}`}>
				<div
					className={style.textContent}
					data-aos="fade-up"
					data-aos-delay="800"
				>
					<h2 className={style.title}>{extractTextFromObject(title)}</h2>
					<ul className={style.policyList}>
						{dataList.map((policy, index) => (
							<li key={index} className={style.policyItem}>
								{extractTextFromObject(policy)}
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className={style.greenTriangle}></div>
			<div className={style.redTriangle}></div>
		</div>
	);
}

export default QualityPolicy;
