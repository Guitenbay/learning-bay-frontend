import React, { createRef, RefObject } from 'react';
import { Base64 } from 'js-base64';
import { ReactMic, ReactMicStopEvent } from 'react-mic';
import './Record.css';
import { Directory, Depandency } from '../../components/sidebar.d';
import { IEditorFrame } from '../frame.d';
import { baseURL, Axios } from '../config'
import { IMouseEventData, IMouseMoveData } from '../frame.d';
import { blobPost } from '../../utils/blob-ajax';
import { store } from '../state';
import CodeEditor from '../../components/CodeEditor';
import { Button } from '@blueprintjs/core';
import { addErrorToast, addSuccessToast } from '../toaster';
import { getImitateElement } from '../../utils/methods';

interface IState {
  title: string,
  record: boolean,
  created: boolean
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
  private editorRef: RefObject<CodeEditor> = createRef<CodeEditor>();
  private cacheFrames: Array<IEditorFrame> = [];
  private uploadChunks: Array<Array<IEditorFrame>> = [];
  private currentMousePos: IMouseMoveData = {type:'mouse-move',x:0,y:0};
  private cacheMouseEvents: Array<IMouseEventData> = [];
  private intervalHandler: NodeJS.Timeout | undefined = undefined;
  private currentFrameNumber: number = 0;
  private previousTime: number = -1;

  private recordArea: HTMLElement|undefined;
  constructor(props: {}) {
    super(props);
    this.state = {
      title: 'undefined',
      record: false,
      created: false
    }
  }
  private setListeners() {
    if (this.recordArea === undefined) return;
    const recordArea = this.recordArea as HTMLElement;
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
      const target = getImitateElement(event.target as HTMLElement);
      if (Object.is(target, null)) return;
      if ((target as HTMLElement).id === '') return;
      this.cacheMouseEvents.push({ 
        type: 'mouse-event',
        element: `#${(target as HTMLElement).id}`, event: 'click'
      } as IMouseEventData)
    });
  }
  private async createMMCVFile(filename: string) {
    const resp = await Axios.put(`${baseURL}/video/1.mmcv`);
    return resp.data.res;
  }
  private async uploadEditorFrame(frames: Array<IEditorFrame>) {
    const data = Base64.encode(JSON.stringify(frames));
    const blob = new Blob([data], {type : 'application/octet-stream'});
    // const resp = await axios.post(`${baseURL}/video/1.mmcv`, blob);
    const resp = await blobPost(`${baseURL}/video/1.mmcv`, blob);
    return resp;
  }
  private recordFrame = () => {
    const currentTime = Date.now();
    let frame = Object.assign({}, {
      index: this.currentFrameNumber,
      mouseMove: this.currentMousePos,
      mouseEvents: this.cacheMouseEvents,
    });
    if (this.currentFrameNumber % 2 === 0) {
      frame = Object.assign(frame, {
        viewState: this.editorRef.current?.editor?.saveViewState(),
        modelValue: this.editorRef.current?.editor?.getValue()
      });
    }
    this.cacheFrames.push(frame as IEditorFrame);
    
    this.currentFrameNumber++;
    this.cacheMouseEvents = [];

    let ahead = 0;
    if (this.previousTime > 0) {
      // console.log(currentTime, this.previousTime, currentTime - this.previousTime);
      ahead = 100 - (currentTime - this.previousTime);
    }
    this.previousTime = Date.now() + ahead;
    // 每隔 0.1s 调用函数
    if (this.state.record) setTimeout(() => requestAnimationFrame(this.recordFrame), (100 + ahead > 0) ? 100 + ahead: 0);
  }
  componentDidUpdate(prevProps:{}, prevState: IState) {
    // record => true
    // 存在 editor
    if (this.state.record && typeof this.editorRef.current?.editor !== 'undefined' 
      && !prevState.record) {
      addSuccessToast("开始录制动作")
      // this.currentFrameNumber = 0;
      // this.previousTime = -1;
      requestAnimationFrame(this.recordFrame);
      // 每隔 1s 上传数据
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
        clearInterval(this.intervalHandler); this.intervalHandler = undefined; 
      }
      if (this.cacheFrames.length > 0) {
        this.uploadChunks.push(this.cacheFrames);
        this.cacheFrames = [];
        this.uploadEditorFrame(this.uploadChunks[0]).then(({ res }) => {
          if (res) {
            addSuccessToast('上传文件成功');
            this.uploadChunks.shift();
          } else {
            addErrorToast('上传文件失败');
            // TODO: 转入上传失败函数处理
          }
          this.setState({created: false});
        }).catch(err => console.error(err));
      }
    }
  }
  componentDidMount() {
    this.recordArea = document.querySelector<HTMLElement>('#record-area') as HTMLElement;
    this.setListeners();
  }
  private handleRecordClick = () => {
    this.setState({ record: !this.state.record });
  }
  private handleCreateClick = () => {
    this.createMMCVFile('.mmcv').then(res => {
      addSuccessToast('创建文件成功');
      this.currentFrameNumber = 0;
      this.previousTime = -1;
      this.setState({created: res});
    })
  }
  // onData(recordedBlob: Blob) {
  //   console.log('chunk of real-time data is: ', recordedBlob);
  // }
  onStop(recordedBlob: ReactMicStopEvent) {
    // console.log('recordedBlob is: ', recordedBlob);
    blobPost(`${baseURL}/audio/1.webm`, recordedBlob.blob).then(({ res }) => {
      if (res) {
        addSuccessToast('上传音频成功');
      } else {
        addErrorToast('上传音频失败');
        // TODO: 转入上传失败函数处理
      }
    }).catch(err => console.error(err));
  }
  render() {
    const { darkTheme } = store.getState();
    const { created } = this.state;
    return (
      <div className="flex vertical" style={{width: '100%', height: '100%', overflow: "hidden"}}>
        <div className="auto">
          <div id="record-area" style={{width: '100%', height: '100%'}}>
            <CodeEditor ref={this.editorRef}
              darkTheme={darkTheme}
              dirs={dirs} depandencies={depandencies}
            />
            <div className="InterfaceView MarkView">
            </div>
            <div className="InterfaceView AudioView">
              <ReactMic
                record={this.state.record}
                className="sound-wave"
                onStop={this.onStop}
                strokeColor="#000000"
                backgroundColor="#FF4081" />
            </div>
          </div>
        </div>
        <div className="none ControlsView flex">
          <Button className="none" onClick={this.handleCreateClick}>Create</Button>
          <Button className="none" disabled={!created} onClick={this.handleRecordClick}>Record</Button>
          {/* <InputGroup
            onChange={this.handleTextChange}
            placeholder="文件名"
          /> */}
        </div>
      </div>
    );
  }
}

export default Record;
