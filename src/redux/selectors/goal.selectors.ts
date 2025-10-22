import { RootReducerState } from "../../global";
import { CardType } from "../gameBoard/gameBoard.types";

export const selectGoals = (state: RootReducerState): Record<string, CardType[]> => state.Goal.goals as any;
export const selectGoalPile = (state: RootReducerState, goalId: string): CardType[] =>
  (state.Goal.goals ? (state.Goal.goals as any)[goalId] : []) as CardType[];
export const selectGoalCardDragging = (state: RootReducerState): CardType[] | undefined => (state.Goal as any).cardDragging;
export const selectGoalDoubleClickTarget = (state: RootReducerState): string | boolean | undefined => (state.Goal as any).doubleClickTarget;
export const selectGoalHintSource = (state: RootReducerState): string | boolean | undefined => (state.Goal as any).hintSource;
