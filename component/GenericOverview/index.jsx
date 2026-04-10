import React from "react";
import parse from "html-react-parser";
import style from "./GenericOverview.module.scss";
import { safeParse, extractTextFromObject } from "@/libs/utils/helpers";

const GenericOverview = ({
  maintitle,
  subtitle,
  content,
  bottom_black_box,
  title_black,
  description_black,
  data,
}) => { 
  
  // Allow passing via props directly or via data object (ACF pattern)
  const title = maintitle || data?.acf?.maintitle || "";
  const sub = subtitle || data?.acf?.subtitle || "";
  const desc = content || data?.acf?.content || ""; 

  const showBlackBox = bottom_black_box !== undefined ? bottom_black_box : data?.acf?.bottom_black_box;
  const blackTitle = title_black || data?.acf?.bottom_black_box_title || "";
  const blackDesc = description_black || data?.acf?.bottom_black_box_description || "";

  return (
    <div className={`container ${style.header_content} mt_50`}>
      {sub && <h3>{extractTextFromObject(sub)}</h3>}
      <div className={style.desc_container}>
        {title && <h2 className="main_title hp_space_mb main_title_up">
          {extractTextFromObject(title)}
        </h2>}
        {parse(extractTextFromObject(desc))}

        {(showBlackBox === true || showBlackBox === "true" || showBlackBox == 1) && (
          <div className={style.repeat_business_container}>
            {blackTitle && <h4>{extractTextFromObject(blackTitle)}</h4>}
            {blackDesc && <div>{parse(extractTextFromObject(blackDesc))}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericOverview;
