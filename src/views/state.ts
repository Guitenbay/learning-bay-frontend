import { combineReducers, createStore } from 'redux'

export const SET_THEME = 'set-theme';
export const SET_USER = 'set-user';

export type ITheme = boolean;
export type IUsername = string;
export interface IThemeAction { type: typeof SET_THEME }
export interface IUserAction { 
  type: typeof SET_USER,
  value: IUsername
}

function themeReducer(preState = false, action: IThemeAction): ITheme {
  switch(action.type) {
    case SET_THEME: return !preState;
    default: return preState;
  }
}

function userReducer(preState = "", action: IUserAction): IUsername {
  switch(action.type) {
    case SET_USER: return action.value;
    default: return preState;
  }
}

// getState() type
export interface IStoreState {
  darkTheme: ITheme,
  username: IUsername
}
const totalReducer = combineReducers({
  darkTheme: themeReducer,
  username: userReducer
})

export const store = createStore(totalReducer);