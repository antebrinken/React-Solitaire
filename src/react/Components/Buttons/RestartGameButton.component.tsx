import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import React from "react";
import { RedoOutlined } from "@ant-design/icons";
import { RootReducerState, ExplicitAny } from "../../../global";
import { Tooltip } from "antd";
import columnsActions from "../../../redux/columns/columns.actions";
import deckActions from "../../../redux/deck/deck.actions";
import gameBoardActions from "../../../redux/gameBoard/gameBoard.actions";
import goalActions from "../../../redux/goal/goal.actions";
import pageActions from "../../../redux/pages/pages.actions";

/**
 * Option to start a new game, with a confirmation dialog
 */
function RestartGameButton() {
  const dispatch = useDispatch();
  const {
    deckPile,
    flippedPile,
    column1Pile,
    column2Pile,
    column3Pile,
    column4Pile,
    column5Pile,
    column6Pile,
    column7Pile,
    goal1Pile,
    goal2Pile,
    goal3Pile,
    goal4Pile,
    gameMoves
  } = useSelector<
    RootReducerState,
    {
      deckPile: ExplicitAny[];
      flippedPile: ExplicitAny[];
      column1Pile: ExplicitAny[];
      column2Pile: ExplicitAny[];
      column3Pile: ExplicitAny[];
      column4Pile: ExplicitAny[];
      column5Pile: ExplicitAny[];
      column6Pile: ExplicitAny[];
      column7Pile: ExplicitAny[];
      goal1Pile: ExplicitAny[];
      goal2Pile: ExplicitAny[];
      goal3Pile: ExplicitAny[];
      goal4Pile: ExplicitAny[];
      gameMoves: number;
    }
  >(({ GameBoard, Deck }: RootReducerState) => ({
    deckPile: Deck.deckPile,
    flippedPile: Deck.flippedPile,
    column1Pile: (GameBoard as ExplicitAny).column1Pile,
    column2Pile: (GameBoard as ExplicitAny).column2Pile,
    column3Pile: (GameBoard as ExplicitAny).column3Pile,
    column4Pile: (GameBoard as ExplicitAny).column4Pile,
    column5Pile: (GameBoard as ExplicitAny).column5Pile,
    column6Pile: (GameBoard as ExplicitAny).column6Pile,
    column7Pile: (GameBoard as ExplicitAny).column7Pile,
    goal1Pile: (GameBoard as ExplicitAny).goal1Pile,
    goal2Pile: (GameBoard as ExplicitAny).goal2Pile,
    goal3Pile: (GameBoard as ExplicitAny).goal3Pile,
    goal4Pile: (GameBoard as ExplicitAny).goal4Pile,
    gameMoves: (GameBoard as ExplicitAny).gameMoves
  }));

  // distribute the decks created to the right redux
  const restartGame = () => {
    // set the initial deck
    dispatch(deckActions.setInitialDeck(deckPile, flippedPile));
    // set the initial columns
    dispatch(
      columnsActions.setInitialColumns({
        column1Pile,
        column2Pile,
        column3Pile,
        column4Pile,
        column5Pile,
        column6Pile,
        column7Pile
      })
    );
    // set the initial deck
    dispatch(
      goalActions.setInitialGoals({
        goal1Pile,
        goal2Pile,
        goal3Pile,
        goal4Pile
      })
    );
    // toggle the timer flag
    dispatch(gameBoardActions.toggleGameFlag());

    dispatch(gameBoardActions.showingConfirm(false));
  };

  const handleShowConfirm = () => {
    if (gameMoves > 0) {
      dispatch(gameBoardActions.showingConfirm(true));
      dispatch(
        pageActions.setConfirmationModal(
          <FormattedMessage id="confirm.gameLostExit" />,
          <FormattedMessage id="confirm.restart" />,
          handleCancelConfirm,
          restartGame,
          "adjustToGameOptions"
        )
      );
    }
  };

  const handleCancelConfirm = () => {
    dispatch(gameBoardActions.showingConfirm(false));
  };

  return (
    <>
      <Tooltip title={<FormattedMessage id="btn.restart" />}>
        <RedoOutlined
          className={`joyrideRestart iconButton ${
            gameMoves === 0 ? "iconButtonDisabled" : ""
          }`}
          onClick={handleShowConfirm}
        />
      </Tooltip>
    </>
  );
}
export default RestartGameButton;
