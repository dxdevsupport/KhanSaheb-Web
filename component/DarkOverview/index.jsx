import React from "react";
import parse from "html-react-parser";
import styles from "./DarkOverview.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";

const DarkOverview = ({ title, description, headingTag = "h3" }) => {
  return (
    <div className={`${styles.header_container}`}>
      <div data-aos="fade-up" data-aos-delay="600">
        <div className={`container mt_50 ${styles.header_content}`}>
          <div className={`pb_160 ${styles.description}`}>
            {" "}
            {extractTextFromObject(description) ? parse(extractTextFromObject(description)) : ""}
          </div>
          <div className={`${styles.title_container}`}>
            {" "}
            {React.createElement(
              headingTag,
              { className: `main_title hp_space_mb main_title_up ${styles.title}` },
              extractTextFromObject(title) ? parse(extractTextFromObject(title)) : "",
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkOverview;
