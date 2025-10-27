/* eslint-disable indent */
import { ActionsCreators } from "./highscores.actions";
import { ExplicitAny } from "../../global";
import HighScoresActionTypes from "./highscores.types";

interface HighScore {
  userName: string;
  finalScore: number;
}

export interface InitialHighScores {
  highScore: {
    highScores: Array<HighScore>;
    hasNewHighScore: boolean;
  };
}

const INITIAL_HIGHSCORE: InitialHighScores = {
  highScore: {
    highScores: [],
    hasNewHighScore: false
  }
};

const userReducer = (state = INITIAL_HIGHSCORE, action: ActionsCreators) => {
  switch (action.type) {
    case HighScoresActionTypes.SET_OFFLINE_HIGHSCORES:
      const currentLocal = localStorage.getItem("offlineHighScores");
      const offlineHighScores = currentLocal
        ? JSON.parse(currentLocal)
        : undefined;
      if (!offlineHighScores) {
        localStorage.setItem(
          "offlineHighScores",
          JSON.stringify(INITIAL_HIGHSCORE)
        );
      }
      if (offlineHighScores) {
        return {
          highScore: {
            ...offlineHighScores
          }
        };
      }
      return {
        ...INITIAL_HIGHSCORE
      };

    case HighScoresActionTypes.HAS_NEW_HIGHSCORE:
      let finalHasNewHighScore = false;
      if (state.highScore?.highScores?.length < 10) {
        finalHasNewHighScore = true;
      } else {
        const result = state.highScore?.highScores?.find(
          (highScore: HighScore) => {
            return action.finalScore < highScore.finalScore;
          }
        );
        if (result) {
          finalHasNewHighScore = true;
        }
      }

      return {
        ...state,
        highScore: {
          ...state.highScore,
          hasNewHighScore: finalHasNewHighScore
        }
      };

    case HighScoresActionTypes.ADD_HIGHSCORE:
      let finalHighScores: ExplicitAny = [];
      if (state.highScore?.highScores.length < 10) {
        finalHighScores = [
          ...state.highScore?.highScores,
          {
            userName: action.userName,
            finalScore: action.finalScore
          }
        ];
      } else {
        const result = state.highScore?.highScores.find(
          (highScore: HighScore) => {
            return action.finalScore < highScore.finalScore;
          }
        );
        if (result) {
          finalHighScores = [
            ...state.highScore?.highScores,
            {
              userName: action.userName,
              finalScore: action.finalScore
            }
          ];
        }
      }

      finalHighScores.sort((a: HighScore, b: HighScore) => {
        return a.finalScore < b.finalScore ? -1 : 1;
      });

      localStorage.setItem(
        "offlineHighScores",
        JSON.stringify({ ...state.highScore, highScores: finalHighScores })
      );

      return {
        ...state,
        highScore: { highScores: finalHighScores, hasNewHighScore: false }
      };

    // ********************************************************

    default:
      return state;
  }
};

export default userReducer;
// @ts-nocheck
