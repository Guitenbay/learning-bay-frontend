import React, { Fragment, RefObject, createRef } from 'react';
import Footer from '../../components/Footer';
import { store } from '../state';
import CodeEditor from '../../components/CodeEditor';
import { Directory, Depandency } from '../../components/sidebar.d';
import './Code.css'
import { RouteComponentProps, Link } from 'react-router-dom';
import { Axios, fusekiURL, baseURL } from '../config';
import { H2, Card, H5, Button, Icon } from '@blueprintjs/core';
import ReactMarkdown from 'react-markdown';
import { addErrorToast, addSuccessToast } from '../toaster';
import Slider from 'react-slick';
import CodeBlock from '../CodeBlock';
import '../../assets/markdown.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CodeQuestion, Lesson } from '../model';

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
    const resp = await Axios.get(baseURL+"/recommend", { params: { courseUri } });
    const { res, data } = resp.data;
    if (res) {
      return data;
    } else {
      addErrorToast("获取推荐数据失败");
      return [];
    }
  }
  async getReviewRecommend() {
    const courseUri = this.state.codeQuestion?.courseUri;
    const resp = await Axios.get(baseURL+"/recommend/review", { params: { courseUri } });
    const { res, data } = resp.data;
    if (res) {
      return data;
    } else {
      addErrorToast("获取推荐复习数据失败");
      return [];
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
      }
    }).then((lists: any) => {
      if (lists[0].length === 0 && lists[1].length === 0) {
        this.setState({ showNoneRecommend: true });
      }
      this.setState({ recommendList: lists[0], reviewList: lists[1] });
    }).catch(err => console.error(err));
  }
  createRecommendUI = (title: string, list: Array<Lesson>) => {
    if (list.length === 0) return null;
    return (<div>
      <h2 style={{textAlign: 'center'}}>{ title }</h2>
      <Slider {...this.settings} className="recommend-slider"
        slidesToShow={Math.min(4, list.length)}
        slidesToScroll={Math.min(4, list.length)}
      >
        { list.map(lesson => (
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
  render() {
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
            { this.createRecommendUI('经过分析您的学习状态，推荐您复习课时', reviewList) }
            { this.createRecommendUI('经过分析您的学习状态，推荐您接下来学习课时', recommendList) }
            { (showNoneRecommend)
              ? (<h2 style={{textAlign: 'center'}}>您的学习状态已达标，没有需要推荐学习的课时了</h2>) : null
            }
          </article>
        </div>
        <Footer />
      </Fragment>
    )
  }
}

export default Code;