import React, { createRef, RefObject, Fragment } from 'react';
import axios from 'axios';
import { Base64 } from 'js-base64';
import './Record.css';
import MonacoEditor from 'react-monaco-editor';
import Sidebar from '../../components/Sidebar';
import { Directory, Depandency } from '../../components/sidebar.d';
import { IEditorFrame } from '../frame.d';
import { baseURL } from '../config'
import { IMouseEventData, IMouseMoveData } from '../frame.d';

interface IState {
  title: string,
  record: boolean
}

const CACHE_SIZE = 10;

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
  private cacheChunks: Array<IEditorFrame> = [];
  private currentMousePos: IMouseMoveData = {type:'mouse-move',x:0,y:0};
  private cacheMouseEvents: Array<IMouseEventData> = [];
  private intervalHandler: NodeJS.Timeout | undefined = undefined;
  private currentTime: number = 0;
  constructor(props: {}) {
    super(props);
    this.state = {
      title: 'undefined',
      record: false
    }
    this.handleRecordClick = this.handleRecordClick.bind(this);
  }
  setListeners() {
    const recordArea: HTMLElement = document.querySelector<HTMLElement>('#record-area') as HTMLElement;
    recordArea?.addEventListener('mousemove', event => {
      const offsetX = event.offsetX;
      const offsetY = event.offsetY;
      if (this.currentMousePos.x !== offsetX && this.currentMousePos.y !== offsetY) {
        this.currentMousePos = {
          type: 'mouse-move',
          x: offsetX,
          y: offsetY
        }
      }
    });
    recordArea?.addEventListener('click', event => {
      if ((event.target as HTMLElement).id === '') return;
      this.cacheMouseEvents.push({ 
        type: 'mouse-event', x: event.offsetX, y: event.offsetY,
        element: `#${(event.target as HTMLElement).id}`, event: 'click'
      } as IMouseEventData)
    });
  }
  async uploadEditorFrame(frames: Array<IEditorFrame>) {
    const data = Base64.encode(JSON.stringify(frames));
    const blob = new Blob([data], {type : 'application/octet-stream'});
    const resp = await axios.post(`${baseURL}/video/1.mmcv`, blob);
    return resp.data;
  }
  handleRecordClick() {
    this.setState({ record: !this.state.record });
  }
  componentDidUpdate(prevProps:{}, prevState: IState) {
    // record => true
    // 存在 editor
    if (this.state.record && typeof this.editorRef.current?.editor !== 'undefined' 
      && !prevState.record) {
      this.intervalHandler = setInterval(() => {
        if (this.cacheChunks.length >= CACHE_SIZE) {
          this.uploadEditorFrame(this.cacheChunks).then(({ res }) => {
            if (res) this.cacheChunks = [];
            else clearInterval(this.intervalHandler as NodeJS.Timeout);
          }).catch(err => {
            console.error(err)
          });
        }
        const frame = Object.assign({}, {
          index: this.currentTime,
          mouseMove: this.currentMousePos,
          mouseEvents: this.cacheMouseEvents,
          viewState: this.editorRef.current?.editor?.saveViewState(),
          modelValue: this.editorRef.current?.editor?.getValue()
        });
        console.log(frame);
        // TODO: 判断 cacheChunks.length 是否小于 CACHE_SIZE
        this.cacheChunks.push(frame as IEditorFrame)
        
        this.currentTime++;
        this.cacheMouseEvents = []; this.cacheMouseEvents = [];
      }, 1000);
    }
    // record => false
    if (!this.state.record && prevState.record) {
      if (typeof this.intervalHandler !== 'undefined') clearInterval(this.intervalHandler);
      if (this.cacheChunks.length > 0) {
        this.uploadEditorFrame(this.cacheChunks);
        this.cacheChunks = [];
      }
    }
  }
  componentDidMount() {
    this.setListeners();
  }
  render() {
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <Fragment>
        <button onClick={this.handleRecordClick}>Record</button>
        <div id="record-area">
          <Sidebar title="Project" dirs={dirs} depandencies={depandencies} />
          <MonacoEditor
            ref={this.editorRef}
            width="100%"
            height="600"
            language="javascript"
            theme="vs-dark"
            options={options}
          />
        </div>
      </Fragment>
    );
  }
}

export default Record;
