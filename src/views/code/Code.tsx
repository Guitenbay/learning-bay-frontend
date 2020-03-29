import React, { Fragment, RefObject, createRef } from 'react';
import Footer from '../../components/Footer';
import { store } from '../state';
import CodeEditor from '../../components/CodeEditor';
import { Directory, Depandency } from '../../components/sidebar.d';
import './Code.css'
import { RouteComponentProps, Link } from 'react-router-dom';
import { Axios, fusekiURL, baseURL } from '../config';
import { H2, Card, H5, Button } from '@blueprintjs/core';
import ReactMarkdown from 'react-markdown';
import { addErrorToast, addSuccessToast } from '../toaster';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
type Lesson = { uri: string, title: string }
interface IState {
  codeQuestion: CodeQuestion | undefined,
  recommend: { review: boolean, list: Array<Lesson> } | undefined
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
      recommend: undefined
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
        this.setState({ recommend: { review: !data.result, list: data.list } });
        if (data.result) {
          addSuccessToast('代码正确')
        } else {
          addErrorToast('代码与要求不符')
        }
      } else {
        addErrorToast(data);
      }
    }).catch(err => console.error(err));
  }
  render() {
    const { darkTheme } = store.getState();
    const { codeQuestion, recommend } = this.state;
    let recommendUI = null;
    if (typeof recommend !== 'undefined' && recommend.list.length > 0) {
      recommendUI = (<div>
        <h2 style={{textAlign: 'center'}}>{ (recommend.review) ? '经过分析您的学习状态，推荐您复习' : '经过分析您的学习状态，推荐您学习' }</h2>
        <Slider {...this.settings} className="recommend-slider"
          slidesToShow={Math.min(4, recommend.list.length)}
          slidesToScroll={Math.min(4, recommend.list.length)}
        >
          { recommend.list.map(lesson => (
              <Card key={lesson.uri} className="recommend-card"
                onClick={() => { this.props.history.push({ pathname: '/lesson', search: `?uri=${Base64.encode(lesson.uri)}`, state: {title: lesson.title} }) }}>
                <H5><Link to={{pathname: '/lesson', search: `?uri=${Base64.encode(lesson.uri)}`, state: {title: lesson.title}}}>
                  {lesson.title.toUpperCase()}</Link>
                </H5>
                <div style={{textAlign: 'right', marginTop: '55px'}}>
                  <Button style={{position: 'relative', bottom: '-10px', right: '-10px'}} rightIcon="arrow-right" minimal>Go</Button>
                </div>
              </Card>
            )) }
        </Slider>
      </div>)
    }
    return (
      <Fragment>
        <div className="Page">
          <article>
            <H2>{codeQuestion?.title}</H2>
            <ReactMarkdown source={codeQuestion?.content} />
          </article>
          <div id="code-area" style={{height: '600px', margin: '50px auto', maxWidth: 'var(--main-width)'}}>
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
          <article>
            { recommendUI }
            {/* <Slider {...this.settings}
              slidesToShow={4}
              slidesToScroll={4}
            >
              <div className="recommend-card"><h3>1</h3></div>
              <div className="recommend-card"><h3>1</h3></div>
              <div className="recommend-card"><h3>1</h3></div>
              <div className="recommend-card"><h3>1</h3></div>
              <div className="recommend-card"><h3>1</h3></div>
              <div className="recommend-card"><h3>1</h3></div>
            </Slider> */}
          </article>
        </div>
        <Footer />
      </Fragment>
    )
  }
}

export default Code;