import { CardType } from "../../../../redux/gameBoard/gameBoard.types";
import { Dispatch } from "redux";
import columnsActions from "../../../../redux/columns/columns.actions";
import gameBoardActions from "../../../../redux/gameBoard/gameBoard.actions";
import goalActions from "../../../../redux/goal/goal.actions";

/**
 * Class for the goal pile double click handler
 */
class GoalDoubleClickHandler {
  dispatch: Dispatch;
  goalId: string;
  card: CardType;

  constructor(dispatch: Dispatch, goalId: string, card: CardType) {
    this.dispatch = dispatch;
    this.goalId = goalId;
    this.card = card;
  }

  /**
   * Function called when the draggable card is double clicked
   * Try to move it to a column pile first
   */
  handleDoubleClick() {
    // Försök flytta kortet till en giltig kolumn
    this.dispatch(columnsActions.checkDoubleClickValid(this.card));
  }

  /**
   * Handles the result of trying to move the card to a column
   */
  handleColumnDoubleClickResult(columnMoveTarget?: string | boolean) {
    if (typeof columnMoveTarget === "string") {
      // Flytta kortet från goal till kolumn på ett immutabelt sätt
      this.dispatch(goalActions.removeCardFromGoal(this.goalId, this.card));
      this.dispatch(columnsActions.addCardToColumn(columnMoveTarget, this.card, false));

      // Lägg till historik för spelet
      this.dispatch(
        gameBoardActions.addGameMove({
          source: this.goalId,
          target: columnMoveTarget,
          cards: [this.card],
          movementWithFlip: false
        })
      );

      return true;
    } else {
      // Om flytten inte var giltig, försök byta kort mellan goal-piles
      this.dispatch(goalActions.checkGoalSwapDoubleClickValid(this.goalId, this.card));
    }
  }

  /**
   * Handles the result of trying to move the card to another goal pile
   */
  handleGoalDoubleClickResult(goalMoveTarget?: string | boolean) {
    if (typeof goalMoveTarget === "string") {
      // Lägg till historik för spelet utan att radera några kort
      this.dispatch(
        gameBoardActions.addGameMove({
          source: this.goalId,
          target: goalMoveTarget,
          cards: [this.card],
          movementWithFlip: true
        })
      );
      // Clear goal double-click target so future double-clicks re-trigger
      this.dispatch(goalActions.resetCardDragging());
    }
    return true;
  }
}

export default GoalDoubleClickHandler;
