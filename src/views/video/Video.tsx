import React, { createRef, RefObject, Fragment } from 'react';
import { ResizeSensor, IResizeEntry } from '@blueprintjs/core';
import MonacoEditor from 'react-monaco-editor';
// import Axios from 'axios';
import lodash from 'lodash';
import './Video.css';
import MouseDevice from '../../components/MouseDevice';
import { imitateMouseEvent } from '../../utils/methods'
import { IEditorFrame } from '../frame.d';
import { baseURL } from '../config'
import Sidebar from '../../components/Sidebar';
import { Directory, Depandency } from '../../components/sidebar.d';
import Footer from '../../components/Footer';
import { blobGet } from '../../utils/blob-ajax';

interface IState {
  play: boolean,
  audioUrl: string,
  position: { x: number, y: number },
  monacoSize: { width: string, height: string }
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

class Video extends React.Component<{}, IState> {
  private editorRef: RefObject<MonacoEditor> = createRef<MonacoEditor>();
  // private audioRef: RefObject<ReactPlayer> = createRef<ReactPlayer>();
  private audioElement: HTMLAudioElement | undefined = undefined;
  private editorData: Array<IEditorFrame> = [];
  private playArea: HTMLElement | undefined = undefined;
  private currentTime = 0;
  constructor(props: {}) {
    super(props);
    this.state = {
      play: false,
      audioUrl: "",
      position: { x: 0, y: 0 },
      monacoSize: { width: '100%', height: '100%' }
    }
  }
  playFrame = () => {
    if (this.editorData.length <= this.currentTime) {
      this.setState({ play: false });
      return;
    };
    // focus
    this.editorRef.current?.editor?.focus();
    const currentData = this.editorData[this.currentTime];
    if ((currentData as IEditorFrame).index === this.currentTime) {
      const initPos = { x:0, y:0 };
      initPos.x = (this.playArea as HTMLElement).offsetLeft;
      initPos.y = (this.playArea as HTMLElement).offsetTop;
      const { x, y } = (currentData as IEditorFrame).mouseMove;
      this.setState({ position: { x: initPos.x + x, y: initPos.y + y }});
      (currentData as IEditorFrame).mouseEvents.forEach(({x, y, element, event}) => {
        imitateMouseEvent(document.querySelector(element) as HTMLElement, event, x, y);
      })
      this.editorRef.current?.editor?.setValue((currentData as IEditorFrame).modelValue);
      this.editorRef.current?.editor?.restoreViewState((currentData as IEditorFrame).viewState);
    }
    this.currentTime++;
    // 每隔 0.1s 调用函数
    if (this.state.play) setTimeout(() => requestAnimationFrame(this.playFrame), 100);
  }
  componentDidUpdate(prevProps:{}, prevState: IState) {
    // play => true
    if (this.state.play && !prevState.play) {
      requestAnimationFrame(this.playFrame);
      this.audioElement?.play();
    }
    // play => false
    if (!this.state.play && !prevState.play) {
      this.audioElement?.pause();
    }
  }
  async getVideoEditorData() {
    // const resp = await Axios.get(`${baseURL}/video/1.mmcv`);
    const resp = await blobGet(`${baseURL}/video/1.mmcv`);
    const rawData = await resp.text();
    let editorData: Array<IEditorFrame> = [];
    if (Array.isArray(rawData)) {
      editorData = rawData;
    } else {
      editorData = (rawData as string).split('\r\n').map((data: string) => {
        if (data.length > 0) return JSON.parse(data);
        else return [];
      }).flat(1);
    }
    return editorData.sort((former, latter) => (former.index - latter.index));
  }
  async getAudioURL() {
    // const mimeType = 'text/plain';
    // console.log('MediaSource' in window);
    // console.log(MediaSource.isTypeSupported(mimeType));
    // if ('MediaSource' in window) {
    //   const mediasource = new MediaSource();
    //   mediasource.addEventListener('sourceopen', () => {
    //     const sourceBuffer = mediasource.addSourceBuffer(mimeType);
    //     sourceBuffer.addEventListener('updateend', () => mediasource.endOfStream());
    //     bufferGet(`${baseURL}/audio/1.webm`).then(buf => sourceBuffer.appendBuffer(buf))
    //   })
    //   return URL.createObjectURL(mediasource);
    // }
    // return '233';
    const blob = await blobGet(`${baseURL}/audio/1.webm`);
    return URL.createObjectURL(blob);
  }
  componentWillMount() {
    Promise.all([this.getVideoEditorData(), this.getAudioURL()]).then(([data, url]) => {
      this.editorData = data;
      this.setState({ audioUrl: url });
    }).catch(err => console.error(err));
  }
  componentDidMount() {
    this.playArea = document.querySelector('#play-area') as HTMLElement;
    this.audioElement = document.querySelector('audio') as HTMLAudioElement;
    this.audioElement.addEventListener('seeked', lodash.debounce(this.handleAudioSeek, 100));
    this.audioElement.addEventListener('play', () => {this.setState({ play: true })});
    this.audioElement.addEventListener('ended', () => {this.setState({ play: false })});
  }
  handleResizeMonacoEditor = (entries: IResizeEntry[]) => {
    // console.log(entries);
    const e = entries[0] as IResizeEntry;
    const sidebar = document.querySelector('.SidebarView');
    let width = e.contentRect.width
    if (sidebar !== null) {
      width -= (sidebar as HTMLElement).offsetWidth;
    }
    const height = e.contentRect.height;
    this.setState({ monacoSize: {width: `${width}`, height: `${height}`} });
  }
  handlePlayClick = () => this.setState({ play: !this.state.play })
  handleAudioSeek = (event: Event) => {
    const second = (event.target as HTMLAudioElement).currentTime;
    // 向下取一位小数 即以 0.1s 为单位
    const startSeekPos: number = +second.toFixed(1);
    this.currentTime = startSeekPos * 10;
    this.setState({ play: true });
  }
  render() {
    const { position, audioUrl } = this.state;
    const options = {
      minimap: { enabled: false },
      scrollbar: { verticalScrollbarSize: 0, verticalSliderSize: 15, 
        horizontalScrollbarSize: 0, horizontalSliderSize: 15 }
    };
    const { width, height } = this.state.monacoSize;
    return (
      <Fragment>
        <div className="flex vertical" style={{width: '100%', height: '100%'}}>
          <MouseDevice x={position.x} y={position.y} />
          <div className="auto">
            <ResizeSensor onResize={this.handleResizeMonacoEditor}>
              <div id="play-area" style={{width: '100%', height: '100%'}}>
                <div className="SidebarView">
                  <Sidebar title="Project" dirs={dirs} depandencies={depandencies} />
                </div>
                <div className="EditorView">
                  <MonacoEditor ref={this.editorRef}
                    width={width} height={height}
                    language="javascript" theme="vs-dark"
                    options={options}
                  />
                </div>
                <div className="PaneView">

                </div>
                <div className="InterfaceView MarkView">
                  <button className="none" onClick={this.handlePlayClick}>Play</button>
                </div>
              </div>
            </ResizeSensor>
          </div>
          <div className="none audio">
            <audio controls preload="auto" src={audioUrl}>您的浏览器不支持 audio 标签。</audio>
            {/* <ReactPlayer url={audioUrl} controls playing
              width="100%" height="100%"
              config={{
                file: { forceAudio: true }
              }}/> */}
          </div>
        </div>
        <div className="Page">
          <article>
            something in here...
          </article>
        </div>
        <Footer />
      </Fragment>
    );
  }
}

export default Video;
