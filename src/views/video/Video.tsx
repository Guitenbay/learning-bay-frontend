import React, { createRef, RefObject, Fragment } from 'react';
import './Video.css';
import MonacoEditor from 'react-monaco-editor';
import Axios from 'axios';
import MouseDevice from '../../components/MouseDevice';
import { IMoveData } from '../../vdata/data1';
import { IMouseEventData } from '../../vdata/data2';
import { imitateMouseEvent } from '../../utils/methods'
import { IFrame } from '../frame.d';
import { baseURL } from '../config'

interface IState {
  play: boolean,
  code: string,
  position: { x: number, y: number }
}

class Video extends React.Component<{}, IState> {
  private editorRef: RefObject<MonacoEditor> = createRef<MonacoEditor>();
  private editorData: Array<IFrame> = [];
  private intervalHandler: NodeJS.Timeout | undefined = undefined;
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
      // focus
      this.intervalHandler = setInterval(() => {
        if (this.editorData.length <= 0) {
          clearInterval(this.intervalHandler as NodeJS.Timeout);
          return;
        };
        this.editorRef.current?.editor?.focus();
        const currentData = this.editorData.shift();
        if ((currentData as IFrame).index === this.currentTime) {
          this.editorRef.current?.editor?.setValue((currentData as IFrame).modelValue);
          this.editorRef.current?.editor?.restoreViewState((currentData as IFrame).viewState);
        }
        this.currentTime++;
        // if (currentData?.type === "move") {
        //   const { time, x, y } = currentData as IMoveData;
        //   if (currentTime === time) {
        //     currentTime++;
        //     this.setState({ position: { x, y }});
        //   }
        //   return;
        // }
        // if (currentData?.type === "mouse-event") {
        //   const { time, element, event, x, y } = currentData as IMouseEventData;
        //   if (currentTime === time) {
        //     currentTime++;
        //     imitateMouseEvent(document.querySelector(element) as Element, event, x, y);
        //   }
        //   return;
        // }
      }, 1000);
    }
    // play => false
    if (!this.state.play && prevState.play) {
      if (typeof this.intervalHandler !== 'undefined') clearInterval(this.intervalHandler);
    }
  }
  async getVideoEditorData() {
    const resp = await Axios.get(`${baseURL}/video/1.mmcv`);
    const rawData = resp.data as string;
    const editorData = rawData.split('\r\n').map(data => {
      if (data.length > 0) {
        return JSON.parse(data);
      } else {
        return [];
      }
    }).flat(1);
    return editorData.sort((former, latter) => (former.index - latter.index));
  }
  componentDidMount() {
    this.getVideoEditorData().then(data => {
      console.log(data);
      this.editorData = data;
    }).catch(err => console.error(err));
  }
  // editorDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) {
  //   // editor.setValue(data.value);
  //   // editor.restoreViewState(data.viewstate);
  //   editor.focus();
  // }
  render() {
    const code = this.state.code;
    const position = this.state.position;
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <Fragment>
        <MouseDevice x={position.x} y={position.y} />
        <button onClick={this.handlePlayClick}>Play</button>
        <MonacoEditor
          ref={this.editorRef}
          width="800"
          height="600"
          language="javascript"
          theme="vs-dark"
          value={code}
          options={options}
          // editorDidMount={this.editorDidMount.bind(this)}
        />
      </Fragment>
    );
  }
}

export default Video;
