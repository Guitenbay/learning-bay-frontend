import React, { createRef, RefObject, Fragment } from 'react';
import './Video.css';
import MonacoEditor from 'react-monaco-editor';
import Axios from 'axios';
import MouseDevice from '../../components/MouseDevice';
import { imitateMouseEvent } from '../../utils/methods'
import { IEditorFrame } from '../frame.d';
import { baseURL } from '../config'
import Sidebar from '../../components/Sidebar';
import { Directory, Depandency } from '../../components/sidebar.d';

interface IState {
  play: boolean,
  position: { x: number, y: number }
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
  private editorData: Array<IEditorFrame> = [];
  private playArea: HTMLElement | undefined = undefined;
  private currentTime = 0;
  constructor(props: {}) {
    super(props);
    this.state = {
      play: false,
      position: { x: 0, y: 0 }
    }
    this.handlePlayClick = this.handlePlayClick.bind(this);
    this.playFrame = this.playFrame.bind(this);
  }
  handlePlayClick() {
    this.setState({ play: !this.state.play });
  }
  playFrame() {
    if (this.editorData.length <= this.currentTime) {
      this.setState({ play: false });
      return;
    };
    // focus
    this.editorRef.current?.editor?.focus();
    const currentData = this.editorData[this.currentTime];
    if ((currentData as IEditorFrame).index === this.currentTime) {
      const initPos = {x:0, y:0};
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
    }
  }
  async getVideoEditorData() {
    const resp = await Axios.get(`${baseURL}/video/1.mmcv`);
    const rawData = resp.data;
    let editorData: Array<IEditorFrame> = [];
    if (Array.isArray(rawData)) {
      editorData = rawData;
    } else {
      editorData = (rawData as string).split('\r\n').map((data: string) => {
        if (data.length > 0) {
          return JSON.parse(data);
        } else {
          return [];
        }
      }).flat(1);
    }
    return editorData.sort((former, latter) => (former.index - latter.index));
  }
  componentDidMount() {
    this.playArea = document.querySelector('#play-area') as HTMLElement;
    this.getVideoEditorData().then(data => {
      console.log(data);
      this.editorData = data;
    }).catch(err => console.error(err));
  }
  render() {
    const position = this.state.position;
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <Fragment>
        <button onClick={this.handlePlayClick}>Play</button>
        <MouseDevice x={position.x} y={position.y} />
        <div id="play-area">
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

export default Video;
