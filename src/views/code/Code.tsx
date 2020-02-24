import React, { Fragment, RefObject, createRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import Axios from 'axios';
import { baseURL } from '../config';
import Footer from '../../components/Footer';

class Code extends React.Component {
  private editorRef: RefObject<MonacoEditor> = createRef<MonacoEditor>();
  constructor(props: {}) {
    super(props);
    this.handleRunClick = this.handleRunClick.bind(this);
  }
  handleRunClick() {
    let context: string | undefined = this.editorRef.current?.editor?.getValue();
    if (typeof context === 'undefined') context = '';
    Axios.post(`${baseURL}/code/js/child?uid=guitenbay`, { code: Base64.encode(context) }).then(resp => {
      console.log(resp.data);
    }).catch(err => console.error(err));
  }
  render() {
    const options = {
      minimap: { enabled: false },
      scrollbar: { verticalScrollbarSize: 0, verticalSliderSize: 14, 
        horizontalScrollbarSize: 0, horizontalSliderSize: 14 }
    };
    return (
      <Fragment>
        <button onClick={this.handleRunClick}>Run</button>
        <MonacoEditor
          ref={this.editorRef}
          width="100%"
          height="600"
          language="javascript"
          theme="vs-dark"
          options={options}
        />
        <Footer />
      </Fragment>
    )
  }
}

export default Code;