import React, { createRef, RefObject } from "react";
import MonacoEditor from "react-monaco-editor";
import { Directory, Depandency } from "./sidebar.d";
import Sidebar from "./Sidebar";
import { IResizeEntry, ResizeSensor } from "@blueprintjs/core";
import Axios from "axios";
import { baseURL } from "../views/config";

interface IProps { 
  darkTheme: boolean
  dirs: Array<Directory>,
  depandencies: Array<Depandency>
}
interface IState { monacoSize: { width: string, height: string } }

class CodeEditor extends React.Component<IProps, IState> {
  private options = {
    minimap: { enabled: false },
    scrollbar: { verticalScrollbarSize: 0, verticalSliderSize: 14, 
      horizontalScrollbarSize: 0, horizontalSliderSize: 14 }
  };
  private editorRef: RefObject<MonacoEditor> = createRef<MonacoEditor>();
  public editor = this.editorRef.current?.editor;
  constructor(props: IProps) {
    super(props);
    this.state = {
      monacoSize: { width: '100%', height: '100%' }
    }
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
  handleRunClick = () => {
    let context: string | undefined = this.editorRef.current?.editor?.getValue();
    if (typeof context === 'undefined') context = '';
    Axios.post(`${baseURL}/code/js/child?uid=guitenbay`, { code: Base64.encode(context) }).then(resp => {
      console.log(resp.data);
    }).catch(err => console.error(err));
  }
  render() {
    const { darkTheme, dirs, depandencies } = this.props;
    const { width, height } = this.state.monacoSize;
    return (
      <ResizeSensor onResize={this.handleResizeMonacoEditor}>
        <div style={{ width: '100%', height: '100%' }}>
          <div className="SidebarView">
            <Sidebar title="Project" dirs={dirs} depandencies={depandencies} />
          </div>
          <div className="TitlebarView">
            <button onClick={this.handleRunClick}>Run</button>
          </div>
          <div className="EditorView">
            <MonacoEditor ref={this.editorRef}
              width={width} height={height}
              language="javascript" theme={ darkTheme ? "vs-dark": "vs-light" }
              options={this.options}
            />
          </div>
          <div className="PaneView ConsoleView">

          </div>
        </div>
      </ResizeSensor>
    );
  }
}

export default CodeEditor;