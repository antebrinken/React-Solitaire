/* eslint-disable react/forbid-component-props */
/* eslint-disable indent */
/**
 * DraggableCard (DnD Kit)
 *
 * Makes a card (or stack) draggable using DnD Kit's `useDraggable`.
 * - Sends `{ card, nCards }` in the draggable `data` payload.
 * - While dragging, renders the card face explicitly so it never shows the back.
 * - Dispatches Redux "start dragging" based on the card origin (deck/column/goal).
 * - The visual drag preview is handled by the global DragOverlay (see DndKitProvider).
 */
import { RootReducerState } from "../../../../global";
import React, { PropsWithChildren, memo, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import CardFrame from "../../Cards/CardFrame.component";
import CardImage from "../../Cards/CardImage.component";
import { CardType } from "../../../../redux/gameBoard/gameBoard.types";
import columnsActions from "../../../../redux/columns/columns.actions";
import deckActions from "../../../../redux/deck/deck.actions";
import goalActions from "../../../../redux/goal/goal.actions";
import { useDraggable } from "@dnd-kit/core";

interface DraggableCardProps {
  card: CardType; // card info
  nCards: number; // number of cards being dragged (this card and all bellow)
  onDoubleClick?: () => void; // function called when card is double clicked
  onClick?: () => void; // optional tap/single-click handler
  onTouchEnd?: () => void; // optional touch-end handler
  index?: number;
  shake?: boolean;
}

/**
 * Component that adds the drag functionality to a card and the cards bellow it
 */
function DraggableCard({
  card,
  nCards,
  onDoubleClick,
  onClick,
  onTouchEnd,
  index = 0,
  shake,
  children
}: PropsWithChildren<DraggableCardProps>) {
  const dispatch = useDispatch();
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  // Track small screens to avoid hiding entire stacks during accidental taps/drag
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(max-width: 575px)");
    const update = () => setIsSmallScreen(mql.matches);
    update();
    if (mql.addEventListener) {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    } else {
      // @ts-ignore legacy Safari
      mql.addListener(update);
      return () => {
        // @ts-ignore
        mql.removeListener(update);
      };
    }
  }, []);

  // get the cards that are dragging from the redux (can be from the deck or form the columns)
  const { cardDragging } = useSelector(
    ({ Columns, Deck, Goal }: RootReducerState) => ({
      cardDragging:
        Columns.cardDragging || Deck.cardDragging || Goal.cardDragging || []
    })
  );

  // DnD Kit draggable
  const { isDragging, attributes, listeners, setNodeRef } = useDraggable({
    id: `card-${card.id}`,
    data: { card, nCards }
  });

  // function called when a card starts being dragged
  const onDrag = useCallback((card: CardType) => {
    switch (card.cardField) {
      case "deckPile":
        dispatch(deckActions.dragFlippedCard());
        break;
      case "goal1Pile":
      case "goal2Pile":
      case "goal3Pile":
      case "goal4Pile":
        // if it is a card from the columns, then call the column action that saves what is being dragged
        dispatch(goalActions.dragGoalCards(card.cardField));
        break;
      default:
        // if it is a card from the columns, then call the column action that saves what is being dragged
        dispatch(columnsActions.dragColumnCards(card.cardField, nCards));
    }
  }, [dispatch, nCards]);

  // on drag start, dispatch dragging state so overlay can mirror cards
  useEffect(() => {
    if (isDragging) onDrag(card);
  }, [isDragging, onDrag, card]);

  // Hide the source card while dragging, regardless of origin pile
  // Use id-based check to avoid reference mismatches causing duplicates
  const isInDragging = (cardDragging || []).some((c: CardType) => c && c.id === card.id);
  // Do not hide the source card when dragging from the flipped (trash) pile.
  // Hiding it interferes with double-click recognition and can appear as a disappearance on click-hold.
  // On small screens, only hide the DOM element actually being dragged to avoid stacks "disappearing"
  const hideCard = card.cardField === "deckPile"
    ? false
    : isSmallScreen
      ? isDragging
      : (isDragging || isInDragging);

  const containerClassName = `${index > 0 ? "cardContainerColumns" : ""} ${
    isDragging ? "draggingHide" : ""
  }`;

  // return the card component with the ref of the drag event
  return (
    <CardFrame
      ref={setNodeRef}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onTouchEnd={onTouchEnd}
      cardContainerClassName={containerClassName}
      shake={shake}
      {...listeners}
      {...attributes}
    >
      {isDragging ? (
        // Force showing the card FACE while dragging, even for flipped pile cards
        <CardImage
          additionalClassName={""}
          directory="CardsFaces"
          image={card.image}
        />
      ) : (
        children || (
          <CardImage
            additionalClassName={hideCard ? "cardIsDragging" : ""}
            directory="CardsFaces"
            image={card.image}
          />
        )
      )}
    </CardFrame>
  );
}

export default memo(DraggableCard);
