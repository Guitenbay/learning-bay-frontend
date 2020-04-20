import React, { Fragment, RefObject, createRef } from 'react';
import Footer from '../../components/Footer';
import { store, SET_USER } from '../state';
import CodeEditor from '../../components/CodeEditor';
import { Directory, Depandency } from '../../components/sidebar.d';
import './Code.css'
import { RouteComponentProps } from 'react-router-dom';
import { Axios, fusekiURL, baseURL } from '../config';
import { H2, Button, Icon } from '@blueprintjs/core';
import ReactMarkdown from 'react-markdown';
import { addErrorToast, addSuccessToast } from '../toaster';
import CodeBlock from '../CodeBlock';
import '../../assets/markdown.css'
import { CodeQuestion, Lesson } from '../model';
import Recommend from '../../components/Recommend';

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
interface IState {
  codeQuestion: CodeQuestion | undefined,
  recommendList: Array<Lesson>,
  reviewList: Array<Lesson>,
  showNoneRecommend: boolean
}

class Code extends React.Component<RouteComponentProps, IState> {
  private editorRef: RefObject<CodeEditor> = createRef<CodeEditor>();
  private settings = {
    dots: true,
    infinite: true,
    speed: 500
  };
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      codeQuestion: undefined,
      recommendList: [],
      reviewList: [],
      showNoneRecommend: false
    }
  }
  async getCodeQuestion(uri: string) {
    const resp = await Axios.get(fusekiURL+"/code-question", { params: { uri } });
    const { res, data } = resp.data;
    if (res) {
      return data;
    } else {
      return undefined;
    }
  }
  async getRecommend() {
    const courseUri = this.state.codeQuestion?.courseUri;
    const resp = await Axios.get(baseURL+"/recommend", { params: { courseUri }, withCredentials: true });
    const { res, data } = resp.data;
    if (res) {
      return data;
    } else {
      addErrorToast("获取推荐数据失败");
      return null;
    }
  }
  async getReviewRecommend() {
    const courseUri = this.state.codeQuestion?.courseUri;
    const resp = await Axios.get(baseURL+"/recommend/review", { params: { courseUri }, withCredentials: true });
    const { res, data } = resp.data;
    if (res) {
      return data;
    } else {
      addErrorToast("获取推荐复习数据失败");
      return null;
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
      { code, testFilename: this.state.codeQuestion?.testSetFilename }, 
      { headers: { 'Context-Type': 'application/json' }, withCredentials: true }
    ).then(resp => {
      const { res, data } = resp.data;
      if (res) {
        if (data.result) {
          addSuccessToast('代码正确')
        } else {
          addErrorToast('代码与要求不符')
        }
        return Promise.all([this.getRecommend(), this.getReviewRecommend()]);
      } else {
        addErrorToast(data);
        if (data === '未登录，无法解锁此功能') {
          store.dispatch({ type: SET_USER, value: "" });
        }
      }
    }).then((lists: any) => {
      if (lists === undefined) return;
      if (lists[0] === null || lists[1] === null) {
        // do nothing
      } else {
        if (lists[0].length === 0 && lists[1].length === 0) {
          this.setState({ showNoneRecommend: true });
        }
        this.setState({ recommendList: lists[0], reviewList: lists[1] });
      }
    }).catch(err => console.error(err));
  }
  render() {
    if (this.props.location.state === undefined) {
      this.props.history.push('/');
      return null;
    }
    const { darkTheme } = store.getState();
    const { codeQuestion, recommendList, reviewList, showNoneRecommend } = this.state;
    return (
      <Fragment>
        <div className="Page">
          { (typeof codeQuestion !== 'undefined')
              // defaultCode 要设置，必须是第一次创建时设置，当组件更新时不会重新设置
              ? (<Fragment>
                  <article>
                    <H2 className="title-with-back">
                      <Button minimal className="back"
                        onClick={() => this.props.history.goBack()}
                      ><Icon icon="arrow-left" iconSize={25} /></Button>
                      { codeQuestion?.title }</H2>
                    <ReactMarkdown source={Base64.decode(codeQuestion?.content as string)} className="markdown-body question"
                      renderers={{ code: CodeBlock }}
                    />
                  </article>
                  <div id="code-area" style={{height: '600px', margin: '50px auto', maxWidth: 'var(--main-width)'}}>
                    <CodeEditor ref={this.editorRef}
                      darkTheme={darkTheme}
                      dirs={dirs} depandencies={depandencies}
                      defaultCode={Base64.decode(codeQuestion?.code || '')}
                      onRunCode={this.handleRunCode}
                    />
                  </div>
                </Fragment>)
              : null
          }
          <article>
            <Recommend history={this.props.history} 
              reviewList={reviewList} 
              recommendList={recommendList}
              showNoneRecommend={showNoneRecommend}
              courseUri={(this.props.location.state as {courseUri: string}).courseUri}
              />
          </article>
        </div>
        <Footer />
      </Fragment>
    )
  }
}

export default Code;