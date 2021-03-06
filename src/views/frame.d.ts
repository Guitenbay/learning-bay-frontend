import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

export interface IMouseMoveData {
  type: 'mouse-move',
  containerId?: string,
  x: number,
  y: number
}

export interface IMouseEventData {
  type: 'mouse-event',
  event: string,
  element: string
}

export interface IEditorFrame {
  time?: number,
  index: number,
  mouseMove: IMouseMoveData,
  mouseEvents: Array<IMouseEventData>,
  viewState?: monacoEditor.editor.ICodeEditorViewState,
  modelValue?: string
}