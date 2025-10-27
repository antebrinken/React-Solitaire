import React from "react";

interface CardImageProps {
  image?: string;
  directory: string;
  additionalClassName?: string;
  onClick?: () => void;
}

function CardImage({
  image = "default.png",
  directory,
  additionalClassName = "",
  onClick
}: CardImageProps) {
  const handleOnClick = () => {
    if (typeof onClick === "function") {
      onClick();
    }
  };

  // Map all images under /src/images to URLs (Vite)
  const images = import.meta.glob("/src/images/**/*", { eager: true, as: "url" }) as Record<string, string>;
  const key = `/src/images/${directory}/${image}`;
  const src = images[key] || images["/src/images/" + directory + "/default.png"];

  return (
    <div
      onClick={handleOnClick}
      className={`cardDefault ${additionalClassName}`}
    >
      <img
        className="cardImage"
        src={src as unknown as string}
        alt=""
      />
    </div>
  );
}

export default CardImage;
