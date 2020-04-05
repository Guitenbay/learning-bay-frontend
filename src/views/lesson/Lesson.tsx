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
import { Section } from '../model.d'

type LessonType = {
  title: string,
  mediaUri: string
}

interface IState {
  sectionList: Array<Section>,
  mediaFilename: string
}

class Lesson extends React.Component<RouteComponentProps, IState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      sectionList: [],
      mediaFilename: ''
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
        this.getSectionList(uri).then(list => {
          this.setState({ sectionList: list });
        }).catch(err => console.error(err));
      }
      const mediaUri = (this.props.location.state as LessonType).mediaUri;
      if (!!mediaUri) {
        this.getMediaMaterial(mediaUri).then(filename => {
          this.setState({ mediaFilename: filename });
        }).catch(err => console.error(err));
      }
    }
  }
  handleSectionClick = (codeQuestionUri: string) => {
    return () => {
      this.props.history.push('/code', { uri: codeQuestionUri });
    }
  }
  render() {
    const { darkTheme } = store.getState();
    const { sectionList, mediaFilename } = this.state;
    const sections = sectionList.map(section => (
      <div key={section.uri}>
        <H3>{`${section.sequence}. ${section.title}`}</H3>
        {/* <p>{section.content}</p> */}
        <ReactMarkdown source={section.content} />
        <Button icon="hand" intent="success" text="试一试" onClick={this.handleSectionClick(section.codeQuestionUri)} />
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
      <div className="Page home">
        <article>
          <H2>{ (this.props.location.state as LessonType).title }</H2>
          {sections}
        </article>
      </div>
      <Footer />
    </Fragment>)
  }
}

export default Lesson;