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
  code: string,
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
  private intervalHandler: NodeJS.Timeout | undefined = undefined;
  private initPos = {x: 0, y: 0};
  private currentTime = 0;
  constructor(props: {}) {
    super(props);
    this.state = {
      play: false,
      code: '',
      position: { x: 0, y: 0 }
    }
    this.handlePlayClick = this.handlePlayClick.bind(this);
  }
  handlePlayClick() {
    this.setState({ play: !this.state.play });
  }
  componentDidUpdate(prevProps:{}, prevState: IState) {
    // play => true
    if (this.state.play && !prevState.play) {
      this.intervalHandler = setInterval(() => {
        if (this.editorData.length <= 0) {
          clearInterval(this.intervalHandler as NodeJS.Timeout);
          return;
        };
        // focus
        this.editorRef.current?.editor?.focus();
        const currentData = this.editorData.shift();
        if ((currentData as IEditorFrame).index === this.currentTime) {
          const { x, y } = (currentData as IEditorFrame).mouseMove;
          this.setState({ position: { x: this.initPos.x + x, y: this.initPos.y + y }});
          (currentData as IEditorFrame).mouseEvents.forEach(({x, y, element, event}) => {
            imitateMouseEvent(document.querySelector(element) as HTMLElement, event, x, y);
          })
          this.editorRef.current?.editor?.setValue((currentData as IEditorFrame).modelValue);
          this.editorRef.current?.editor?.restoreViewState((currentData as IEditorFrame).viewState);
        }
        this.currentTime++;
      }, 1000);
    }
    // play => false
    if (!this.state.play && prevState.play) {
      if (typeof this.intervalHandler !== 'undefined') clearInterval(this.intervalHandler);
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
    const playArea: HTMLElement = document.querySelector('#play-area') as HTMLElement;
    this.initPos.x = playArea.offsetLeft;
    this.initPos.y = playArea.offsetTop;
    this.getVideoEditorData().then(data => {
      this.editorData = data;
    }).catch(err => console.error(err));
  }
  render() {
    const code = this.state.code;
    const position = this.state.position;
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <Fragment>
        <button onClick={this.handlePlayClick}>Play</button>
        <div id="play-area">
          <MouseDevice x={position.x} y={position.y} />
          <Sidebar title="Project" dirs={dirs} depandencies={depandencies} />
          <MonacoEditor
            ref={this.editorRef}
            width="800"
            height="600"
            language="javascript"
            theme="vs-dark"
            value={code}
            options={options}
          />
        </div>
      </Fragment>
    );
  }
}

export default Video;
