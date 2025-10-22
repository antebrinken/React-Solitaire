import { createSelector } from "reselect";
import { RootReducerState } from "../../global";
import { CardType } from "../gameBoard/gameBoard.types";
import { selectDeckCardDragging, selectDeckStartRedoAnimation, selectDeckStartRedoResetAnimation, selectDeckStartUndoAnimation } from "./deck.selectors";
import { selectGoalCardDragging } from "./goal.selectors";
import { selectColumnsCardDragging } from "./columns.selectors";

export const selectGameHintsRaw = (state: RootReducerState): Array<Record<string, string>> => (state.GameBoard as any).gameHints;

export const selectLastHint = createSelector([selectGameHintsRaw], hints => {
  const lastIndex = hints.length - 1;
  return lastIndex >= 0 ? hints[lastIndex] : undefined;
});

export const selectDraggingActive = createSelector(
  [selectDeckCardDragging, selectGoalCardDragging, selectColumnsCardDragging],
  (deckDragging?: CardType[], goalDragging?: CardType[], columnDragging?: CardType[]) => {
    return Boolean(
      (deckDragging && deckDragging.length) ||
        (goalDragging && goalDragging.length) ||
        (columnDragging && columnDragging.length)
    );
  }
);

export const selectDeckAnimActive = createSelector(
  [selectDeckStartUndoAnimation, selectDeckStartRedoAnimation, selectDeckStartRedoResetAnimation],
  (undo, redo, redoReset) => Boolean(undo || redo || redoReset)
);

