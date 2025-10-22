// HighScores Actions
const HighScoresActionTypes = {
  SET_ONLINE_HIGHSCORES: "HIGHSCORES/SET_ONLINE_HIGHSCORES",
  SET_OFFLINE_HIGHSCORES: "HIGHSCORES/SET_OFFLINE_HIGHSCORES",
  HAS_NEW_HIGHSCORE: "HIGHSCORES/HAS_NEW_HIGHSCORE",
  ADD_HIGHSCORE: "HIGHSCORES/ADD_HIGHSCORE",
  RESET_HIGHSCORES_REF: "HIGHSCORES/RESET_HIGHSCORES_REF"
} as const;

export default HighScoresActionTypes;
export type HighScoresActionType = typeof HighScoresActionTypes[keyof typeof HighScoresActionTypes];
