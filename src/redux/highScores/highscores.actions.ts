import { ExplicitAny, ValueOf } from "../../global";
import HighScoresActionTypes from "./highscores.types";

// ********************************************************

const setOfflineHighScores = () => ({
  type: HighScoresActionTypes.SET_OFFLINE_HIGHSCORES
});

const hasNewHighScore = (finalScore: number) => ({
  type: HighScoresActionTypes.HAS_NEW_HIGHSCORE,
  finalScore
});

const addHighScore = (userName: string, finalScore: number) => ({
  type: HighScoresActionTypes.ADD_HIGHSCORE,
  userName,
  finalScore
});

// ********************************************************

const actionsCreators = Object.freeze({
  setOfflineHighScores,
  hasNewHighScore,
  addHighScore
});

export type ActionsCreators = ReturnType<ValueOf<typeof actionsCreators>>;
export default actionsCreators;
