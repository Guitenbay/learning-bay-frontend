// 弃用
import { combineReducers, createStore } from 'redux'

export const SET_THEME = 'set-theme';

export type ITheme = boolean;
export interface IStoreState {
  darkTheme: ITheme;
}
export interface IThemeAction { type: typeof SET_THEME, value: ITheme }

function themeReducer(preState = false, action: IThemeAction): ITheme {
  switch(action.type) {
    case SET_THEME: return !preState;
    default: return preState;
  }
}

const totalReducer = combineReducers({
  darkTheme: themeReducer
})

export const store = createStore(totalReducer);