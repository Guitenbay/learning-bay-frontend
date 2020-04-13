import React, { createRef, RefObject } from 'react';
import lodash from 'lodash';
import './VideoPlayer.css';
import MouseDevice from './MouseDevice';
import { imitateMouseEvent } from '../utils/methods'
import { IEditorFrame } from '../views/frame.d';
// import { Directory, Depandency } from './sidebar.d';
import { blobGet } from '../utils/blob-ajax';
import CodeEditor from './CodeEditor';
import AudioController from './AudioController';
import { Icon } from '@blueprintjs/core';

interface IProps {
  darkTheme: boolean,
  videoURL: string,
  audioURL: string,
}

interface IState {
  play: boolean,
  blobAudioUrl: string,
  position: { x: number, y: number }
}

class VideoPlayer extends React.Component<IProps, IState> {
  private editorRef: RefObject<CodeEditor> = createRef<CodeEditor>();
  private audioRef: RefObject<AudioController> = createRef<AudioController>();
  // private audioElement: HTMLAudioElement | undefined = undefined;
  private editorData: Array<IEditorFrame> = [];
  private playArea: HTMLElement | undefined = undefined;
  private currentTime = 0;
  private hiddenPlayClick = false;
  constructor(props: IProps) {
    super(props);
    this.state = {
      play: false,
      blobAudioUrl: "",
      position: { x: 0, y: 0 },
    }
  }
  private playFrame = () => {
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
  private async getVideoEditorData(videoURL: string) {
    const resp = await blobGet(videoURL);
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
  private async getAudioURL(audioURL: string) {
    const blob = await blobGet(audioURL);
    return URL.createObjectURL(blob);
  }
  componentDidUpdate(prevProps:{}, prevState: IState) {
    // play => true
    if (this.state.play && !prevState.play) {
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
    this.playArea.addEventListener("click", () => this.setState({ play: false }));
  }
  private handlePlayClick = () => {
    this.hiddenPlayClick = true;
    this.setState({ play: !this.state.play })
  }
  private handleAudioPlay = () => this.setState({ play: true })
  private handleAudioPause = () => this.setState({ play: false })
  private handleAudioEnded = () => this.setState({ play: false })
  private handleAudioSeek = (event: Event) => {
    const second = (event.target as HTMLAudioElement).currentTime;
    // 向下取一位小数 即以 0.1s 为单位
    const startSeekPos: number = +second.toFixed(1);
    this.currentTime = startSeekPos * 10;
    this.setState({ play: true });
  }
  render() {
    const { darkTheme } = this.props;
    const { play, position, blobAudioUrl } = this.state;
    return (
      <div className="flex vertical" style={{width: '100%', height: '100%'}}>
        <MouseDevice x={position.x} y={position.y} />
        <div className="auto">
          <div id="play-area" style={{width: '100%', height: '100%'}}>
            <CodeEditor ref={this.editorRef}
              darkTheme={darkTheme}
            />
            <div className={ this.hiddenPlayClick ? "InterfaceView MarkView hidden" : "InterfaceView MarkView"}>
              <button className="none" onClick={this.handlePlayClick}
                style={{padding: '20px', borderRadius: '100px', border: 'none', cursor: 'pointer', backgroundColor: "#5e9af9"}}>
                <Icon icon="play" iconSize={72} style={{position:'relative', right: '-2px'}} color="rgba(255, 255, 255, 0.9)" />
              </button>
            </div>
          </div>
        </div>
        <div className="none audio">
          <AudioController 
            ref={this.audioRef}
            audioUrl={blobAudioUrl}
            play={play}
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
