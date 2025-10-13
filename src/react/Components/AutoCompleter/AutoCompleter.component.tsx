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

  const { columns, goals, deckPile, flippedPile, gameOver } = useSelector(
    ({ Columns, Goal, Deck }: RootReducerState) => ({
      columns: Columns.columns,
      goals: Goal.goals,
      deckPile: Deck.deckPile,
      flippedPile: Deck.flippedPile,
      gameOver: Goal.gameOver
    })
  );

  // Ensure strong typing for maps
  const columnsMap = (columns || {}) as Record<string, CardType[]>;
  const goalsMap = (goals || {}) as Record<string, CardType[]>;

  // Track if an auto-complete loop is running
  const runningRef = useRef(false);

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
    const flippedTop = flippedPile[flippedPile.length - 1];
    if (flippedTop) {
      const targetId = getValidTarget(goalsMap, flippedTop);
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
    const colIds: string[] = Object.keys(columnsMap || {});
    for (const colId of colIds) {
      const col = columnsMap[colId] || [];
      const top: CardType | undefined = col[col.length - 1];
      if (!top || !top.flipped) continue;
      const targetId = getValidTarget(goalsMap, top);
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
    if (deckPile.length > 0) {
      dispatch(deckActions.flipDeckPile());
      return true;
    }

    // 4) If deck empty but flipped still has cards and no move available, reset deck to continue cycling
    if (deckPile.length === 0 && flippedPile.length > 0) {
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

  const runAutoComplete = async () => {
    if (runningRef.current || gameOver) return;
    runningRef.current = true;
    try {
      // Keep performing moves until none are possible or game is over
      // Small delay between moves for UI
      // eslint-disable-next-line no-constant-condition
      while (!gameOver) {
        const moved = await tryAutoMove();
        if (!moved) break;
        await delay(150);
      }
    } finally {
      runningRef.current = false;
    }
  };

  useEffect(() => {
    if (allColumnsFlipped && !gameOver) {
      runAutoComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allColumnsFlipped, gameOver, columns, goals, deckPile, flippedPile]);

  return null;
}

export default AutoCompleter;
