import React, { createRef, RefObject, Fragment } from 'react';
import './Record.css';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import Sidebar from '../../components/Sidebar';
import { Directory, Depandency } from '../../components/sidebar.d';
// import data from '../vdata/data2';

interface IState {
  // code: string,
  // position: { x: number, y: number }
}

const dirs: Array<Directory> = [{
  name: 'src',
  files: [
    { name: 'index.html', icon: 'html' },
    { name: 'index.js', icon: 'js' },
  ]
}]

const depandencies: Array<Depandency> = [
  { name: 'react' },
  { name: 'react-dom' },
]

class Record extends React.Component<{}, IState> {
  private editorRef: RefObject<MonacoEditor> = createRef<MonacoEditor>();
  constructor(props: {}) {
    super(props);
    // this.state = {
    //   code: '// type your code...',
    //   position: { x: 0, y: 0 }
    // }
  }
  // editorWillMount(monaco: typeof monacoEditor) {
  //   monaco.
  // }
  editorDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) {
    console.log('editorDidMount', editor);
    editor.focus();
  }
  onChange(newValue: string, e: monacoEditor.editor.IModelContentChangedEvent) {
    console.log('onChange', newValue, e);
  }
  render() {
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <Fragment>
        <Sidebar title="Project" dirs={dirs} depandencies={depandencies} />
        <MonacoEditor
          ref={this.editorRef}
          width="800"
          height="600"
          language="javascript"
          theme="vs-dark"
          options={options}
          onChange={this.onChange.bind(this)}
          editorDidMount={this.editorDidMount.bind(this)}
        />
      </Fragment>
    );
  }
}

export default Record;
