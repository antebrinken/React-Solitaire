import { Dispatch } from "redux";
import { GameMove } from "../../../../redux/gameBoard/gameBoard.types";
import columnsActions from "../../../../redux/columns/columns.actions";
import deckActions from "../../../../redux/deck/deck.actions";
import gameBoardActions from "../../../../redux/gameBoard/gameBoard.actions";
import goalActions from "../../../../redux/goal/goal.actions";

class GoalDrop {
  dispatch: Dispatch;

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  /**
   * Handles the drop of a card
   * @param move the card move that was initiated
   * @param fieldDropedTo field the card was dropped to (should be a goal field)
   */
  onDrop(move: GameMove, fieldDropedTo: string) {
    if (move.cards[0]?.cardField.includes("goal")) {
      // goal -> goal
      // if it was a goal swap, then swap the cards from one column to the other
      this.dispatch(goalActions.swapGoals(fieldDropedTo));
      // then reset
      this.dispatch(goalActions.resetCardDragging());
    }
    // if the card came from the deck or from a column
    else {
      // deck -> goal | column -> goal
      // call the goal action that adds the dragging cards to the goal
      if (move.cards && move.cards.length > 0) {
        this.dispatch(
          goalActions.addDraggingCardsToGoal(fieldDropedTo, move.cards)
        );
      }

      // then reset the values at the deck redux
      this.dispatch(deckActions.resetCardDragging());
      // do NOT reset columns dragging here; we need it for removal in handleRemoveCard
    }
  }

  /**
   * When the sendBackGoal changes, it means that a move to a goal has finished
      - if it is true, then the move should not happen (do nothing)
      - if it is false, then the move should happen:
        - send the cardsDragging to the corresponding target (goal or column);
        - remove the card from the goal it came from
  */
  handleRemoveCard(finalMove: GameMove) {
    // If it was a goal -> goal move, swapping already handled removal in reducer
    if (
      finalMove.source.indexOf("goal") === 0 &&
      finalMove.target.indexOf("goal") === 0
    ) {
      this.dispatch(goalActions.resetCardDragging());
      this.dispatch(gameBoardActions.addGameMove(finalMove));
      return;
    }
    // if the card came from the deck pile
    if (finalMove.cards[0]?.cardField === "deckPile") {
      // then remove the specific card that still is in the flipped pile and clear cardDragging state
      this.dispatch(deckActions.removeSpecificCardFromFlipped(finalMove.cards[0]));
    } else {
      // if the card came from a column
      if (finalMove.source.indexOf("column") === 0) {
        // then remove the specific card from the source column and clear cardDragging state
        this.dispatch(
          columnsActions.removeSpecificCardFromColumn(
            finalMove.source,
            finalMove.cards[0]
          )
        );
        // now safe to reset columns dragging state
        this.dispatch(columnsActions.resetCardDragging());
      } else if (finalMove.source.indexOf("goal") === 0) {
        // if the card came from a goal, remove it from the origin goal pile explicitly
        this.dispatch(
          goalActions.removeCardFromGoal(
            finalMove.source,
            finalMove.cards[0]
          )
        );
      }
      // the goal -> goal move is handled at the goal redux
    }
    // clear goal's send back state
    this.dispatch(goalActions.resetCardDragging());
    // add game move
    this.dispatch(gameBoardActions.addGameMove(finalMove));
  }
}

export default GoalDrop;
