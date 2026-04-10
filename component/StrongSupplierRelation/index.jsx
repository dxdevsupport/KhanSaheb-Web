import React, { isValidElement } from "react";
import style from "./strongSupplier.module.scss";
import { extractTextFromObject } from "@/libs/utils/helpers";
import parse from "html-react-parser";

function StrongSupplierRelation({ bgImg, title, description }) {
  return (
    <div className={`${style.strong_supplier_section} pb_80`}>
      <div className="container">
        <div
          className={style.strong_supplier_container}
          style={bgImg ? { backgroundImage: `url(${bgImg})` } : {}}
        >
          <div className={style.image_overlay}></div>
          <div className={style.red_triangle}></div>
            <div className={style.content_wrapper}>
              <h2 className={style.heading}>{extractTextFromObject(title)}</h2>
              <div className={style.description}>
                {/* We maintain long-standing partnerships with prequalified
                suppliers who share our values of quality, safety, and
                integrity. Each supplier undergoes a formal prequalification
                process, and major subcontractors are assessed through audits
                and compliance checks in line with our procurement policy and
                Code of Conduct. This is part of our welfare due diligence
                initiative, aimed at protecting the workers in our supply chain. */}
                {isValidElement(description) || Array.isArray(description)
                  ? description
                  : parse(extractTextFromObject(description))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export default StrongSupplierRelation;
