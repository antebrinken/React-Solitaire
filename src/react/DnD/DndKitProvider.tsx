import React, { PropsWithChildren, useMemo, useRef } from "react";
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerState } from "../../global";
import { CardType } from "../../redux/gameBoard/gameBoard.types";
import deckActions from "../../redux/deck/deck.actions";
import columnsActions from "../../redux/columns/columns.actions";
import goalActions from "../../redux/goal/goal.actions";
import ColumnDrop from "../Components/CardMoveHandlers/DropHandlers/ColumnDropHandler";
import GoalDrop from "../Components/CardMoveHandlers/DropHandlers/GoalDropHandler";
// import { SimplePile } from "../Components/Piles/Piles.items";
import { CardFrame, CardImage } from "../Components/Cards/Cards.items";

type DragData = { card: CardType; nCards: number };

function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function getFieldToDropAt(x: number, y: number): string | undefined {
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

  const center = (r: DOMRect) => ({ cx: r.left + r.width / 2, cy: r.top + r.height / 2 });

  const goals = goalIds
    .map(id => ({ id, el: document.getElementById(id) }))
    .filter(x => x.el) as Array<{ id: string; el: HTMLElement }>;
  const columns = columnIds
    .map(id => ({ id, el: document.getElementById(id) }))
    .filter(x => x.el) as Array<{ id: string; el: HTMLElement }>;

  if (goals.length === 0 && columns.length === 0) {
    const innerWidth = document.getElementById("baseEmptySpots")?.offsetWidth || 1;
    const initialOffset = ((innerWidth / 24) * 3) / 8;
    const columnSizes = (innerWidth - initialOffset) / 7;
    const columnNumber = Math.ceil((x - initialOffset || 1) / columnSizes);
    return `column${columnNumber || 1}Pile`;
  }

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

  const tol = 10;
  const hit = candidates.find(c => x >= c.rect.left - tol && x <= c.rect.right + tol && y >= c.rect.top - tol && y <= c.rect.bottom + tol);
  if (hit) return hit.id;

  const nearest = candidates.reduce(
    (acc, c) => {
      const dx = Math.abs(x - c.cx);
      const dy = Math.abs(y - c.cy);
      const d = dx + dy / 4;
      return d < acc.dist ? { id: c.id, dist: d } : acc;
    },
    { id: (preferGoals ? goals[0]?.id : columns[0]?.id) || "column1Pile", dist: Number.POSITIVE_INFINITY }
  );
  return nearest.id;
}

export default function DndKitProvider({ children }: PropsWithChildren<{}>) {
  const dispatch = useDispatch();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor)
  );

  const cardDragging = useSelector(({ Columns, Deck, Goal }: RootReducerState) => (Columns.cardDragging || Deck.cardDragging || Goal.cardDragging || []) as CardType[]);
  const cardDraggingRef = useLatestRef(cardDragging);

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as DragData | undefined;
    if (!data) return;
    const { card, nCards } = data;
    switch (card.cardField) {
      case "deckPile":
        dispatch(deckActions.dragFlippedCard());
        break;
      case "goal1Pile":
      case "goal2Pile":
      case "goal3Pile":
      case "goal4Pile":
        dispatch(goalActions.dragGoalCards(card.cardField));
        break;
      default:
        dispatch(columnsActions.dragColumnCards(card.cardField, nCards));
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const data = e.active.data.current as DragData | undefined;
    if (!data) return;
    const { card } = data;
    const rect = e.active.rect.current.translated || e.active.rect.current.initial;
    if (!rect) {
      // cancel drag
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
          dispatch(columnsActions.resetCardDragging());
      }
      return;
    }
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const targetId = getFieldToDropAt(x, y);
    if (!targetId) {
      // same reset as cancel
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
          dispatch(columnsActions.resetCardDragging());
      }
      return;
    }

    const move = {
      source: card.cardField,
      cards: cardDraggingRef.current,
      movementWithFlip: undefined,
      target: ""
    };

    const columnInstance = new ColumnDrop(dispatch);
    const goalInstance = new GoalDrop(dispatch);

    // Broadcast drop target and snapshot so DropHandler can finalize when reducers signal success
    window.dispatchEvent(
      new CustomEvent("dnd-target", {
        detail: {
          targetId,
          source: move.source,
          cards: move.cards
        }
      })
    );
    if (targetId.includes("column")) {
      columnInstance.onDrop(move as any, targetId);
    } else {
      goalInstance.onDrop(move as any, targetId);
    }
  };

  const overlay = useMemo(() => {
    const safe = (cardDragging || []).filter(Boolean);
    if (safe.length === 0) return null;
    const top = safe[safe.length - 1];
    return (
      <CardFrame>
        <CardImage directory="CardsFaces" image={top.image} />
      </CardFrame>
    );
  }, [cardDragging]);

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {children}
      <DragOverlay>{overlay}</DragOverlay>
    </DndContext>
  );
}
/**
 * DnD Kit Provider
 *
 * Wraps the app with DnD Kit's DndContext and centralizes drag/drop wiring.
 * - Draggables (useDraggable) pass `{ card, nCards }` via `data`.
 * - onDragStart dispatches the appropriate Redux "start dragging" action.
 * - onDragEnd computes the target pile (column/goal) and calls existing handlers.
 * - Broadcasts a CustomEvent ("dnd-target") so UI listeners can snapshot the move.
 * - Renders a DragOverlay that mirrors the dragged stack (faces shown).
 */
