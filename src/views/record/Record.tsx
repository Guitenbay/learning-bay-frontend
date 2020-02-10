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
  private cacheFrames: Array<IEditorFrame> = [];
  private uploadChunks: Array<Array<IEditorFrame>> = [];
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
    this.recordFrame = this.recordFrame.bind(this)
  }
  setListeners() {
    const recordArea: HTMLElement = document.querySelector<HTMLElement>('#record-area') as HTMLElement;
    recordArea?.addEventListener('mousemove', event => {
      // console.dir(event);
      const offsetX = event.clientX - recordArea.offsetLeft;
      const offsetY = event.clientY - recordArea.offsetTop;
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
  recordFrame() {
    const frame = Object.assign({}, {
      index: this.currentTime,
      mouseMove: this.currentMousePos,
      mouseEvents: this.cacheMouseEvents,
      viewState: this.editorRef.current?.editor?.saveViewState(),
      modelValue: this.editorRef.current?.editor?.getValue()
    });
    // console.log(frame);
    this.cacheFrames.push(frame as IEditorFrame)
    
    this.currentTime++;
    this.cacheMouseEvents = [];
    // 每隔 0.1s 调用函数
    if (this.state.record) setTimeout(() => requestAnimationFrame(this.recordFrame), 100);
  }
  componentDidUpdate(prevProps:{}, prevState: IState) {
    // record => true
    // 存在 editor
    if (this.state.record && typeof this.editorRef.current?.editor !== 'undefined' 
      && !prevState.record) {
      requestAnimationFrame(this.recordFrame);
      // 每隔 10s 上传数据
      this.intervalHandler = setInterval(() => {
        if (this.cacheFrames.length >= CACHE_SIZE) {
          this.uploadChunks.push(this.cacheFrames);
          this.cacheFrames = [];
          this.uploadEditorFrame(this.uploadChunks[0]).then(({ res }) => {
            if (!res) {
              this.setState({ record: false });
              console.log('上传失败');
              // TODO: 转入上传失败函数处理
            } else {
              this.uploadChunks.shift();
              console.log('上传成功');
            }
            // else clearInterval(this.intervalHandler as NodeJS.Timeout);
          }).catch(err => {
            this.setState({ record: false });
            console.error(err);
          });
        }
      }, 1000);
    }
    // record => false
    if (!this.state.record && prevState.record) {
      if (typeof this.intervalHandler !== 'undefined') {
        clearInterval(this.intervalHandler);
        this.intervalHandler = undefined;
      }
      if (this.cacheFrames.length > 0) {
        this.uploadChunks.push(this.cacheFrames);
        this.cacheFrames = [];
        this.uploadEditorFrame(this.uploadChunks[0]).then(({ res }) => {
          if (res) {
            console.log('上传成功');
            this.uploadChunks.shift();
          } else {
            console.log('上传失败');
            // TODO: 转入上传失败函数处理
          }
          // else clearInterval(this.intervalHandler as NodeJS.Timeout);
        }).catch(err => {
          console.error(err);
        });
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
