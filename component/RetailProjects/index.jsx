import React, { useEffect } from "react";
import Link from "next/link";
import styles from "../ProjectList/projectList.module.scss";
import ProjectCard from "../ProjectList/projectCard";
import AOS from "aos";
import "aos/dist/aos.css";

function RetailProjects({ title = "Retail Projects", projects = [] }) {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []); 
  return (
    <section className={`${styles.projectsSection} pb_80 pt_80`}>
      <div className="container">
        <div className={styles.projectsHeader}>
          <h2 className="main_title hp_space_mb">{title}</h2>
        </div>
      </div>
      <div className="container">
        <div className={styles.projectsList}>
          {projects.map((project, index) => (
            <div key={index} data-aos="fade-up" data-aos-delay={index*300}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RetailProjects;
