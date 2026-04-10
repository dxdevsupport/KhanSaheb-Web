import React, { useRef, useEffect, isValidElement } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import ProjectCard from "@/component/ProjectCard";
import styles from "./ProjectsShowcase.module.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import { getCleanLink, extractTextFromObject } from "@/libs/utils/helpers";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ProjectsShowcase = ({
	title,
	description,
	projects = [],
	buttonText = "VIEW OUR PROJECTS",
	buttonLink = "#",
	bgImg,
}) => {
	const swiperRef = useRef(null);

	useEffect(() => {
		AOS.init({
			duration: 1000,
			easing: "ease-in-out",
			once: true,
			offset: 100,
		});
	}, []);

	return (
		<section
			className={`${styles.projectsShowcase} pb_80 pt_80`}
			// style={`${bgImg && styles.bgImage ? styles.bgImage : ""}`}
			style={{ backgroundImage: `url(${bgImg})` }}
		>
			<div className="container">
				<div className={`${styles.headerSection} hp_space_mb`} data-aos="fade-up">
					<h2 className="main_title hp_space_mb">
						{isValidElement(title) ? title : extractTextFromObject(title)}
					</h2>
					{/* <p>{description}</p> */}
					{isValidElement(description) || Array.isArray(description) ? (
						description
					) : (
						<div
							dangerouslySetInnerHTML={{
								__html: extractTextFromObject(description),
							}}
						></div>
					)}
				</div>

				<div className={styles.projectsSlider}>
					<Swiper
						ref={swiperRef}
						modules={[Navigation, Pagination]}
						spaceBetween={30}
						slidesPerView={1}
						loop={projects.length >= 2}
						loopAdditionalSlides={projects.length >= 2 ? 2 : 0}
						watchSlidesProgress={true}
						// navigation={{
						//   nextEl: `.${styles.swiperButtonNext}`,
						//   prevEl: `.${styles.swiperButtonPrev}`,
						// }}
						// pagination={{
						//   clickable: true,
						//   el: `.${styles.swiperPagination}`,
						// }}
						breakpoints={{
							0: {
								slidesPerView: 1.2,
								spaceBetween: 20,
							},
							768: {
								slidesPerView: 2,
								spaceBetween: 30,
								loop: projects.length >= 4,
								loopAdditionalSlides: projects.length >= 4 ? 2 : 0,
							},
							1024: {
								slidesPerView: 3,
								spaceBetween: 40,
								loop: projects.length >= 6,
								loopAdditionalSlides: projects.length >= 6 ? 2 : 0,
							},
						}}
						className={styles.swiper}
					>
						{projects.map((project, index) => (
							<SwiperSlide key={index} className={styles.swiperSlide}>
								<ProjectCard
									image={project.image}
									title={project.title}
									tags={project.tags}
									taxonomy="project-category"
									buttonLink={project.slug ? `/ourprojects/${project.slug}` : '#'}
								/>
							</SwiperSlide>
						))}
					</Swiper>
				</div>

				{buttonText && (
					<div
						className={styles.buttonSection}>
						<Link href={getCleanLink(buttonLink)} className="common_btn text_lift_up_second">
							{buttonText}
						</Link>
					</div>
				)}
			</div>
		</section>
	);
};

export default ProjectsShowcase;
