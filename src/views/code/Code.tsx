import React, { Fragment, RefObject, createRef } from 'react';
import Footer from '../../components/Footer';
import { store } from '../state';
import CodeEditor from '../../components/CodeEditor';
import { Directory, Depandency } from '../../components/sidebar.d';
import './Code.css'
import { RouteComponentProps } from 'react-router-dom';
import { Axios, fusekiURL } from '../config';
import { Toaster, Intent, H2 } from '@blueprintjs/core';
import ReactMarkdown from 'react-markdown';

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
  private toastRef: RefObject<Toaster> = createRef<Toaster>();
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
  addErrorToast(message: string) {
    this.toastRef.current?.show({
      icon: "error",
      intent: Intent.WARNING,
      message,
      timeout: 5000
    })
  }
  componentDidMount() {
    const { uri } = this.props.location.state as {uri: string};
    this.getCodeQuestion(uri).then(codeQuestion => {
      if (codeQuestion === undefined) {
        this.addErrorToast("获取数据失败");
      } else {
        this.setState({ codeQuestion });
      }
    }).catch(err => console.error(err));
  }
  render() {
    const { darkTheme } = store.getState();
    const { codeQuestion } = this.state;
    return (
      <Fragment>
        <Toaster position="top"
        ref={this.toastRef} />
        <div className="Page">
          <article>
            <H2>{codeQuestion?.title}</H2>
            <ReactMarkdown source={codeQuestion?.content} />
          </article>
          <div id="code-area" style={{height: '600px', margin: '0 auto', maxWidth: 'var(--main-width)'}}>
            <CodeEditor ref={this.editorRef}
              darkTheme={darkTheme}
              dirs={dirs} depandencies={depandencies}
              code={codeQuestion?.code}
            />
          </div>
        </div>
        <Footer />
      </Fragment>
    )
  }
}

export default Code;