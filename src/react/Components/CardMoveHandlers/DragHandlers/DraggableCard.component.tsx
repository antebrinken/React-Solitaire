/* eslint-disable react/forbid-component-props */
/* eslint-disable indent */
import { ExplicitAny, RootReducerState } from "../../../../global";
import React, { PropsWithChildren, memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CardFrame from "../../Cards/CardFrame.component";
import CardImage from "../../Cards/CardImage.component";
import { CardType } from "../../../../redux/gameBoard/gameBoard.types";
import columnsActions from "../../../../redux/columns/columns.actions";
import deckActions from "../../../../redux/deck/deck.actions";
import { getEmptyImage } from "react-dnd-html5-backend";
import goalActions from "../../../../redux/goal/goal.actions";
import { useDrag } from "react-dnd";
const type = "cardframe";

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

  // useDrag will be responsible for making an element draggable. It also expose, isDragging method to add any styles while dragging
  const [{ isDragging }, drag, preview] = useDrag({
    item: { type, card }, // item denotes the element type, unique identifier (id) and card info
    begin: () => onDrag(card), // call the onDrag function when dragging begins
    end: (_item: ExplicitAny, monitor: ExplicitAny) => {
      // If drag was cancelled (no valid drop), clear any lingering dragging state
      if (!monitor.didDrop()) {
        switch (card.cardField) {
          case "deckPile":
            dispatch(deckActions.resetCardDragging());
            break;
          case "goal1Pile":
          case "goal2Pile":
          case "goal3Pile":
          case "goal4Pile":
            dispatch(goalActions.resetCardDragging());
            break;
          default:
            // columns
            dispatch(columnsActions.resetCardDragging());
        }
      }
    },
    collect: (monitor: ExplicitAny) => ({
      isDragging: monitor.isDragging()
    })
  });

  // function called when a card starts being dragged
  const onDrag = (card: CardType) => {
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
  };

  // adds preview to the drag event
  const getPreviewImage = () => {
    preview(getEmptyImage(), { captureDraggingState: true });
  };

  // on component did mount, call the getPreviewImage function
  useEffect(getPreviewImage, []);

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

  // return the card component with the ref of the drag event
  return (
    <CardFrame
      ref={drag}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onTouchEnd={onTouchEnd}
      cardContainerClassName={`${index > 0 ? "cardContainerColumns" : ""}`}
      shake={shake}
    >
      {children || (
        <CardImage
          additionalClassName={hideCard ? "cardIsDragging" : ""}
          directory="CardsFaces"
          image={card.image}
        />
      )}
    </CardFrame>
  );
}

export default memo(DraggableCard);
