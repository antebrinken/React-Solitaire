// HighScores Actions
const HighScoresActionTypes = {
  SET_OFFLINE_HIGHSCORES: "HIGHSCORES/SET_OFFLINE_HIGHSCORES",
  HAS_NEW_HIGHSCORE: "HIGHSCORES/HAS_NEW_HIGHSCORE",
  ADD_HIGHSCORE: "HIGHSCORES/ADD_HIGHSCORE"
} as const;

export default HighScoresActionTypes;
export type HighScoresActionType = typeof HighScoresActionTypes[keyof typeof HighScoresActionTypes];
