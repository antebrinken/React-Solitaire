/* eslint-disable indent */
import {
  addDragginCardsToGoal,
  checkDoubleClickValid,
  checkGoalSwapDoubleClickValid,
  checkMoveFromAnyColumns,
  setCardDragging,
  swapGoals,
  undoSwapGoals
} from "./goal.utils";
import { ActionsCreators } from "./goal.actions";
import { CardType } from "../gameBoard/gameBoard.types";
import GoalActionTypes from "./goal.types";

export interface InitialGoal {
  goals: {
    goal1Pile: Array<CardType>;
    goal2Pile: Array<CardType>;
    goal3Pile: Array<CardType>;
    goal4Pile: Array<CardType>;
  };
  cardDragging?: Array<CardType>;
  cardDraggingGoal?: string;
  sendBack?: boolean;
  doubleClickTarget?: boolean | string;
  hintSource?: boolean | string;
  gameOver: boolean;
}

const INITIAL_GOAL: InitialGoal = {
  goals: {
    goal1Pile: [],
    goal2Pile: [],
    goal3Pile: [],
    goal4Pile: []
  },
  cardDragging: undefined,
  cardDraggingGoal: undefined,
  sendBack: undefined,
  doubleClickTarget: undefined,
  hintSource: undefined,
  gameOver: false
};

// -----------------------------------
// Hjälpfunktioner för immutabla uppdateringar
// -----------------------------------

// Ta bort kort från goal pile immutabelt
function removeCardFromGoalImmutable(
  goals: Record<string, CardType[]>,
  goalId: string,
  cardToRemove: CardType
) {
  return {
    goals: {
      ...goals,
      [goalId]: goals[goalId].filter(card => card.id !== cardToRemove.id)
    }
  };
}

// Lägg till kort i goal pile immutabelt
function addCardToGoalImmutable(
  goals: Record<string, CardType[]>,
  goalId: string,
  cardToAdd: CardType
) {
  return {
    goals: {
      ...goals,
      [goalId]: [...goals[goalId], cardToAdd]
    }
  };
}

// -----------------------------------
// Reducer
// -----------------------------------
const goalReducer = (state = INITIAL_GOAL, action: ActionsCreators) => {
  switch (action.type) {
    // ------------------------
    // Initial settings
    // ------------------------
    case GoalActionTypes.SET_INITIAL_GOALS:
      return {
        goals: action.goals,
        cardDragging: undefined,
        cardDraggingGoal: undefined,
        sendBack: undefined,
        doubleClickTarget: undefined,
        hintSource: undefined,
        gameOver: false
      };

    // ------------------------
    // Swap actions
    // ------------------------
    case GoalActionTypes.SWAP_GOALS:
      const swapResult = swapGoals(
        state.goals,
        state.cardDragging,
        state.cardDraggingGoal,
        action.finalId
      );
      return { ...state, ...swapResult };

    case GoalActionTypes.UNSWAP_GOALS:
      const unswapResult = undoSwapGoals(
        state.goals,
        action.target,
        action.source
      );
      return { ...state, ...unswapResult };

    // ------------------------
    // Dragging actions
    // ------------------------
    case GoalActionTypes.DRAG_GOAL_CARDS:
      const draggingResult = setCardDragging(state.goals, action.goalId);
      return { ...state, ...draggingResult };

    case GoalActionTypes.ADD_DRAGGING_CARDS_TO_GOAL:
      const addDragResult = addDragginCardsToGoal(
        state.goals,
        action.finalId,
        action.cardDragging
      );
      return { ...state, ...addDragResult };

    case GoalActionTypes.RESET_GOAL_CARD_DRAGGING:
      return {
        ...state,
        sendBack: undefined,
        cardDragging: undefined,
        cardDraggingGoal: undefined,
        doubleClickTarget: !state.doubleClickTarget,
        gameOver: false
      };

    // ------------------------
    // Remove/Add cards immutably
    // ------------------------
    case GoalActionTypes.ADD_CARD_TO_GOAL:
      return {
        ...state,
        ...addCardToGoalImmutable(state.goals, action.goalId, action.card)
      };

    case GoalActionTypes.REMOVE_CARD_FROM_GOAL:
      return {
        ...state,
        ...removeCardFromGoalImmutable(state.goals, action.goalId, action.card)
      };

    // ------------------------
    // Double-click actions
    // ------------------------
    case GoalActionTypes.CHECK_DOUBLE_CLICK_VALID:
      const checkDoubleClickResult = checkDoubleClickValid(
        state.goals,
        action.card,
        state.doubleClickTarget
      );
      return { ...state, ...checkDoubleClickResult };

    case GoalActionTypes.CHECK_GOAL_SWAP_DOUBLE_CLICK_VALID:
      const checkGoalSwapDoubleClickResult = checkGoalSwapDoubleClickValid(
        state.goals,
        action.goalId,
        action.card,
        state.doubleClickTarget
      );
      return { ...state, ...checkGoalSwapDoubleClickResult };

    case GoalActionTypes.CHECK_MOVE_FROM_ANY_COLUMN:
      const checkMoveFromColumnsResult = checkMoveFromAnyColumns(
        state.goals,
        action.columns,
        action.previousHints,
        state.doubleClickTarget
      );
      return { ...state, ...checkMoveFromColumnsResult };

    default:
      return state;
  }
};

export default goalReducer;
