import React, { PropsWithChildren, memo, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardType } from "../../../../redux/gameBoard/gameBoard.types";
import ColumnDrop from "./ColumnDropHandler";
import GoalDrop from "./GoalDropHandler";
import { RootReducerState } from "../../../../global";
import { useDrop } from "react-dnd";

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
  const { move, sendBackColumn, sendBackGoal } = useSelector(
    ({ Columns, Deck, Goal }: RootReducerState) => {
      const source =
        Columns.cardDraggingCol || Goal.cardDraggingGoal || "deckPile";
      const cards =
        Columns.cardDragging || Deck.cardDragging || Goal.cardDragging || [];
      const movementWithFlip = Boolean(Columns.movementWithFlip);

      return {
        move: {
          source,
          cards: cards as Array<CardType>,
          movementWithFlip,
          target: ""
        },
        sendBackColumn: Columns.sendBack,
        sendBackGoal: Goal.sendBack
      };
    }
  );

  // stores the field the card was dropped to
  const [fieldDropedTo, setFieldDropedTo] = useState<string | undefined>(
    undefined
  );

  // snapshot of the move at drop time (before any resets mutate redux state)
  const moveAtDropRef = useRef<
    | {
        source: string;
        cards: Array<CardType>;
        movementWithFlip?: boolean;
      }
    | undefined
  >(undefined);

  /**
   * Gets the field the card was dropped on
   * @param position {x, y} of the card when it was dropped
   */
  const getFieldToDrop = ({ x, y }: { x: number; y: number }) => {
    // Helper: get rect center
    const center = (r: DOMRect) => ({ cx: r.left + r.width / 2, cy: r.top + r.height / 2 });
    // Collect goal and column DOM rects
    const goalIds = ["goal1Pile", "goal2Pile", "goal3Pile", "goal4Pile"];
    const columnIds = [
      "column1Pile",
      "column2Pile",
      "column3Pile",
      "column4Pile",
      "column5Pile",
      "column6Pile",
      "column7Pile"
    ];

    const goals = goalIds
      .map(id => ({ id, el: document.getElementById(id) }))
      .filter(x => x.el) as Array<{ id: string; el: HTMLElement }>;
    const columns = columnIds
      .map(id => ({ id, el: document.getElementById(id) }))
      .filter(x => x.el) as Array<{ id: string; el: HTMLElement }>;

    // If DOM not ready, fallback to previous heuristic targeting columns
    if (goals.length === 0 && columns.length === 0) {
      const innerWidth = document.getElementById("baseEmptySpots")?.offsetWidth || 1;
      const initialOffset = ((innerWidth / 24) * 3) / 8;
      const columnSizes = (innerWidth - initialOffset) / 7;
      const columnNumber = Math.ceil((x - initialOffset || 1) / columnSizes);
      return `column${columnNumber || 1}Pile`;
    }

    // Determine which row (goals vs columns) is closer vertically to the drop point
    const anyGoalRect = goals[0]?.el.getBoundingClientRect();
    const anyColRect = columns[0]?.el.getBoundingClientRect();
    const goalCy = anyGoalRect ? center(anyGoalRect).cy : Number.NEGATIVE_INFINITY;
    const colCy = anyColRect ? center(anyColRect).cy : Number.POSITIVE_INFINITY;
    const preferGoals = Math.abs(y - goalCy) < Math.abs(y - colCy);

    const candidates = (preferGoals ? goals : columns).map(({ id, el }) => {
      const rect = el.getBoundingClientRect();
      const { cx, cy } = center(rect);
      return { id, rect, cx, cy };
    });

    // First try: containment with a small tolerance
    const tol = 10;
    const hit = candidates.find(c =>
      x >= c.rect.left - tol &&
      x <= c.rect.right + tol &&
      y >= c.rect.top - tol &&
      y <= c.rect.bottom + tol
    );
    if (hit) return hit.id;

    // Fallback: nearest by horizontal distance in the preferred row
    const nearest = candidates.reduce(
      (acc, c) => {
        const dx = Math.abs(x - c.cx);
        const dy = Math.abs(y - c.cy);
        const d = dx + dy / 4; // weight horizontal more heavily
        return d < acc.dist ? { id: c.id, dist: d } : acc;
      },
      { id: (preferGoals ? goals[0]?.id : columns[0]?.id) || "column1Pile", dist: Number.POSITIVE_INFINITY }
    );
    return nearest.id;
  };

  /**
   * Gets the field the card was dropped to and calls the parent's onDrop function with it and the move done
   * @param position {x, y} of the card when it was dropped
   */
  const handleOnDrop = (position: { x: number; y: number } | null) => {
    // get the id of the field the card is going to
    const fieldDropedToTemp = getFieldToDrop(position || { x: 0, y: 0 });
    // if it was a valid field (not an empty space in the game board)
    if (fieldDropedToTemp) {
      // save the field it was dropped to
      setFieldDropedTo(fieldDropedToTemp);
      // snapshot the current move before dispatching actions that reset dragging state
      moveAtDropRef.current = {
        source: move.source,
        cards: move.cards,
        movementWithFlip: move.movementWithFlip
      };
      // call the parent's onDrop function
      if (fieldDropedToTemp.includes("column")) {
        ColumnInstance.onDrop(move, fieldDropedToTemp);
      } else {
        GoalInstance.onDrop(move, fieldDropedToTemp);
      }
    }
  };

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

  // create drop reference and associate functions
  const [, drop] = useDrop({
    accept: "cardframe",
    drop: (card, monitor) => handleOnDrop(monitor.getClientOffset())
  });

  return (
    <div ref={drop} className={className}>
      {children}
    </div>
  );
};

export default memo(DropHandler);
