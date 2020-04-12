import React, { Fragment } from 'react';
import Footer from '../../components/Footer';
import { baseURL, fusekiURL } from '../config';
import VideoPlayer from '../../components/VideoPlayer';
import { store, SET_USER } from '../state';
import { parse } from 'query-string';
import { RouteComponentProps } from 'react-router-dom';
import { H1, Button, Icon, H2, Intent } from '@blueprintjs/core';
import Axios from 'axios';
import { Section, Lesson } from '../model.d';
import ReactMarkdown from 'react-markdown';
import '../../assets/markdown.css'
import CodeBlock from '../CodeBlock';
import './Lesson.css'
import { addSuccessToast, addErrorToast } from '../toaster';
import Recommend from '../../components/Recommend';

interface IState {
  sectionList: Array<Section>,
  mediaFilename: string,
  title: string,
  codeQuestionUri: string,
  recommendList: Array<Lesson>,
  reviewList: Array<Lesson>,
  showNoneRecommend: boolean
  skeleton: boolean
}

class LessonPage extends React.Component<RouteComponentProps, IState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      sectionList: [],
      mediaFilename: '',
      title: '',
      codeQuestionUri: '',
      recommendList: [],
      reviewList: [],
      showNoneRecommend: false,
      skeleton: true
    }
  }
  async getLesson(uri: string) {
    const resp = await Axios.get(fusekiURL+"/lesson", { params: { uri } });
    const { res, data } = resp.data;
    if (res) {
      return data;
    } else {
      return undefined;
    }
  }
  async getSectionList(uri: string) {
    const resp = await Axios.get(fusekiURL+"/section/all/lesson", { params: { uri } });
    const { res, data } = resp.data;
    if (res) {
      return (data as Array<Section>).sort((prev, last) => prev.sequence - last.sequence);
    } else {
      return [];
    }
  }
  async getMediaMaterial(uri: string) {
    const resp = await Axios.get(fusekiURL+"/media-material", { params: { uri } });
    const { res, data } = resp.data;
    if (res) {
      return data?.filename;
    } else {
      return '';
    }
  }
  async getRecommend() {
    const { courseUri } = this.props.location.state as { courseUri: string };
    if (courseUri === '') return [];
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
    const { courseUri } = this.props.location.state as { courseUri: string };
    if (courseUri === '') return [];
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
    const search = this.props.location.search;
    if (typeof search === 'string') {
      const parsed = parse(search);
      if (!!parsed.uri) {
        const uri = Base64.decode(parsed.uri as string);
        this.getLesson(uri).then(lesson => {
          if (!!lesson) {
            this.setState({ 
              title: (lesson as Lesson).title,
              codeQuestionUri: (lesson as Lesson).codeQuestionUri });
          }
          return (lesson as Lesson).mediaUri;
        }).then(mediaUri => {
          if (!!mediaUri && mediaUri !== 'null') {
            return this.getMediaMaterial(mediaUri)
          }
        }).then(filename => {
          if (!!filename) {
            this.setState({ mediaFilename: filename });
          }
        }).catch(err => console.error(err));
        this.getSectionList(uri).then(list => {
          this.setState({ sectionList: list });
        }).catch(err => console.error(err));
      }
    }
    setTimeout(() => this.setState({skeleton: false}), 800);
  }
  // 打卡
  handlePunchInClick = (codeQuestionUri: string = '') => {
    const knowledgeStates = this.state.sectionList.map(({ kElementUri }) => ({ uri: kElementUri, state: 1 }));
    Axios.post(baseURL+"/user/punch-in", { knowledgeStates }, {withCredentials: true}).then(resp => {
      const { res, data } = resp.data;
      if (res) {
        addSuccessToast(`打卡成功！${data || ''}`);
        if (codeQuestionUri !== '') {
          this.props.history.push('/code', { uri: codeQuestionUri });
        } else {
          // 获取推荐课时
          return Promise.all([this.getRecommend(), this.getReviewRecommend()]);
        }
      } else {
        addErrorToast(`打卡失败…${data || ''}`);
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
    const { darkTheme } = store.getState();
    const { sectionList, mediaFilename, title, codeQuestionUri, skeleton,
      reviewList, recommendList, showNoneRecommend
    } = this.state;
    const { courseUri } = this.props.location.state as { courseUri: string };
    const sections = sectionList.map(section => (
      <div key={section.uri} className="section">
        {/* eslint-disable-next-line */}
        <H2 className={skeleton ? "bp3-skeleton": ""}><a href="#">¶</a>{`${section.title}`}</H2>
        {/* <p>{section.content}</p> */}
        <ReactMarkdown source={Base64.decode(section.content)}
          className={skeleton ? "bp3-skeleton markdown-body": "markdown-body"}
          renderers={{ code: CodeBlock }}
        />
        {/* <Button icon="hand" intent="success" text="试一试" onClick={this.handleCodeQuestionClick(section.codeQuestionUri)} /> */}
      </div>
    ));
    return (<Fragment>
      { (mediaFilename !== '') 
        ? (<VideoPlayer
          darkTheme={darkTheme}
          videoURL={`${baseURL}/video/${mediaFilename}.mmcv`}
          audioURL={`${baseURL}/audio/${mediaFilename}.webm`}
        />)
        : null
      }
      <div className="Page lesson">
        <article>
          <H1 className={ skeleton ? "title-with-back bp3-skeleton" : "title-with-back"}>
            <Button minimal className="back"
              onClick={() => this.props.history.push(`/course?uri=${Base64.encode(courseUri)}`)}
            ><Icon icon="arrow-left" iconSize={25} /></Button>
            { title }</H1>
          {sections}
          {
            (!codeQuestionUri || !codeQuestionUri.startsWith('http://biki.wiki/learning-bay')) 
            ? (<Button
                className={skeleton ? "bp3-skeleton": ""}
                intent={Intent.SUCCESS}
                icon="confirm"
                onClick={() => this.handlePunchInClick()}
              >学完打卡</Button>)
            : (<Button
                className={skeleton ? "bp3-skeleton": ""}
                intent={Intent.PRIMARY}
                icon="confirm"
                onClick={() => this.handlePunchInClick(codeQuestionUri)}
              >学完打卡并测试</Button>)
          }
        </article>
        <article>
          <Recommend history={this.props.history} 
            reviewList={reviewList} 
            recommendList={recommendList}
            showNoneRecommend={showNoneRecommend}
            />
        </article>
      </div>
      <Footer />
    </Fragment>)
  }
}

export default LessonPage;