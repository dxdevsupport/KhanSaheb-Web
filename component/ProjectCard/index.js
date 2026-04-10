import React from 'react';
import OptimizedImage from '../OptimizedImage';
import Link from 'next/link';
import { getCleanLink, extractTextFromObject } from '@/libs/utils/helpers';
import styles from './ProjectCard.module.scss';

const ProjectCard = ({ 
  image,
  imageAlt,
  title,
  tags = [],
  buttonText = "VIEW DETAIL",
  buttonLink = "#",
  taxonomy = "sector"
}) => {
  // Don't render if no content provided
  if (!image || !title) {
    return null;
  }

  return (
    <div className={styles.projectCard}>
      <div className={styles.imageContainer}>
        <OptimizedImage 
          src={image} 
          alt={extractTextFromObject(imageAlt) || extractTextFromObject(title)}
          fill
          className={styles.projectImage}
        />
        <div className={styles.imageOverlay}>
          <Link href={getCleanLink(buttonLink)} className={`${styles.viewDetailButton} viewDetailButton`}>
            {buttonText}
          </Link>
        </div>
      </div>
      
      <div className={styles.contentContainer}>
        <div className={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <span key={index} className="project_tag" data-taxonomy={taxonomy}>
              {extractTextFromObject(tag)}
            </span>
          ))}
        </div>
        <h3 className={styles.projectTitle}>{extractTextFromObject(title)}</h3>
      </div>
    </div>
  );
};

export default ProjectCard;
