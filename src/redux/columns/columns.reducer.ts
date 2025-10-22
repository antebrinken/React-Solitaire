/* eslint-disable indent */
import {
  addCardToColumn,
  addDragginCardsToColumn,
  checkColumnSwapDoubleClickValid,
  checkDoubleClickValid,
  checkMoveFromAnyColumn,
  createColumns,
  removeDraggedCard,
  removeSpecificCardFromColumn,
  removeNCardsFromColumn,
  setCardDragging,
  swapColumns,
  undoSwapColumns
} from "./columns.utils";
import { ActionsCreators } from "./columns.actions";
import { CardType } from "../gameBoard/gameBoard.types";
import ColumnsActionTypes from "./columns.types";

export interface InitialColumns {
  columns: {
    column1Pile: Array<CardType>;
    column2Pile: Array<CardType>;
    column3Pile: Array<CardType>;
    column4Pile: Array<CardType>;
    column5Pile: Array<CardType>;
    column6Pile: Array<CardType>;
    column7Pile: Array<CardType>;
  };
  cardDragging?: Array<CardType>;
  cardDraggingCol?: string;
  sendBack?: boolean;
  movementWithFlip?: boolean;
  doubleClickTarget?: boolean | string;
  hintSource?: boolean | string;
  movingCards?: Array<CardType>;
  columnMoveSource?: string;
}

const INITIAL_COLUMNS: InitialColumns = {
  columns: {
    column1Pile: [],
    column2Pile: [],
    column3Pile: [],
    column4Pile: [],
    column5Pile: [],
    column6Pile: [],
    column7Pile: []
  },
  cardDragging: undefined,
  cardDraggingCol: undefined,
  sendBack: undefined,
  movementWithFlip: undefined,
  doubleClickTarget: undefined,
  hintSource: undefined,
  movingCards: undefined,
  columnMoveSource: undefined
};

// Removed legacy immutable helpers (unused)

// -------------------------------
// Reducer
// -------------------------------
const columnsReducer = (state = INITIAL_COLUMNS, action: ActionsCreators) => {
  switch (action.type) {
    case ColumnsActionTypes.SET_INITIAL_COLUMNS:
      return {
        columns: createColumns(action.columns, action.keepFlipped),
        cardDragging: undefined,
        cardDraggingCol: undefined,
        sendBack: undefined
      };

    case ColumnsActionTypes.SWAP_COLUMNS:
      if (!action.finalId.includes(state.cardDraggingCol || "")) {
        const resultSwap = swapColumns(
          state.columns,
          state.cardDragging,
          state.cardDraggingCol,
          action.finalId
        );
        return { ...state, ...resultSwap };
      }
      return state;

    case ColumnsActionTypes.UNDO_SWAP_COLUMNS:
      const resultUnswap = undoSwapColumns(
        state.columns,
        action.target,
        action.source,
        action.nCards,
        action.flip,
        action.typeRedoMovement
      );
      return { ...state, ...resultUnswap };

    case ColumnsActionTypes.DRAG_COLUMN_CARDS:
      const draggingResult = setCardDragging(
        state.columns,
        action.columnId,
        action.nCards
      );
      return { ...state, ...draggingResult };

    case ColumnsActionTypes.ADD_DRAGGING_CARDS_TO_COLUMN:
      const addDraggingResult = addDragginCardsToColumn(
        state.columns,
        action.finalId,
        action.cardDragging
      );
      return {
        ...state,
        columns: addDraggingResult.columns || state.columns,
        sendBack: addDraggingResult.sendBack
      };

    case ColumnsActionTypes.REMOVE_DRAGGED_CARDS_FROM_COLUMN:
      return {
        ...state,
        ...removeDraggedCard(state.columns, state.cardDraggingCol!)
      };

    case ColumnsActionTypes.REMOVE_SPECIFIC_CARD_FROM_COLUMN:
      return {
        ...state,
        ...removeSpecificCardFromColumn(
          state.columns,
          action.columnId,
          action.card
        )
      };

    case ColumnsActionTypes.RESET_COLUMN_CARD_DRAGGING:
      return {
        ...state,
        cardDragging: undefined,
        cardDraggingCol: undefined,
        sendBack: undefined,
        movementWithFlip: undefined,
        doubleClickTarget: undefined,
        movingCards: undefined,
        columnMoveSource: undefined
      };

    case ColumnsActionTypes.ADD_CARD_TO_COLUMN:
      const addCardResult = addCardToColumn(
        state.columns,
        action.columnId,
        action.card,
        action.flip
      );
      return {
        ...state,
        ...addCardResult
      };

    case ColumnsActionTypes.REMOVE_N_CARDS_FROM_COLUMN:
      return {
        ...state,
        ...removeNCardsFromColumn(
          state.columns,
          action.columnId,
          action.nCards,
          action.flip
        )
      };

    case ColumnsActionTypes.CHECK_DOUBLE_CLICK_VALID:
      return {
        ...state,
        ...checkDoubleClickValid(
          state.columns,
          action.card,
          state.doubleClickTarget
        )
      };

    case ColumnsActionTypes.CHECK_COLUM_SWAP_DOUBLE_CLICK_VALID:
      return {
        ...state,
        ...checkColumnSwapDoubleClickValid(
          state.columns,
          action.sourceId,
          action.nCards,
          state.doubleClickTarget
        )
      };

    case ColumnsActionTypes.SWAP_DOUBLE_CLICK:
      if (state.movingCards) {
        const swapColumnsDoubleClick = swapColumns(
          state.columns,
          action.movingCards,
          action.sourceId,
          action.targetId
        );
        return {
          ...state,
          columns: swapColumnsDoubleClick.columns,
          sendBack: swapColumnsDoubleClick.sendBack,
          movementWithFlip: swapColumnsDoubleClick.movementWithFlip,
          doubleClickTarget: undefined,
          movingCards: undefined
        };
      }
      return state;

    case ColumnsActionTypes.CHECK_MOVE_FROM_ANY_COLUMN:
      return {
        ...state,
        ...checkMoveFromAnyColumn(
          state.columns,
          action.deckPile,
          action.previousHints,
          state.doubleClickTarget
        )
      };

    default:
      return state;
  }
};

export default columnsReducer;
