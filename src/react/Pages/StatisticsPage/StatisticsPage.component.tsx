import { AppstoreFilled, BorderOutlined } from "@ant-design/icons";
import React, { memo, useEffect, useRef, useState } from "react";
import CarouselDisplay from "../../Components/Graphs/CarouselDisplay/CarouselDisplay.component";
import DashboardDisplay from "../../Components/Graphs/DashboardDisplay/DashboardDisplay.component";
import { ExplicitAny } from "../../../global";
import { FormattedMessage } from "react-intl";
import PageTitle from "../../Components/PageTitle/PageTitle.component";
import { useDispatch } from "react-redux";

function StatisticsPage() {
  const carouselRef: ExplicitAny = useRef();

  const dispatch = useDispatch();
  const [carouselDisplay, setCarouselDisplay] = useState<boolean>(true);

  const handleCarousel = (action: string, index: number) => {
    if (action === "next" && index >= 2 && index <= 3) {
      carouselRef?.current?.innerSlider?.slickNext();
    } else if (action === "prev" && index >= 2 && index <= 4) {
      carouselRef?.current?.innerSlider?.slickPrev();
    }
  };

  // Joyride removed

  return (
    <div className="joyrideStatisticsPage mainPage statisticsPage">
      <PageTitle title={<FormattedMessage id="sidebar.statistics" />} />
      {carouselDisplay ? (
        <>
          <CarouselDisplay
            ref={carouselRef}
            className="joyrideStatisticsCarousel"
          />
          <AppstoreFilled
            className="joyrideDashboardDisplay toggleButton"
            onClick={() => setCarouselDisplay(false)}
          />
        </>
      ) : (
        <>
          <DashboardDisplay />
          <BorderOutlined
            className="toggleButton"
            onClick={() => setCarouselDisplay(true)}
          />
        </>
      )}
    </div>
  );
}

export default memo(StatisticsPage);
