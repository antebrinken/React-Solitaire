import React, { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardType } from "../../../redux/gameBoard/gameBoard.types";
import DoubleClickHandler from "../CardMoveHandlers/DoubleClickHandlers/DoubleClickHandler.component";
import { DraggableCard } from "../Cards/Cards.items";
import GoalDoubleClickHandler from "../CardMoveHandlers/DoubleClickHandlers/GoalDoubleClickHandler";
import { RootReducerState } from "../../../global";
import { selectGoalPile } from "../../../redux/selectors/goal.selectors";
import { selectGameHints } from "../../../redux/selectors/gameBoard.selectors";
import SimplePile from "./SimplePile.component";

interface GoalPileProps {
  goalId: string;
  offset?: number;
}

/**
 * Component that consists of a pile (3d) of flipped cards that can be dragged
 */
function GoalPile({ goalId, offset }: GoalPileProps) {
  const dispatch = useDispatch();
  // get piles from redux
  const { goalPile, lastHint } = useSelector((state: RootReducerState) => {
    const hints = selectGameHints(state);
    const lastIndex = hints.length - 1;
    return {
      goalPile: selectGoalPile(state, goalId),
      lastHint: lastIndex >= 0 ? hints[lastIndex] : undefined
    };
  });

  // renders cards components that can be dragged
  const getCards = () => {
    const cardsArray = goalPile.map((card: CardType) => {
      const handler = new GoalDoubleClickHandler(dispatch, goalId, card);

      const shake =
        lastHint &&
        (card.cardField === lastHint.source ||
          card.cardField === lastHint.target);
      return (
        <DoubleClickHandler key={card.id} handler={handler} doubleClick>
          <DraggableCard card={card} nCards={1} shake={shake} />
        </DoubleClickHandler>
      );
    });
    return cardsArray;
  };

  // return a pile of flipped cards
  return (
    <SimplePile
      offset={offset}
      pileId={goalId}
      pileCards={getCards()}
      pileClassName="deckPile flippedPile"
      insideClassName="columnPile"
    />
  );
}

export default memo(GoalPile);
