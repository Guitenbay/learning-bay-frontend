import React, { Fragment, RefObject, createRef } from 'react';
import Footer from '../../components/Footer';
import { store } from '../state';
import CodeEditor from '../../components/CodeEditor';
import { Directory, Depandency } from '../../components/sidebar.d';
import './Code.css'
import { RouteComponentProps } from 'react-router-dom';
import { Axios, fusekiURL, baseURL } from '../config';
import { H2 } from '@blueprintjs/core';
import ReactMarkdown from 'react-markdown';
import { addErrorToast } from '../toaster';

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
type CodeQuestion = {
  title: string,
  code?: string,
  content: string,
  creator: string,
  date: string
  kElementUris: Array<string>
}
interface IState {
  codeQuestion: CodeQuestion | undefined
}

class Code extends React.Component<RouteComponentProps, IState> {
  private editorRef: RefObject<CodeEditor> = createRef<CodeEditor>();
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      codeQuestion: undefined
    }
  }
  async getCodeQuestion(uri: string) {
    const resp = await Axios.get(fusekiURL+"/code-question", { params: { uri} });
    const { res, data } = resp.data;
    if (res) {
      return data;
    } else {
      return undefined;
    }
  }
  componentDidMount() {
    const state = this.props.location.state as {uri: string | undefined};
    if (typeof state?.uri === 'string') {
      this.getCodeQuestion(state?.uri as string).then(codeQuestion => {
        if (codeQuestion === undefined) {
          addErrorToast("获取数据失败");
        } else {
          this.setState({ codeQuestion });
        }
      }).catch(err => console.error(err));
    }
  }
  handleRunCode = (code: string) => {
    Axios.post(baseURL+"/code/analyse", 
      { code, testFilename: '1.test' }, 
      { headers: { 'Context-Type': 'application/json' }, withCredentials: true }
    ).then(resp => {
      const { res, data } = resp.data;
      if (res) {
        console.log(data);
      } else {
        addErrorToast(data);
      }
    }).catch(err => console.error(err));
  }
  render() {
    const { darkTheme } = store.getState();
    const { codeQuestion } = this.state;
    return (
      <Fragment>
        <div className="Page">
          <article>
            <H2>{codeQuestion?.title}</H2>
            <ReactMarkdown source={codeQuestion?.content} />
          </article>
          <div id="code-area" style={{height: '600px', margin: '0 auto', maxWidth: 'var(--main-width)'}}>
            { (typeof codeQuestion !== 'undefined')
              // defaultCode 要设置，必须是第一次创建时设置，当组件更新时不会重新设置
              ? (<CodeEditor ref={this.editorRef}
                darkTheme={darkTheme}
                dirs={dirs} depandencies={depandencies}
                defaultCode={codeQuestion?.code || ''}
                onRunCode={this.handleRunCode}
              />)
              : null
            }
          </div>
        </div>
        <Footer />
      </Fragment>
    )
  }
}

export default Code;