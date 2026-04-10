import React, { useEffect } from 'react';
import styles from './FAQ.module.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { extractTextFromObject } from "@/libs/utils/helpers";
import parse from "html-react-parser";

const FAQ = ({ 
  title = "Frequently Asked Questions",
  faqData = [] 
}) => {
  // Don't render if no content provided
  if (!faqData || faqData.length === 0) {
    return null;
  }

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  const safeTitle = extractTextFromObject(title);

  return (
    <section className={styles.faqSection}>
      <div className="container">
        <h2 className="main_title" data-aos="fade-up">{safeTitle}</h2>
        
        <div className={styles.faqGrid}>
          {faqData.map((item, index) => {
            const question = extractTextFromObject(item.question);
            const answer = extractTextFromObject(item.answer);
            return (
            <div 
              key={item.id || index} 
              className={styles.faqCard}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className={styles.cardAccent}></div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardQuestion}>{question}</h3>
                <div className={styles.cardAnswer}>
                  {typeof answer === 'string' && answer.includes('<') ? parse(answer) : <p>{answer}</p>}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
