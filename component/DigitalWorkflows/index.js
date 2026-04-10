import React from "react";
import OptimizedImage from "../OptimizedImage";
import styles from "./DigitalWorkflows.module.scss";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

const DigitalWorkflows = ({
  title,
  subtitle,
  conclusion,
  greenTriangle,
  workflows = [],
  fourGrid,
  titleAlignCenter = false,
}) => {
  
  // Don't render if no content provided
  if (!title || !workflows || workflows.length === 0) {
    return null;
  } 
  return (
    <section
      className={`${styles.digitalWorkflows} pb_80 pt_80`}
    >
      <div className="container">
        <div className={styles.contentWrapper}>
          <div className= {`${styles.headerSection} hp_space_mb`}>
            <h2 className={`${styles.mainTitle} main_title hp_space_mb`}>{extractTextFromObject(title)}</h2>
            {subtitle && <p>{parse(extractTextFromObject(subtitle))}</p>}
          </div>

          <div
            className={`${fourGrid ? styles.fourGrid : styles.workflowsGrid}`}
          >
            {workflows.map((workflow, index) => (
              <div
                key={index}
                className={`${styles.workflowItem} ${
                  workflow.highlighted ? styles.highlighted : ""}`}
                data-aos="fade-up"
              >
                {workflow.icon && (
                  <div className={styles.workflowIcon}>
                    <OptimizedImage
                      src={workflow.icon}
                      alt={workflow.imageAlt || extractTextFromObject(workflow.title)}
                      width={64}
                      height={65}
                    />
                  </div>
                )}
                <span
                  className={styles.workflowTitle}
                  style={{ textAlign: titleAlignCenter ? "center" : "left" }}
                >
                  {workflow.title
                    ? parse(extractTextFromObject(workflow.title))
                    : ""}
                </span>
              </div>
            ))}
          </div>

          {conclusion && (
            <div className={styles.conclusionSection}>
              <p className={styles.conclusion}>{parse(extractTextFromObject(conclusion))}</p>
            </div>
          )}
        </div>
      </div>
      {greenTriangle && <div className={styles.greenTriangle}></div>}
    </section>
  );
};

export default DigitalWorkflows;
