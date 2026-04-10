import React from "react";
import style from "./investTraining.module.scss";
import Image from "next/image";
import parse from "html-react-parser";
import Link from "next/link";
import { extractTextFromObject } from "@/libs/utils/helpers";

function InvestTraining({
	title = "Investing in Training",
	description = "Training and development are essential to our success and continual improvement; they are part of every employee's working life at Khansaheb. Activity-specific learning is delivered to improve competency and promote consistency across quality, production and health and safety.",
	imageSrc = "/images/training-banner.png",
	imageAlt = "Training session at Khansaheb",
	buttonOne,
	buttonTwo,
	buttonOneLink,
	buttonTwoLink,
	greenTriangle,
	redTriangle,
}) { 
	return (
		<div data-aos="fade-up" className={style.trainingSection}>
			<div className="container pb_80 pt_80">
				<div
					className={`${style.training_grid} ${
						redTriangle ? style.showRedTriangle : ""
					}`}
				>
					{/* Image Section */}
					<div className={style.imageSection}>
						<div className={style.imageWrapper}>
							<Image
								src={imageSrc}
								alt={extractTextFromObject(imageAlt)}
								fill
								className={style.trainingImage}
								priority
							/>
						</div>
					</div>

					{/* Text Section */}
					<div className={style.textSection}>
						<div className={style.textContent}>
							<h2 className={style.title}>{extractTextFromObject(title)}</h2>
							<div className={style.description}>
								{parse(extractTextFromObject(description))}
							</div>
							{buttonOne && (
								<div className={style.button_container}>
									{buttonOneLink !== "#." ? (
										<Link href={buttonOneLink}>
											<button className="white_bg_btn">
												<p>{extractTextFromObject(buttonOne)}</p>
											</button>
										</Link>
									) : (
										<button className="white_bg_btn">
											<p>{extractTextFromObject(buttonOne)}</p>
										</button>
									)}
									{buttonTwo && (
										<>
											{buttonTwoLink !== "#." ? (
												<Link href={buttonTwoLink}>
													<button className="white_bg_btn">
														<p>{extractTextFromObject(buttonTwo)}</p>
													</button>
												</Link>
											) : (
												<button className="white_bg_btn">
													<p>{extractTextFromObject(buttonTwo)}</p>
												</button>
											)}
										</>
									)}
								</div>
							)}
						</div>
						
					</div>
					{greenTriangle && <div className={style.green_triangle}></div>}
				</div>
			</div>
		</div>
	);
}

export default InvestTraining;
