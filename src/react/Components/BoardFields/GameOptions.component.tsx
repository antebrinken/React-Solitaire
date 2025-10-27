import { DownCircleFilled, UpCircleFilled } from "@ant-design/icons";
import React, { useState } from "react";
import { Row, Tooltip } from "antd";
import BarDisplay from "../DataDisplay/BarDisplay/BarDisplay.component";
import ExitGameButton from "../Buttons/ExitGameButton.component";
import { FormattedMessage } from "react-intl";
import HintButton from "../Buttons/HintButton.component";
import NewGameButton from "../Buttons/NewGameButton.component";
import PauseGameButton from "../Buttons/PauseGameButton.component";
import RedoButton from "../Buttons/RedoButton.component";
import RestartGameButton from "../Buttons/RestartGameButton.component";
import SaveGameButton from "../Buttons/SaveGameButton.component";
import UndoButton from "../Buttons/UndoButton.component";
import { useDispatch } from "react-redux";

/* Will be the game options - to be developed */
function GameOptions() {
  const dispatch = useDispatch();
  const [showMore, setShowMore] = useState(false);
  const handleShowMore = () => {
    setShowMore(true);
  };
  return (
    <>
      <Row className="boardMainOptionsRow" align="middle" justify="center">
        <BarDisplay>
          <UndoButton />
          <PauseGameButton />
          {showMore ? (
            <Tooltip title={<FormattedMessage id="btn.hide" />}>
              <DownCircleFilled
                className="iconButton"
                onClick={() => setShowMore(false)}
              />
            </Tooltip>
          ) : (
            <Tooltip title={<FormattedMessage id="btn.showMore" />}>
              <UpCircleFilled
                className="joyrideShowMore iconButton"
                onClick={handleShowMore}
              />
            </Tooltip>
          )}
          <HintButton />
          <RedoButton />
        </BarDisplay>
      </Row>

      {showMore ? (
        <Row className="boardMenuOptionsRow" align="middle" justify="center">
          <BarDisplay>
            <RestartGameButton />
            <NewGameButton />
            <ExitGameButton />
            <SaveGameButton />
          </BarDisplay>
        </Row>
      ) : null}
    </>
  );
}

export default GameOptions;
