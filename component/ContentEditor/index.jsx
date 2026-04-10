import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import parse from "html-react-parser";
import styles from "./contentEditor.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";

const ContentEditor = ({ data, content: propContent }) => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out-cubic",
      once: true,
      offset: 100,
    });
  }, []);

  const content = propContent || data?.acf?.gc_editor || "";

  return (
    <section className="pb_80 pt_50" data-aos="fade-up">
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.content}>{parse(extractTextFromObject(content))}</div>
        </div>
      </div>
    </section>
  );
};

export default ContentEditor;
