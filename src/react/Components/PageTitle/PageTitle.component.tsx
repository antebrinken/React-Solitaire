import React, { ReactNode } from "react";
import iconUrl from "src/images/icon.png";
// import BreadCrumb from "../Router/BreadCrumb/BreadCrumb.component";
import { useHistory } from "react-router-dom";

interface PageTitleProps {
  title: ReactNode;
}

function PageTitle({ title }: PageTitleProps) {
  const history = useHistory();
  return (
    <div className="pageTitleContainer">
      <span className="pageTitleSpan">{title}</span>
      <img onClick={() => history.push("/")} className="logoTitle" src={iconUrl} alt="" />
      {/* <BreadCrumb /> */}
    </div>
  );
}

export default PageTitle;
