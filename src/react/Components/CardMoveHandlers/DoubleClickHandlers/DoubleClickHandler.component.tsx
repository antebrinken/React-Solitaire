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
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [recentTouch, setRecentTouch] = useState<boolean>(false);

  // Detect small screens (and desktop responsive mode) to map double-click to tap/single-click
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(max-width: 575px)");
    const update = () => setIsSmallScreen(mql.matches);
    update();
    if (mql.addEventListener) {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    } else {
      // Safari/older
      // @ts-ignore
      mql.addListener(update);
      return () => {
        // @ts-ignore
        mql.removeListener(update);
      };
    }
  }, []);

  const {
    goalMoveTarget,
    columnMoveTarget,
    columnMoveCards,
    movementWithFlip,
    hintSource,
    columns,
    deckDragging,
    goalDragging,
    columnDragging,
    deckUndoAnim,
    deckRedoAnim,
    deckRedoResetAnim
  } = useSelector(({ Goal, Columns, Deck }: RootReducerState) => ({
    goalMoveTarget: Goal.doubleClickTarget,
    columnMoveTarget: Columns.doubleClickTarget,
    columnMoveCards: Columns.movingCards,
    columns: Columns.columns,
    movementWithFlip: Columns.movementWithFlip,
    hintSource: Goal.hintSource || Columns.hintSource,
    deckDragging: Deck.cardDragging,
    goalDragging: Goal.cardDragging,
    columnDragging: Columns.cardDragging,
    deckUndoAnim: Deck.startUndoAnimation,
    deckRedoAnim: Deck.startRedoAnimation,
    deckRedoResetAnim: Deck.startRedoResetAnimation
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
        const draggingActive = Boolean(
          (deckDragging && deckDragging.length) ||
          (goalDragging && goalDragging.length) ||
          (columnDragging && columnDragging.length)
        );
        const deckAnimActive = Boolean(deckUndoAnim || deckRedoAnim || deckRedoResetAnim);

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
