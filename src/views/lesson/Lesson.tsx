import React, { Fragment } from 'react';
import Footer from '../../components/Footer';
import { baseURL, fusekiURL } from '../config';
import VideoPlayer from '../../components/VideoPlayer';
import { store } from '../state';
import { parse } from 'query-string';
import { RouteComponentProps } from 'react-router-dom';
import { H3, H2, Button } from '@blueprintjs/core';
import ReactMarkdown from 'react-markdown';
import Axios from 'axios';

type Title = {
  title: string
}

type Section = {
  uri: string,
  title: string,
  sequence: number,
  content: string,
  codeQuestionUri: string,
  kElementUri: string
}

interface IState {
  sectionList: Array<Section>
}

class Lesson extends React.Component<RouteComponentProps, IState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      sectionList: []
    }
  }
  async getSectionList(uri: string) {
    const resp = await Axios.get(fusekiURL+"/section/all", { params: { uri } });
    const { res, data } = resp.data;
    if (res) {
      return (data as Array<Section>).sort((prev, last) => prev.sequence - last.sequence);
    } else {
      return [];
    }
  }
  componentDidMount() {
    const parsed = parse(this.props.location.search);
    const uri = Base64.decode(parsed.uri as string);
    this.getSectionList(uri).then(list => {
      this.setState({ sectionList: list });
    }).catch(err => console.error(err));
  }
  handleSectionClick = (codeQuestionUri: string) => {
    return () => {
      this.props.history.push('/code', { uri: codeQuestionUri });
    }
  }
  render() {
    const { darkTheme } = store.getState();
    const { sectionList } = this.state;
    const sections = sectionList.map(section => (
      <div key={section.uri}>
        <H3>{`${section.sequence}. ${section.title}`}</H3>
        {/* <p>{section.content}</p> */}
        <ReactMarkdown source={section.content} />
        <Button icon="hand" intent="success" text="试一试" onClick={this.handleSectionClick(section.codeQuestionUri)} />
      </div>
    ));
    return (<Fragment>
      <VideoPlayer
        darkTheme={darkTheme}
        videoURL={`${baseURL}/video/1.mmcv`}
        audioURL={`${baseURL}/audio/1.webm`}
      />
      <div className="Page home">
        <article>
          <H2>{ (this.props.location.state as Title).title }</H2>
          {sections}
        </article>
      </div>
      <Footer />
    </Fragment>)
  }
}

export default Lesson;