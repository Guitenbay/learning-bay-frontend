import React, { createRef, RefObject } from "react";
import MonacoEditor from "react-monaco-editor";
import { v5 as uuidv5 } from 'uuid';
import { Directory, Depandency } from "./sidebar.d";
import { IResizeEntry, ResizeSensor, Divider, Button, Tree, ITreeNode, H5 } from "@blueprintjs/core";
import Axios from "axios";
import { baseURL } from "../views/config";
import './CodeEditor.css'

interface IProps { 
  darkTheme: boolean
  dirs: Array<Directory>,
  depandencies: Array<Depandency>
}
interface IState { 
  showConsole: boolean, result: string,
  nodes: ITreeNode[],
  monacoSize: { width: string, height: string }
}
const NAMESPACE = uuidv5("learningbay-frontend", uuidv5.DNS);
class CodeEditor extends React.Component<IProps, IState> {
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
  public editor = this.editorRef.current?.editor;
  constructor(props: IProps) {
    super(props);
    this.state = {
      showConsole: false, result: "",
      nodes: [{id:uuidv5('file', NAMESPACE), isExpanded: true, label:'files', icon:'folder-open', childNodes: [{
        id: uuidv5('index.js', NAMESPACE), icon: "document", label: "index.js", isSelected: true
      }]}],
      monacoSize: { width: '100%', height: '100%' }
    }
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
    this.setState({ monacoSize: {width: `${width}`, height: `${height}`} });
  }
  private handleRunClick = () => {
    let context: string | undefined = this.editorRef.current?.editor?.getValue();
    if (typeof context === 'undefined') context = '';
    Axios.post(`${baseURL}/code/js/child?uid=guitenbay`, { code: Base64.encode(context) }).then(resp => {
      console.log(resp.data);
      const { res, result } = resp.data;
      if (res) { this.setState({ result }) }
    }).catch(err => console.error(err));
  }
  private handleShowConsole = () => {
    const editorEle = document.querySelector(".react-monaco-editor-container") as HTMLElement;
    const width = editorEle.offsetWidth;
    let height = editorEle.offsetHeight;
    if (this.state.showConsole) height *= 3/2;
    else height *= 2/3;
    this.setState({ showConsole: !this.state.showConsole, monacoSize: { width: `${width}`, height: `${height}`}});
  }
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
    const { darkTheme } = this.props;
    const { showConsole, result } = this.state;
    const { width, height } = this.state.monacoSize;
    const logs = (<pre className="log output">{result}</pre>)
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
            <Button style={{height: '30px'}} icon="play" text="Run Code" intent="success" onClick={this.handleRunClick} />
          </div>
          <div className="EditorView">
            <MonacoEditor ref={this.editorRef}
              width={width} height={height}
              language="javascript" theme={ darkTheme ? "vs-dark": "vs-light" }
              options={this.options}
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