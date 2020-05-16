import React, { createRef, RefObject } from 'react';
import lodash from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import './VideoPlayer.css';
import MouseDevice from './MouseDevice';
import { imitateMouseEvent, getMostLeft, getMostTop } from '../utils/methods'
import { IEditorFrame } from '../views/frame.d';
// import { Directory, Depandency } from './sidebar.d';
import { blobGet } from '../utils/blob-ajax';
import CodeEditor from './CodeEditor';
import AudioController from './AudioController';
import { Icon, Spinner } from '@blueprintjs/core';

interface IProps {
  darkTheme: boolean,
  videoURL: string,
  audioURL: string,
}

interface IState {
  play: boolean,
  canPlay: boolean,
  blobAudioUrl: string,
  position: { x: number, y: number }
}

class VideoPlayer extends React.Component<IProps, IState> {
  private editorRef: RefObject<CodeEditor> = createRef<CodeEditor>();
  private audioRef: RefObject<AudioController> = createRef<AudioController>();
  // private audioElement: HTMLAudioElement | undefined = undefined;
  private editorData: Array<IEditorFrame> = [];
  private playArea: HTMLElement | undefined = undefined;
  private currentFrameNumber = 0;
  private previousTime: number = -1;
  private hiddenPlayClick = false;
  constructor(props: IProps) {
    super(props);
    this.state = {
      play: false,
      canPlay: false,
      blobAudioUrl: "",
      position: { x: 0, y: 0 },
    }
  }
  private playFrame = () => {
    // console.log(this.editorData.length, this.currentFrameNumber);
    if (this.editorData.length <= this.currentFrameNumber) {
      // this.setState({ play: false });
      return;
    };
    // focus
    this.editorRef.current?.editor?.focus();
    const currentData = this.editorData[this.currentFrameNumber];
    if ((currentData as IEditorFrame).index === this.currentFrameNumber) {
      const initPos = { x:0, y:0 };
      const { x, y, containerId } = (currentData as IEditorFrame).mouseMove;
      if (containerId === undefined) {
        initPos.x = (this.playArea as HTMLElement).offsetLeft;
        initPos.y = (this.playArea as HTMLElement).offsetTop;
      } else {
        const container = document.querySelector(`#${containerId}`) as HTMLElement;
        initPos.x = getMostLeft(container, 'play-area');
        initPos.y = getMostTop(container, 'play-area');
      }
      let mouseX = initPos.x + x, mouseY = initPos.y + y;
      // 更新鼠标点击事件
      (currentData as IEditorFrame).mouseEvents.forEach(({element, event}) => {
        const target = document.querySelector(element) as HTMLElement;
        imitateMouseEvent(target, event);
      })
      // 更新鼠标
      this.setState({ position: { x: mouseX, y: mouseY }});
      if (this.currentFrameNumber % 2 === 0) {
        this.editorRef.current?.editor?.setValue((currentData as IEditorFrame).modelValue || '');
        this.editorRef.current?.editor?.restoreViewState((currentData as IEditorFrame).viewState || ({} as monacoEditor.editor.ICodeEditorViewState));
      }
    }
    const currentTime = Date.now();
    this.currentFrameNumber++;
    let ahead = 0;
    if (this.previousTime > 0) {
      // console.log(currentTime, this.previousTime, currentTime - this.previousTime);
      ahead = 100 - (currentTime - this.previousTime);
    }
    this.previousTime = Date.now() + ahead;
    // 每隔 0.1s 调用函数
    if (this.state.play) {
      (100 + ahead > 0) ? setTimeout(() => requestAnimationFrame(this.playFrame),  100 + ahead) : requestAnimationFrame(this.playFrame);
    }
  }
  private async getVideoEditorData(videoURL: string) {
    const resp = await blobGet(videoURL);
    const rawData = resp.text !== undefined 
      ? await resp.text() 
      : await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsText(resp, 'utf-8');
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve('');
      });
    let editorData: Array<IEditorFrame> = [];
    if (Array.isArray(rawData)) {
      editorData = rawData;
    } else {
      // 适配不支持 ... 运算符的浏览器   
      editorData = Array.prototype.concat.apply([], (rawData as string).split('\r\n').map((data: string) => {
        if (data.length > 0) return JSON.parse(data);
        else return [];
      }));
    }
    return editorData.sort((former, latter) => (former.index - latter.index));
  }
  private async getAudioURL(audioURL: string) {
    const blob = await blobGet(audioURL);
    return URL.createObjectURL(blob);
  }
  componentDidUpdate(prevProps:{}, prevState: IState) {
    // play => true
    if (this.state.play && !prevState.play) {
      // 已播放完毕
      if (this.editorData.length <= this.currentFrameNumber) {
        // 重新播放
        this.currentFrameNumber = 0;
      }
      this.previousTime = -1;
      requestAnimationFrame(this.playFrame);
      // this.audioElement?.play();
      if (this.audioRef.current?.audio?.paused) {
        this.audioRef.current.audio.play();
      }
    }
    // play => false
    if (!this.state.play && prevState.play) {
      // this.audioElement?.pause();
      if (!this.audioRef.current?.audio?.paused) {
        this.audioRef.current?.audio?.pause();
      }
    }
  }
  componentDidMount() {
    Promise.all([this.getVideoEditorData(this.props.videoURL), this.getAudioURL(this.props.audioURL)]).then(([data, url]) => {
      this.editorData = data;
      this.setState({ blobAudioUrl: url });
    }).catch(err => console.error(err));
    this.playArea = document.querySelector('#play-area') as HTMLElement;
    // this.audioElement = document.querySelector('audio') as HTMLAudioElement;
    this.playArea.addEventListener("click", event => {
      // 模拟点击，视频不暂停
      if ((event.target as HTMLElement).getAttribute('data-imitate') === 'true') return;
      this.setState({ play: false });
    });
  }
  private handlePlayClick = () => {
    this.hiddenPlayClick = true;
    this.setState({ play: true });
  }
  private handleAudioCanplay = () => {
    this.setState({ canPlay: true })
  }
  private handleAudioPlay = () => {
    if (!this.hiddenPlayClick) {
      this.hiddenPlayClick = true;
    }
    this.setState({ play: true });
  }
  private handleAudioPause = () => this.setState({ play: false })
  private handleAudioEnded = () => this.setState({ play: false })
  private handleAudioSeek = (event: Event) => {
    const second = (event.target as HTMLAudioElement).currentTime;
    // 向下取一位小数 即以 0.1s 为单位
    const startSeekPos: number = +second.toFixed(1);
    this.currentFrameNumber = startSeekPos * 10;
    this.previousTime = -1;
    // 更新帧
    requestAnimationFrame(this.playFrame);
    // this.setState({ play: true });
  }
  render() {
    const { darkTheme } = this.props;
    const { play, position, blobAudioUrl } = this.state;
    return (
      <div className="flex vertical" style={{width: '100%', height: '100%', overflow: 'hidden', position: 'relative'}}>
        <MouseDevice x={position.x} y={position.y} />
        <div className="auto">
          <div id="play-area" style={{width: '100%', height: '100%'}}>
            <CodeEditor ref={this.editorRef}
              darkTheme={darkTheme}
            />
            <div className={ this.hiddenPlayClick ? "InterfaceView MarkView hidden" : "InterfaceView MarkView"}>
              {
                (this.state.canPlay)
                ? (<button className="none" onClick={this.handlePlayClick}
                  style={{padding: '20px', borderRadius: '100px', border: 'none', cursor: 'pointer', backgroundColor: "#5e9af9"}}>
                  <Icon icon="play" iconSize={72} style={{position:'relative', right: '-2px'}} color="rgba(255, 255, 255, 0.9)" />
                </button>)
                : (<Spinner size={70} />)
              }
            </div>
          </div>
        </div>
        <div className="none audio">
          <AudioController 
            ref={this.audioRef}
            audioUrl={blobAudioUrl}
            play={play}
            onCanPlay={this.handleAudioCanplay}
            onPlay={this.handleAudioPlay} 
            onPause={this.handleAudioPause}
            onEnded={this.handleAudioEnded}
            onSeeked={lodash.debounce(this.handleAudioSeek, 100)}
          />
        </div>
      </div>
    );
  }
}

export default VideoPlayer;
