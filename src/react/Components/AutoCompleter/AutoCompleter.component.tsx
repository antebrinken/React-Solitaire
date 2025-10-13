import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerState } from "../../../global";
import deckActions from "../../../redux/deck/deck.actions";
import columnsActions from "../../../redux/columns/columns.actions";
import goalActions from "../../../redux/goal/goal.actions";
import gameBoardActions from "../../../redux/gameBoard/gameBoard.actions";
import { CardType } from "../../../redux/gameBoard/gameBoard.types";
import { getValidTarget } from "../../../redux/goal/goal.utils";

// Small helper to pause between moves for UI smoothness
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function AutoCompleter() {
  const dispatch = useDispatch();

  const { columns, goals, deckPile, flippedPile, gameOver, anyDragging } = useSelector(
    ({ Columns, Goal, Deck }: RootReducerState) => ({
      columns: Columns.columns,
      goals: Goal.goals,
      deckPile: Deck.deckPile,
      flippedPile: Deck.flippedPile,
      gameOver: Goal.gameOver,
      anyDragging:
        Boolean(Columns.cardDragging) ||
        Boolean(Goal.cardDragging) ||
        Boolean(Deck.cardDragging) ||
        // also pause while any double-click flow is active
        Boolean(Columns.doubleClickTarget) ||
        Boolean(Goal.doubleClickTarget)
    })
  );

  // Ensure strong typing for maps
  const columnsMap = (columns || {}) as Record<string, CardType[]>;
  const goalsMap = (goals || {}) as Record<string, CardType[]>;

  // interval control + latest-state refs to avoid stale closures
  const intervalIdRef = useRef<number | null>(null);
  const columnsRef = useRef(columnsMap);
  const goalsRef = useRef(goalsMap);
  const deckRef = useRef(deckPile);
  const flippedRef = useRef(flippedPile);
  const gameOverRef = useRef(gameOver);
  const draggingRef = useRef(anyDragging);

  useEffect(() => {
    columnsRef.current = columnsMap;
    goalsRef.current = goalsMap;
    deckRef.current = deckPile;
    flippedRef.current = flippedPile;
    gameOverRef.current = gameOver;
    draggingRef.current = anyDragging;
  }, [columnsMap, goalsMap, deckPile, flippedPile, gameOver, anyDragging]);

  // Check if all cards in columns are flipped
  const allColumnsFlipped = (() => {
    const columnIds: string[] = Object.keys(columnsMap || {});
    if (columnIds.length === 0) return false;
    return columnIds.every((colId: string) =>
      (columnsMap[colId] || []).every((c: CardType) => Boolean(c.flipped))
    );
  })();

  // Try to perform a single auto move; returns true if a move was performed
  const tryAutoMove = async (): Promise<boolean> => {
    // 1) Try flipped pile top to goal
    const flipped = flippedRef.current;
    const flippedTop = flipped[flipped.length - 1];
    if (flippedTop) {
      const targetId = getValidTarget(goalsRef.current, flippedTop);
      if (targetId) {
        // remove from flipped and add to goal
        dispatch(deckActions.removeCardFromFlipped());
        dispatch(goalActions.addCardToGoal(targetId, flippedTop));
        dispatch(
          gameBoardActions.addGameMove({
            source: "deckPile",
            target: targetId,
            cards: [flippedTop],
            movementWithFlip: false
          })
        );
        return true;
      }
    }

    // 2) Try any column top to goal
    const cols = columnsRef.current;
    const colIds: string[] = Object.keys(cols || {});
    for (const colId of colIds) {
      const col = cols[colId] || [];
      const top: CardType | undefined = col[col.length - 1];
      if (!top || !top.flipped) continue;
      const targetId = getValidTarget(goalsRef.current, top);
      if (targetId) {
        // remove one from column and add to goal
        dispatch(columnsActions.removeNCardsFromColumn(colId, 1, false));
        dispatch(goalActions.addCardToGoal(targetId, top));
        dispatch(
          gameBoardActions.addGameMove({
            source: colId,
            target: targetId,
            cards: [top],
            movementWithFlip: false
          })
        );
        return true;
      }
    }

    // 3) If no immediate move, but deck has cards, flip one to flipped pile
    if (deckRef.current.length > 0) {
      dispatch(deckActions.flipDeckPile());
      return true;
    }

    // 4) If deck empty but flipped still has cards and no move available, reset deck to continue cycling
    if (deckRef.current.length === 0 && flippedRef.current.length > 0) {
      dispatch(deckActions.startUndoAnimation());
      setTimeout(() => dispatch(deckActions.resetDeck()), 600);
      dispatch(
        gameBoardActions.addGameMove({
          source: "flippedPile",
          target: "deckPile",
          cards: []
        })
      );
      // wait for animation duration before next attempt
      await delay(650);
      return true;
    }

    // No moves possible
    return false;
  };

  useEffect(() => {
    const shouldRun = allColumnsFlipped && !gameOver && !anyDragging;
    // Clear any previous interval when conditions change
    if (intervalIdRef.current) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (!shouldRun) return;

    // Fast-paced, one move per tick. Increase delay if needed for smoother animations.
    const TICK_MS = 120;
    intervalIdRef.current = window.setInterval(() => {
      // pause if state no longer valid
      if (!allColumnsFlipped || gameOverRef.current || draggingRef.current) {
        if (intervalIdRef.current) {
          window.clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        return;
      }
      // fire-and-forget; internal awaits only for reset animation
      void tryAutoMove();
    }, TICK_MS);

    return () => {
      if (intervalIdRef.current) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allColumnsFlipped, gameOver, anyDragging]);

  return null;
}

export default AutoCompleter;
