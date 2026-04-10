import React from "react";
import Image from "next/image";
import button from "@/styles/buttion.module.scss"; // Assuming you are using a CSS module for button styles
import Link from "next/link";

const Button = ({ text, href, moduleClass, imageSrc }) => {
  return (
    <Link className={`${button.button} ${button.blue} ${moduleClass}`} href={href}>
      <span>{text}</span>
      <Image
        src={imageSrc} // Use the image source prop
        alt="call"
        width={15}
        height={15}
      />
    </Link>
  );
};

export default Button;
