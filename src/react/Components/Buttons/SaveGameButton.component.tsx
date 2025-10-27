import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import React from "react";
import { RootReducerState } from "../../../global";
import { SaveFilled } from "@ant-design/icons";
import { Tooltip } from "antd";
import gameBoardActions from "../../../redux/gameBoard/gameBoard.actions";
import pageActions from "../../../redux/pages/pages.actions";
import { useHistory } from "react-router-dom";
import userActions from "../../../redux/user/user.actions";
import { selectDeckPile, selectFlippedPile } from "../../../redux/selectors/deck.selectors";
import { selectColumns } from "../../../redux/selectors/columns.selectors";
import { selectGoals } from "../../../redux/selectors/goal.selectors";
import { selectGameMoves } from "../../../redux/selectors/gameBoard.selectors";

function SaveGameButton() {
  const history = useHistory();
  const dispatch = useDispatch();
  // get piles from redux
  const {
    deckPile,
    flippedPile,
    columns,
    goals,
    gameTime,
    gameMoves,
    nHints
  } = useSelector((state: RootReducerState) => ({
    deckPile: selectDeckPile(state),
    flippedPile: selectFlippedPile(state),
    columns: selectColumns(state),
    goals: selectGoals(state),
    gameTime: (state.GameBoard as any).gameTime,
    gameMoves: selectGameMoves(state),
    nHints: (state.GameBoard as any).nHints
  }));

  const showConfimationModal = () => {
    dispatch(gameBoardActions.showingConfirm(true));
    dispatch(
      pageActions.setConfirmationModal(
        <FormattedMessage id="confirm.saveGame1" />,
        <FormattedMessage id="confirm.saveGame2" />,
        handleCancelConfirm,
        saveGame,
        "adjustToGameOptions"
      )
    );
  };

  const saveGame = () => {
    dispatch(
      userActions.saveGame({
        deckPile,
        flippedPile,
        columns,
        goals,
        gameTime,
        gameMoves,
        nHints
      })
    );
    dispatch(gameBoardActions.showingConfirm(false));
    history.push("/");
  };

  const handleCancelConfirm = () => {
    dispatch(gameBoardActions.showingConfirm(false));
  };

  return (
    <>
      <Tooltip title={<FormattedMessage id="btn.saveGame" />}>
        <SaveFilled className="iconButton" onClick={showConfimationModal} />
      </Tooltip>
    </>
  );
}

export default SaveGameButton;
