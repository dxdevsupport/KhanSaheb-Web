import React, { useState } from "react";
import style from "./faqCarousel.module.scss";
import parse, { domToReact } from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

function FaqCarousel({faqData}) {
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpanded = (index) => {
    if (expandedItem === index) {
      // If clicking the same item, close it
      setExpandedItem(null);
    } else {
      // Open the clicked item (this will automatically close any other open item)
      setExpandedItem(index);
    }
  };

  const renderFaqItem = (item, originalIndex) => {
    const question = extractTextFromObject(item.cu_faq_question) || extractTextFromObject(item.question) || "";
    const answer = extractTextFromObject(item.cu_faq_answer) || extractTextFromObject(item.answer) || "";

    return (
      <div key={item.id || originalIndex} className={style.faq_item}>
        <div className={style.faq_question} onClick={() => toggleExpanded(originalIndex)}>
          <span className={style.question_text}>{question}</span>
          <div className={`${style.expand_icon} ${expandedItem === originalIndex ? style.expanded : ""}`}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="#E60033" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        {expandedItem === originalIndex && (
          <div className={style.faq_answer}>{typeof answer === 'string' && answer.includes('<') ? parse(answer) : <p>{answer}</p>}</div>
        )}
      </div>
    );
  };

  return (
    <div className={`${style.faq_section} pt_80 pb_80`}>
      <div className="container">
        <div data-aos="fade-up" data-aos-delay="600">
        <h2 className="main_title hp_space_mb">Frequently Asked Questions</h2>
        </div>
        <div className={style.faq_container}>
          <div className={style.faq_grid}>
            <div className={style.faq_column}>
              {faqData
                .filter((_, index) => index % 2 === 0)
                .map((item, _, arr) => renderFaqItem(item, faqData.indexOf(item)))}
            </div>
            <div className={style.faq_column}>
              {faqData
                .filter((_, index) => index % 2 !== 0)
                .map((item, _, arr) => renderFaqItem(item, faqData.indexOf(item)))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaqCarousel;
