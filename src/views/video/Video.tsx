import React, { createRef, RefObject, Fragment } from 'react';
import './Video.css';
import MonacoEditor from 'react-monaco-editor';
import MouseDevice from '../../components/MouseDevice';
// import data from '../vdata/data2';
import { IMoveData } from '../../vdata/data1';
import { IMouseEventData } from '../../vdata/data2';
import { imitateMouseEvent } from '../../utils/methods'

interface IState {
  code: string,
  position: { x: number, y: number }
}

class Video extends React.Component<{}, IState> {
  private editorRef: RefObject<MonacoEditor> = createRef<MonacoEditor>();
  constructor(props: {}) {
    super(props);
    this.state = {
      code: '// type your code...',
      position: { x: 0, y: 0 }
    }
  }
  componentDidMount() {
    let data: Array<any> = [];
    let currentTime = 0;
    const intervalHandler = setInterval(() => {
      if (data.length <= 0) {
        clearInterval(intervalHandler);
        return;
      };
      const currentData = data.shift();
      if (currentData?.type === "move") {
        const { time, x, y } = currentData as IMoveData;
        if (currentTime === time) {
          currentTime++;
          this.setState({ position: { x, y }});
        }
        return;
      }
      if (currentData?.type === "mouse-event") {
        const { time, element, event, x, y } = currentData as IMouseEventData;
        if (currentTime === time) {
          currentTime++;
          imitateMouseEvent(document.querySelector(element) as Element, event, x, y);
        }
        return;
      }
      if (currentData?.type === "key-event") {
      }
    }, 1000);
  }
  editorDidMount(editor: any, monaco: any) {
    console.log('editorDidMount', editor);
    editor.focus();
  }
  onChange(newValue: any, e: any) {
    console.log('onChange', newValue, e);
  }
  render() {
    const code = this.state.code;
    const position = this.state.position;
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <Fragment>
        <MouseDevice x={position.x} y={position.y} />
        <MonacoEditor
          ref={this.editorRef}
          width="800"
          height="600"
          language="javascript"
          theme="vs-dark"
          value={code}
          options={options}
          onChange={this.onChange.bind(this)}
          editorDidMount={this.editorDidMount.bind(this)}
        />
      </Fragment>
    );
  }
}

export default Video;
