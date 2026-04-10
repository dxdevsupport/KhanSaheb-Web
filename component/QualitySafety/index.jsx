import React, { useEffect } from "react";
import style from "./qualitySafety.module.scss";
import digitalToolsData from "@/data/digitalToolsData.json";
import OptimizedImage from "@/component/OptimizedImage";
import AOS from "aos";
import "aos/dist/aos.css";
import parse from "html-react-parser";
import { extractTextFromObject } from "@/libs/utils/helpers";

function QualitySafety({data}) {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <div className={`${style.header_container} pt_80 pb_80`}>
      <div className="container">
        <div className={style.content_grid}>
          <div data-aos="fade-up" data-aos-delay="300">
          <div className={style.text_section}>
            <h2 className="main_title hp_space_mb">
              {data?.acf?.dc_qc_title
                ? parse(extractTextFromObject(data.acf.dc_qc_title))
                : ""}
            </h2>
            <div className={style.subtitle}>
              {data?.acf?.fb_dc_sub_title
                ? parse(extractTextFromObject(data.acf.fb_dc_sub_title))
                : ""}
            </div>
            <div className={style.tools_list}>
              {(data?.acf?.dc_qc_tools || digitalToolsData.tools)?.map(
                (tool, idx) => (
                  <div key={idx} className={style.tool_item}>
                    <div className={style.tool_icon}>
                      <OptimizedImage
                        src={
                          tool.dc_qc_tool_icon?.url || digitalToolsData.tools[idx]?.icon
                        }
                        alt={tool.dc_qc_tool_icon?.alt || tool.dc_qc_tool_title}
                        fill
                      />
                    </div>
                    <span className={style.tool_text}>
                      {extractTextFromObject(tool.tool_name)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="800">
            <div className={style.image_section}>
              <OptimizedImage
                src="/images/productivity.png"
                alt="Quality, Safety & Productivity"
                width={600}
                height={400}
                className={style.productivity_image}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default QualitySafety;
