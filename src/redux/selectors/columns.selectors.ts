import { RootReducerState } from "../../global";
import { CardType } from "../gameBoard/gameBoard.types";

export const selectColumns = (state: RootReducerState): Record<string, CardType[]> => (state.Columns as any).columns;
export const selectColumnsCardDragging = (state: RootReducerState): CardType[] | undefined => (state.Columns as any).cardDragging;
export const selectColumnsCardDraggingCol = (state: RootReducerState): string | undefined => (state.Columns as any).cardDraggingCol;
export const selectColumnsMovementWithFlip = (state: RootReducerState): boolean | undefined => (state.Columns as any).movementWithFlip;
export const selectColumnsDoubleClickTarget = (state: RootReducerState): string | boolean | undefined => (state.Columns as any).doubleClickTarget;
export const selectColumnsMovingCards = (state: RootReducerState): CardType[] | undefined => (state.Columns as any).movingCards;
