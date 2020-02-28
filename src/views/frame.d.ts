import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

export interface IMouseMoveData {
  type: 'mouse-move'
  x: number,
  y: number
}

export interface IMouseEventData {
  type: 'mouse-event',
  x: number,
  y: number,
  event: string,
  element: string
}

export interface IEditorFrame {
  time?: number,
  index: number,
  mouseMove: IMouseMoveData,
  mouseEvents: Array<IMouseEventData>,
  viewState: monacoEditor.editor.ICodeEditorViewState,
  modelValue: string
}