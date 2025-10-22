import { RootReducerState } from "../../global";
import { CardType } from "../gameBoard/gameBoard.types";

export const selectDeckPile = (state: RootReducerState): CardType[] => state.Deck.deckPile;
export const selectFlippedPile = (state: RootReducerState): CardType[] => state.Deck.flippedPile;
export const selectDeckTranslationX = (state: RootReducerState): number => state.Deck.translationX;
export const selectDeckTranslationY = (state: RootReducerState): number => state.Deck.translationY;
export const selectDeckStartUndoAnimation = (state: RootReducerState): boolean => state.Deck.startUndoAnimation;
export const selectDeckStartRedoAnimation = (state: RootReducerState): boolean => state.Deck.startRedoAnimation;
export const selectDeckStartRedoResetAnimation = (state: RootReducerState): boolean => state.Deck.startRedoResetAnimation;
export const selectDeckCardDragging = (state: RootReducerState) => state.Deck.cardDragging;
