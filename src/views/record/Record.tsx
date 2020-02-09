import React, { createRef, RefObject, Fragment } from 'react';
import axios from 'axios';
import { Base64 } from 'js-base64';
import './Record.css';
import MonacoEditor from 'react-monaco-editor';
import Sidebar from '../../components/Sidebar';
import { Directory, Depandency } from '../../components/sidebar.d';
import { IFrame } from '../frame.d';
import { baseURL } from '../config'

interface IState {
  title: string,
  record: boolean
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
  private cacheChunks: Array<IFrame> = [];
  private intervalHandler: NodeJS.Timeout | undefined = undefined;
  private currentTime = 0;
  constructor(props: {}) {
    super(props);
    this.state = {
      title: 'undefined',
      record: false
    }
    this.handleRecordClick = this.handleRecordClick.bind(this);
  }
  async uploadFrame(frames: Array<IFrame>) {
    const data = Base64.encode(JSON.stringify(frames));
    const blob = new Blob([data], {type : 'application/octet-stream'});
    return await axios.post(`${baseURL}/video/1.mmcv`, blob);
  }
  handleRecordClick() {
    this.setState({ record: !this.state.record });
  }
  componentDidUpdate(prevProps:{}, prevState: IState) {
    // 当 record 变为 true
    // 存在 editor
    if (this.state.record && typeof this.editorRef.current?.editor !== 'undefined' 
      && !prevState.record) {
      this.intervalHandler = setInterval(() => {
        if (this.cacheChunks.length === 10) {
          this.uploadFrame(this.cacheChunks);
          this.cacheChunks = [];
        }
        const frame = Object.assign({}, {
          index: this.currentTime,
          viewState: this.editorRef.current?.editor?.saveViewState(),
          modelValue: this.editorRef.current?.editor?.getValue()
        })
        this.cacheChunks.push(frame as IFrame)
        this.currentTime++;
      }, 1000);
    }
    // 当 record 变为 false
    if (!this.state.record && prevState.record) {
      if (typeof this.intervalHandler !== 'undefined') clearInterval(this.intervalHandler);
    }
  }
  render() {
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <Fragment>
        <button onClick={this.handleRecordClick}>Record</button>
        <Sidebar title="Project" dirs={dirs} depandencies={depandencies} />
        <MonacoEditor
          ref={this.editorRef}
          width="100%"
          height="600"
          language="javascript"
          theme="vs-dark"
          options={options}
        />
      </Fragment>
    );
  }
}

export default Record;
