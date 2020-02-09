import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

export interface IFrame {
  index: number,
  viewState: monacoEditor.editor.ICodeEditorViewState,
  modelValue: string
}