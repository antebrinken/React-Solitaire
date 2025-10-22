import { RootReducerState } from "../../global";
import { CardType, GameMove } from "../gameBoard/gameBoard.types";

export const selectGameMoves = (state: RootReducerState): number => (state.GameBoard as any).gameMoves;
export const selectShowingConfirm = (state: RootReducerState): boolean => (state.GameBoard as any).showingConfirm;
export const selectSavedGame = (state: RootReducerState): any => state.User.user.savedGame || {};
export const selectHasSavedGame = (state: RootReducerState): boolean => state.User.user.hasSavedGame;

export const selectColumnsInitial = (state: RootReducerState): Record<string, CardType[]> => ({
  column1Pile: (state.GameBoard as any).column1Pile,
  column2Pile: (state.GameBoard as any).column2Pile,
  column3Pile: (state.GameBoard as any).column3Pile,
  column4Pile: (state.GameBoard as any).column4Pile,
  column5Pile: (state.GameBoard as any).column5Pile,
  column6Pile: (state.GameBoard as any).column6Pile,
  column7Pile: (state.GameBoard as any).column7Pile
});

export const selectGoalsInitial = (state: RootReducerState): Record<string, CardType[]> => ({
  goal1Pile: (state.GameBoard as any).goal1Pile,
  goal2Pile: (state.GameBoard as any).goal2Pile,
  goal3Pile: (state.GameBoard as any).goal3Pile,
  goal4Pile: (state.GameBoard as any).goal4Pile
});

export const selectGameOver = (state: RootReducerState): boolean => state.Goal.gameOver;
export const selectGameFlag = (state: RootReducerState): boolean => (state.GameBoard as any).gameFlag;
export const selectDeckPileFromGameBoard = (state: RootReducerState): CardType[] => (state.GameBoard as any).deckPile;
export const selectFlippedPileFromGameBoard = (state: RootReducerState): CardType[] => (state.GameBoard as any).flippedPile;
export const selectGameHints = (state: RootReducerState): Array<Record<string, string>> => (state.GameBoard as any).gameHints;
export const selectGamePreviousMoves = (state: RootReducerState): GameMove[] => (state.GameBoard as any).gamePreviousMoves;
export const selectGameNextMoves = (state: RootReducerState): GameMove[] => (state.GameBoard as any).gameNextMoves;
