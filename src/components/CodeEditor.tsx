import React, { createRef, RefObject } from "react";
import MonacoEditor from "react-monaco-editor";
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { v5 as uuidv5 } from 'uuid';
import IO from "socket.io-client";
import { Directory, Depandency } from "./sidebar.d";
import { IResizeEntry, ResizeSensor, Divider, Button, Tree, ITreeNode, H5 } from "@blueprintjs/core";
import { baseURL } from "../views/config";
import './CodeEditor.css'
import { store } from "../views/state";

interface IProps { 
  darkTheme: boolean
  dirs?: Array<Directory>,
  depandencies?: Array<Depandency>,
  defaultCode?: string | undefined,
  onRunCode?: (code: string) => void
}
interface IState { 
  showConsole: boolean, outputs: string[],
  nodes: ITreeNode[],
  monacoSize: { width: string|number, height: string|number }
}
const NAMESPACE = uuidv5("learningbay-frontend", uuidv5.DNS);
class CodeEditor extends React.Component<IProps, IState> {
  private client = IO(baseURL);
  private options = {
    minimap: { enabled: false },
    scrollbar: { verticalScrollbarSize: 0, verticalSliderSize: 14, 
      horizontalScrollbarSize: 0, horizontalSliderSize: 14, 
      alwaysConsumeMouseWheel: false },
    glyphMargin: false, folding: false, contextmenu: false,
    fontFamily: "Source Code Pro", fontSize: 13, lineHeight: 20,
    extraEditorClassName: "CodeEditor"
  };
  private editorRef: RefObject<MonacoEditor> = createRef<MonacoEditor>();
  public editor: monacoEditor.editor.IStandaloneCodeEditor | undefined = undefined;
  constructor(props: IProps) {
    super(props);
    this.state = {
      showConsole: false, outputs: [""],
      nodes: [{id:uuidv5('file', NAMESPACE), isExpanded: true, label:'files', icon:'folder-open', childNodes: [{
        id: uuidv5('index.js', NAMESPACE), icon: "document", label: "index.js", isSelected: true
      }]}],
      monacoSize: { width: 0, height: 0 }
    }
  }
  componentDidMount() {
    this.client.on('code-output', (msg: string) => {
      let lastStr = this.state.outputs.pop() as string;
      lastStr += msg;
      this.state.outputs.push(lastStr);
      this.setState({ outputs: this.state.outputs, showConsole: true });
    });
    this.client.on('code-exit', () => {
      this.setState({ outputs: this.state.outputs.concat([""]) });
    });
    this.editor = this.editorRef.current?.editor;
  }
  componentWillUnmount() {
    if (this.client.connected) this.client.disconnect();
  }
  private handleResizeMonacoEditor = (entries: IResizeEntry[]) => {
    const e = entries[0] as IResizeEntry;
    const sidebarView = document.querySelector('.SidebarView');
    let width = e.contentRect.width;
    let height = e.contentRect.height - 40; // 固定减去 TitleView 的 40 高
    if (sidebarView !== null) width -= (sidebarView as HTMLElement).offsetWidth;
    if (this.state.showConsole) { // 显示全部 ConsoleView
      const consoleView = document.querySelector('.ConsoleView');
      if (consoleView !== null) height -= (consoleView as HTMLElement).offsetHeight;
    } else { height -= 30 } // 显示部分 ConsoleView，固定为 30px
    this.setState({ monacoSize: {width, height} });
  }
  private handleRunClick = () => {
    let content: string | undefined = this.editorRef.current?.editor?.getValue();
    if (typeof content === 'undefined') content = '';
    if (!this.client.connected) this.client.connect();
    this.client.emit('code', {
      extname: 'js', filename: 'child', uid: store.getState().username,
      codeContent: content
    });
    this.props.onRunCode?.call(this, content);
  }
  private handleShowConsole = () => {
    // const editorEle = document.querySelector(".react-monaco-editor-container") as HTMLElement;
    // const width = editorEle.offsetWidth;
    // let height = editorEle.offsetHeight;
    const width = this.state.monacoSize.width as number;
    const height = this.state.monacoSize.height as number;
    let nextH;
    if (this.state.showConsole) nextH = 10 / 7 * (height + 9); // true => false
    else nextH = 9 + 0.7 * height; // false => true
    this.setState({ showConsole: !this.state.showConsole, monacoSize: { width, height: nextH}});
  }
  // tree Events
  private handleNodeClick = (nodeData: ITreeNode, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    const originallySelected = nodeData.isSelected;
    if (!e.shiftKey) {
      this.forEachNode(this.state.nodes, n => (n.isSelected = false));
    }
    nodeData.isSelected = originallySelected == null ? true : !originallySelected;
    this.setState(this.state);
  };
  private handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false;
    this.setState(this.state);
  };
  private handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true;
    this.setState(this.state);
  };
  private forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
    if (nodes == null) return;
    for (const node of nodes) {
      callback(node);
      this.forEachNode(node.childNodes as ITreeNode[], callback);
    }
  }
  render() {
    const { darkTheme, defaultCode } = this.props;
    const { showConsole, outputs } = this.state;
    const { width, height } = this.state.monacoSize;
    const logs = outputs.map((output, index) => (<pre className="log output" key={`log-${index}`}>{output}</pre>));
    return (
      <ResizeSensor onResize={this.handleResizeMonacoEditor}>
        <div className="EditorRoot" style={{ width: '100%', height: '100%' }}>
          <div className="SidebarView">
            {/* <Sidebar title="Project" dirs={dirs} depandencies={depandencies} /> */}
            <H5 className="project title">Project</H5>
            <Divider style={{margin: '0 7px'}} />
            <Tree
              contents={this.state.nodes}
              onNodeClick={this.handleNodeClick}
              onNodeCollapse={this.handleNodeCollapse}
              onNodeExpand={this.handleNodeExpand}
            />
          </div>
          <div className={ darkTheme ? "TitlebarView flex between dark" : "TitlebarView flex between" } 
            style={{width: 'calc(100% - var(--sidebar-width))'}}>
            <div className="project title">index.js</div>
            <Button id="run-code-btn" data-imitate style={{height: '30px'}} icon="play" text="Run Code" intent="success" onClick={this.handleRunClick} />
          </div>
          <div className="EditorView">
            <MonacoEditor ref={this.editorRef}
              width={width} height={height}
              language="javascript" theme={ darkTheme ? "vs-dark": "vs-light" }
              options={this.options}
              defaultValue={defaultCode}
            />
          </div>
          <div className={ showConsole ? "ConsoleView open" : "ConsoleView"}
            style={ darkTheme ? {backgroundColor: "var(--dark-console-color)"} : {backgroundColor: "var(--light-console-color)"} }>
            <Divider className={ darkTheme ? "divider dark" : "divider"} />
            <section className="flex vertical" style={{ width: '100%', height: '100%' }}>
              <div className="header flex between none" onClick={this.handleShowConsole}>
                <div className="title">Console</div>
                <div className="tools">
                  <Button minimal icon={ showConsole ? "chevron-down" : "chevron-up" } />
                </div>
              </div>
              <div className="Logs auto">
                {logs}
              </div>
            </section>
          </div>
        </div>
      </ResizeSensor>
    );
  }
}

export default CodeEditor;