import React, { PropsWithChildren, memo, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardType } from "../../../../redux/gameBoard/gameBoard.types";
import ColumnDrop from "./ColumnDropHandler";
import GoalDrop from "./GoalDropHandler";
import { RootReducerState } from "../../../../global";
// DnD handled globally by DndKitProvider
import { selectColumnsCardDragging, selectColumnsCardDraggingCol, selectColumnsMovementWithFlip } from "../../../../redux/selectors/columns.selectors";
import { selectDeckCardDragging } from "../../../../redux/selectors/deck.selectors";
import { selectGoalCardDragging } from "../../../../redux/selectors/goal.selectors";

interface DropHandlerProps {
  className?: string;
}

/**
 * Handles the main functionalities of a drop of a card
 */
const DropHandler = ({
  children,
  className = ""
}: PropsWithChildren<DropHandlerProps>) => {
  const dispatch = useDispatch();
  const ColumnInstance = new ColumnDrop(dispatch);
  const GoalInstance = new GoalDrop(dispatch);

  // get the move object
  const { move, sendBackColumn, sendBackGoal } = useSelector((state: RootReducerState) => {
    const source = selectColumnsCardDraggingCol(state) || (state.Goal as any).cardDraggingGoal || "deckPile";
    const cards =
      selectColumnsCardDragging(state) ||
      selectDeckCardDragging(state) ||
      selectGoalCardDragging(state) ||
      [];
    const movementWithFlip = Boolean(selectColumnsMovementWithFlip(state));

    return {
      move: {
        source,
        cards: cards as Array<CardType>,
        movementWithFlip,
        target: ""
      },
      sendBackColumn: (state.Columns as any).sendBack,
      sendBackGoal: (state.Goal as any).sendBack
    };
  });

  // stores the field the card was dropped to (set via DnDKitProvider event)
  const [fieldDropedTo, setFieldDropedTo] = useState<string | undefined>(undefined);
  // snapshot of the move at drop time (kept locally until reducers confirm success)
  const moveAtDropRef = useRef<{
    source: string;
    cards: Array<CardType>;
    movementWithFlip?: boolean;
  }>();

  // Listen for the global drop target broadcast and snapshot the move
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ targetId: string; source: string; cards: Array<CardType> }>;
      if (!ce.detail) return;
      setFieldDropedTo(ce.detail.targetId);
      moveAtDropRef.current = {
        source: ce.detail.source,
        cards: ce.detail.cards,
        movementWithFlip: move.movementWithFlip
      };
    };
    window.addEventListener("dnd-target", handler as EventListener);
    return () => window.removeEventListener("dnd-target", handler as EventListener);
  }, [move.movementWithFlip]);

  /**
   * If the movement was valid, completes the card move object and calls the parent's handleRemoveCard function,
   * to remove the card from the position it was previously on
   * Then adds the move to the game
   * It is called when the sendBack value changes
   */
  const handleSendBack = () => {
    // if the field is not undefined, then can add move (if one of the sendBack variables is false)
    if (fieldDropedTo) {
      // prefer the snapshot taken at drop time to avoid using mutated redux state
      const baseMove = moveAtDropRef.current || move;
      const finalMove = {
        ...baseMove,
        target: fieldDropedTo
      };
      // if the movement to the column pile was successful
      if (sendBackColumn === false) {
        ColumnInstance.handleRemoveCard(finalMove);
        // clear snapshot after handling to avoid reuse
        moveAtDropRef.current = undefined;
        setFieldDropedTo(undefined);
      } else if (sendBackGoal === false) {
        GoalInstance.handleRemoveCard(finalMove);
        // clear snapshot after handling to avoid reuse
        moveAtDropRef.current = undefined;
        setFieldDropedTo(undefined);
      }
    }
  };
  useEffect(handleSendBack, [sendBackColumn, sendBackGoal]);

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default memo(DropHandler);
