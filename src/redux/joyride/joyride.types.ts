// Joyride Tour Actions
const JoyrideActionTypes = {
  INIT_JORYIDE: "JOYRIDE/INIT_JOYRIDE"
} as const;

export default JoyrideActionTypes;
export type JoyrideActionType = typeof JoyrideActionTypes[keyof typeof JoyrideActionTypes];
