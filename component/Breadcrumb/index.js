import React from "react";
import Link from "next/link";
import OptimizedImage from "../OptimizedImage";
import styles from "./Breadcrumb.module.scss";

const Breadcrumb = ({ items = [], detailpage, background }) => {
  if (!items || items.length === 0 || items.length === 1) return null;

  return (
    <div
      className={`${styles.breadcrumb} ${background ? styles.darkBackground : ""}`}
      aria-label="Breadcrumb"
      style={detailpage ? { marginLeft: "0px" } : {}}
    >
      <div
        className="container"
        style={detailpage ? { paddingLeft: "0px", marginLeft: "0px" } : {}}
      >
        <ul className={styles.breadcrumbList}>
          {items.map((item, index) => (
            <li key={index} className={styles.breadcrumbItem}>
              {index > 0 && (
                <div className={styles.separator} aria-hidden="true">
                  {/* <OptimizedImage
                    src="/images/Icon.svg"
                    alt="separator"
                    width={16}
                    height={16}
                  /> */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.39844 2.6709L11.3984 7.6709L6.39844 12.6709"
                      stroke="#7D7E7D"
                      stroke-width="1.5"
                    />
                  </svg>
                </div>
              )}
              {item.href && index < items.length - 1 ? (
                <Link href={item.href} className={styles.breadcrumbLink}>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className={styles.breadcrumbLink}>
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Breadcrumb;
