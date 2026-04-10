import React from "react";
import Image from "next/image";
import OptimizedImage from "../OptimizedImage";
import Link from "next/link";
import parse from "html-react-parser";
import styles from "./projectList.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";

function ProjectCard({ project }) { 
  return (
    <Link href={project.path} className={styles.projectCard}>
      <div className={styles.projectImage}>
        <OptimizedImage
          src={project.image}
          alt={project.imageAlt || extractTextFromObject(project.title)}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className={styles.projectContent}>
        <div className={styles.categoryBadges}>
          {project.categories?.map((category, index) => (
            <span key={index} className="project_tag">
              {typeof category === 'string' && (category.includes('<') || category.includes('&'))
                ? parse(String(category))
                : extractTextFromObject(category)}
            </span>
          ))}
        </div>
        <h3 className={styles.projectTitle}>
          {parse(extractTextFromObject(project.title))}
        </h3>
      </div>
    </Link>
  );
}

export default ProjectCard;
