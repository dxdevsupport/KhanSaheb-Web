import React from 'react';
import styles from './projectData.module.scss';
import Image from 'next/image';
import OptimizedImage from '../OptimizedImage';
import parse from 'html-react-parser';
import { getProjectImage } from "@/libs/utils/helpers";

function ProjectData({ data, imageAlt }) {
 
  // If no data provided, return null
  if (!data) {
    return null;
  }

  // Get the main image from ACF fields
  const mainImage = getProjectImage(data);

  // Get the title
  const title = data?.acf?.title
    || (data?.title?.rendered ? parse(String(data.title.rendered)) : "Project Details");

  // Get project details array from ACF
  const projectDetails = data?.acf?.project_details || [];

  return (
    <div className={`${styles.projectDataWrapper} pb_80 pt_50`}>
      <div className='container'>
        <div className={styles.projectDataContainer}>
          {/* Title */}
          <h1 className="main_title">{title}</h1>

          {/* Content Grid */}
          <div className={styles.contentGrid}>
            {/* Left Side - Image */}
            <div className={styles.imageSection}>
              <div className={styles.imageWrapper}>
                <OptimizedImage
                  src={mainImage}
                  alt={imageAlt || (typeof title === 'string' ? title : 'Project Image')}
                  fill
                  className={styles.projectImage}
                  priority
                />
              </div>
            </div>

            {/* Right Side - Project Details */}
            <div className={styles.detailsSection}>
              {projectDetails.map((detail, index) => {
                // Only render if both label and value exist
                if (!detail.detail_label || !detail.detail_value) {
                  return null;
                }

                return (
                  <div key={index} className={styles.detailItem}>
                    <div className={styles.detailLabel}>
                      {typeof detail.detail_label === 'string'
                        ? parse(String(detail.detail_label))
                        : detail.detail_label}
                    </div>
                    <div className={styles.detailValue}>
                      {typeof detail.detail_value === 'string'
                        ? parse(String(detail.detail_value))
                        : detail.detail_value}
                    </div>
                  </div>
                );
              })}

              {/* Fallback if no project details are available */}
              {projectDetails.length === 0 && (
                <div className={styles.detailItem}>
                  <div className={styles.detailValue}>No project details available</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectData;