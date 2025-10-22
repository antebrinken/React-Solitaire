// Pages Actions
const PagesActionTypes = {
  SET_START_PAGE_ANIMATION: "PAGES/SET_START_PAGE_ANIMATION",
  SET_CONFIRMATION_MODAL: "PAGES/SET_CONFIRMATION_MODAL"
} as const;

export default PagesActionTypes;
export type PagesActionType = typeof PagesActionTypes[keyof typeof PagesActionTypes];
