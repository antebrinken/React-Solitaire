import { ExplicitAny, RootReducerState } from "../../../../global";
import React, {
  Children,
  PropsWithChildren,
  cloneElement,
  memo,
  useEffect,
  useState
} from "react";
import { useSelector } from "react-redux";
import { selectColumns, selectColumnsDoubleClickTarget, selectColumnsMovementWithFlip, selectColumnsMovingCards } from "../../../../redux/selectors/columns.selectors";
import { selectGoalDoubleClickTarget, selectGoalHintSource } from "../../../../redux/selectors/goal.selectors";
// deck dragging factored into derived selector
import { selectDeckAnimActive, selectDraggingActive } from "../../../../redux/selectors/derived.selectors";

interface DoubleClickHandlerProps {
  handler: ExplicitAny;
  doubleClick: boolean;
}

/**
 * Component that handles the flow of a double click
 */
function DoubleClickHandler({
  handler,
  doubleClick,
  children
}: PropsWithChildren<DoubleClickHandlerProps>) {
  const [handlingMove, setHandlingMove] = useState<boolean>();
  const [recentTouch, setRecentTouch] = useState<boolean>(false);

  const {
    goalMoveTarget,
    columnMoveTarget,
    columnMoveCards,
    movementWithFlip,
    hintSource,
    columns,
    draggingActive,
    deckAnimActive
  } = useSelector((state: RootReducerState) => ({
    goalMoveTarget: selectGoalDoubleClickTarget(state),
    columnMoveTarget: selectColumnsDoubleClickTarget(state),
    columnMoveCards: selectColumnsMovingCards(state),
    columns: selectColumns(state),
    movementWithFlip: selectColumnsMovementWithFlip(state),
    hintSource: (selectGoalHintSource(state) as any) || undefined,
    draggingActive: selectDraggingActive(state),
    deckAnimActive: selectDeckAnimActive(state)
  }));

  // call the first handler of the double click when the handling move changes to true
  const handleDoubleClick = () => {
    // Prevent re-entrancy: ignore while a previous double-click is processing
    if (handlingMove) return;
    setHandlingMove(true);
    handler.handleDoubleClick();
  };

  // if the columnTarget changed, call the function which deals with it
  const handleColumnDoubleClickResult = () => {
    if (handlingMove) {
      const result = handler.handleColumnDoubleClickResult(
        columnMoveTarget,
        columnMoveCards,
        movementWithFlip,
        doubleClick ? undefined : hintSource
      );
      if (result) {
        setHandlingMove(false);
      }
    }
  };
  useEffect(handleColumnDoubleClickResult, [columnMoveTarget]);

  // if the goalMoveTarget changed, call the function which deals with it
  const handleGoalDoubleClickResult = () => {
    if (handlingMove) {
      const copy = { ...columns };
      const result = handler.handleGoalDoubleClickResult(
        goalMoveTarget,
        doubleClick ? movementWithFlip : hintSource,
        copy
      );
      if (result) {
        setHandlingMove(false);
      }
    }
  };
  useEffect(handleGoalDoubleClickResult, [goalMoveTarget]);

  return (
    <>
      {Children.map(children, (child: ExplicitAny) => {
        // Always use single click/tap; guard against drag/animation and duplicate touch+click
        const onTapClick = () => {
          if (recentTouch) return; // ignore synthetic click after touch
          if (draggingActive || deckAnimActive) return; // ignore while dragging/animating
          handleDoubleClick();
        };
        const onTapTouchEnd = () => {
          setRecentTouch(true);
          if (!draggingActive && !deckAnimActive) handleDoubleClick();
          setTimeout(() => setRecentTouch(false), 300);
        };

        return cloneElement(child, {
          onClick: onTapClick,
          onTouchEnd: onTapTouchEnd,
          onDoubleClick: undefined
        });
      })}
    </>
  );
}

export default memo(DoubleClickHandler);
