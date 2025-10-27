import React from "react";
import iconUrl from "src/images/icon.png";

interface AppIconProps {
  className?: string;
}

function AppIcon({ className = "" }: AppIconProps) {
  return (
    <img className={className} src={iconUrl} alt="" />
  );
}

export default AppIcon;
