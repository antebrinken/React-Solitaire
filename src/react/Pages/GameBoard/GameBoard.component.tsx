import {
  BoardEmptySpots,
  GameColumnWrapper,
  GameOptions,
  GamePlayInfo,
  GameTopRow
} from "../../Components/BoardFields/BoardFields.items";
import { ExplicitAny, RootReducerState } from "../../../global";
import {
  selectDeckPileFromGameBoard,
  selectFlippedPileFromGameBoard,
  selectGameMoves,
  selectGameOver,
  selectGameFlag,
  selectGoalsInitial,
  selectHasSavedGame,
  selectSavedGame,
  selectShowingConfirm,
  selectColumnsInitial
} from "../../../redux/selectors/gameBoard.selectors";
import { useIntl } from "react-intl";
import React, { memo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ConfirmationModal from "../../Components/Modals/ConfirmationModal.component";
import DropHandler from "../../Components/CardMoveHandlers/DropHandlers/DropHandler.component";
import GameOverModal from "../../Components/Modals/GameOverModal.component";
import AutoCompleter from "../../Components/AutoCompleter/AutoCompleter.component";
import { Prompt } from "react-router";
import columnsActions from "../../../redux/columns/columns.actions";
import deckActions from "../../../redux/deck/deck.actions";
import gameBoardActions from "../../../redux/gameBoard/gameBoard.actions";
import goalActions from "../../../redux/goal/goal.actions";
import pageActions from "../../../redux/pages/pages.actions";
import userActions from "../../../redux/user/user.actions";

function GameBoard() {
  const dispatch = useDispatch();
  const location = useLocation();
  const intl = useIntl();

  // create refs for the deck and flipped piles
  const deckRef: ExplicitAny = useRef();
  const flippedRef: ExplicitAny = useRef();
  const initializedRef = useRef<boolean>(false);

  // get all necessary elements from redux
  const gameMoves = useSelector(selectGameMoves);
  const gameOver = useSelector(selectGameOver);
  const gameFlag = useSelector(selectGameFlag);
  const deckPile = useSelector(selectDeckPileFromGameBoard);
  const flippedPile = useSelector(selectFlippedPileFromGameBoard);
  const columnsInitial = useSelector(selectColumnsInitial);
  const goalsInitial = useSelector(selectGoalsInitial);
  const showingConfirm = useSelector((state: RootReducerState) =>
    selectShowingConfirm(state) &&
    ((state.Pages.confirmationModalProps.message1 as any) !== "" ||
      state.Pages.confirmationModalProps.buttonConfirmId !== undefined)
  );
  const hasSavedGame = useSelector(selectHasSavedGame);
  const savedGame = useSelector(selectSavedGame);

  // ---------------------------------------------------------
  // Create Game

  /**
   * Triggered when the component is mounted
   * Stores the deck and flipped ref at the redux
   * Starts the page joyride
   * And either creates a new random game or resumes a previously saved game
   */
  const mountGameBoard = () => {
    // Ensure no orientation/confirm modal is shown; allow portrait play
    dispatch(gameBoardActions.showingConfirm(false));
    dispatch(pageActions.setConfirmationModal("", "", undefined, undefined));

    // set this refs at the redux
    dispatch(deckActions.setRefs(deckRef, flippedRef));

    // Joyride removed

    // if nothing was sent through the location state, then create a new game
    if (!location.state) {
      if (hasSavedGame) {
        // if there was a saved game and the user started a new one, should count as a lost
        dispatch(userActions.addGame());
        // remove saved game from user settings
        dispatch(userActions.clearSavedGame());
      }
      // create new deck
      dispatch(gameBoardActions.createGame());
    } // if the location state is defined
    else {
      // add game to the user counting
      dispatch(userActions.addGame());
      // set the initial deck
      dispatch(deckActions.setInitialDeck(savedGame.deckPile, savedGame.flippedPile));
      // set the initial columns
      dispatch(columnsActions.setInitialColumns(savedGame.columns, true));
      // set the initial goals
      dispatch(goalActions.setInitialGoals(savedGame.goals));
      // set initial game board
      dispatch(gameBoardActions.setInitialSavedGame(savedGame));
      // remove saved game from user settings
      dispatch(userActions.clearSavedGame());
    }
  };
  useEffect(mountGameBoard, []);

  /**
   * Triggered when the deck pile changes (and therefore, all the other columns and goals as well)
   * Distributes the decks *created* to the right redux
   */
  const setNewGamePiles = () => {
    // this is only done when a new game is created!
    if (!location.state && !initializedRef.current) {
      // set the initial deck
      dispatch(deckActions.setInitialDeck(deckPile, flippedPile));
      // set the initial columns
      dispatch(columnsActions.setInitialColumns(columnsInitial));
      // set the initial goals
      dispatch(goalActions.setInitialGoals(goalsInitial));
      initializedRef.current = true;
    }
  };
  useEffect(setNewGamePiles, [deckPile]);

  // Whenever a new game is created (gameFlag toggles), allow re-initialization
  useEffect(() => {
    initializedRef.current = false;
  }, [gameFlag]);

  /**
   * Triggered by the game moves
   * When a *new* game starts, it is only added to the users count when at least a move is done
   */
  const addGameToUser = () => {
    if (gameMoves === 1 && !location.state) {
      dispatch(userActions.addGame());
    }
  };
  useEffect(addGameToUser, [gameMoves]);

  // Allow play in portrait on small devices (remove rotate modal)
  const handleMobilePortrait = () => {
    dispatch(gameBoardActions.showingConfirm(false));
  };
  useEffect(handleMobilePortrait, [location.pathname]);

  // ---------------------------------------------------------

  return (
    <>
      <Prompt
        when={!gameOver && gameMoves > 0 && !showingConfirm}
        message={intl.formatMessage({ id: "confirm.gameLostExit" })}
      />
      <GameOverModal />
      {showingConfirm ? <ConfirmationModal /> : null}
      <DropHandler
        className={`joyrideGamePage mainPage ${
          showingConfirm ? "blurBackground" : ""
        }`}
      >
        {/* current game status display (time and moves) */}
        <GamePlayInfo />
        {/* empty spots */}
        <BoardEmptySpots />
        {/* top row of the game, includes the deck and the 4 goal spots */}
        <GameTopRow />
        {/* bottom row of the game, includes all the 7 columns */}
        <GameColumnWrapper />
        {/* game options buttons */}
        <GameOptions />
        {/* Drag overlay handled globally by DndKitProvider */}
        {/* auto-complete once all columns are flipped */}
        <AutoCompleter />
      </DropHandler>
    </>
  );
}

export default memo(GameBoard);
