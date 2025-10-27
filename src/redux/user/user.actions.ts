import { ExplicitAny, ValueOf } from "../../global";
import UserActionTypes from "./user.types";

// ********************************************************

const getLocalStorage = () => ({
  type: UserActionTypes.GET_LOCAL_STORAGE
});

const changeUserSettings = (changes: ExplicitAny) => ({
  type: UserActionTypes.CHANGE_USER_SETTINGS,
  changes
});

const addGame = () => ({
  type: UserActionTypes.ADD_GAME
});

const gameOver = (gameStatistics: ExplicitAny, seconds: number) => ({
  type: UserActionTypes.GAME_OVER,
  gameStatistics,
  seconds
});

const saveGame = (savedGame: ExplicitAny) => ({
  type: UserActionTypes.SAVE_GAME,
  savedGame
});

const clearSavedGame = () => ({
  type: UserActionTypes.CLEAR_SAVED_GAME
});


const clearUser = () => ({
  type: UserActionTypes.CLEAR_USER
});

// ********************************************************

const actionsCreators = Object.freeze({
  getLocalStorage,
  changeUserSettings,
  addGame,
  gameOver,
  saveGame,
  clearSavedGame,
  clearUser
});

export type ActionsCreators = ReturnType<ValueOf<typeof actionsCreators>>;
export default actionsCreators;
