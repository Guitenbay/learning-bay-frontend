import React, { Fragment } from 'react';
import Footer from '../../components/Footer';
import { baseURL, fusekiURL } from '../config';
import VideoPlayer from '../../components/VideoPlayer';
import { store } from '../state';
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

interface IState {
  sectionList: Array<Section>,
  mediaFilename: string,
  title: string,
  codeQuestionUri: string,
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
        }
      } else {
        addErrorToast(`打卡失败…${data || ''}`);
      }
    });
  }
  render() {
    const { darkTheme } = store.getState();
    const { sectionList, mediaFilename, title, codeQuestionUri, skeleton } = this.state;
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
              onClick={() => this.props.history.go(-1)}
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
      </div>
      <Footer />
    </Fragment>)
  }
}

export default LessonPage;