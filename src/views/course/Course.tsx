import React, { Fragment } from 'react';
import { parse } from 'query-string';
import { Button, H2 } from '@blueprintjs/core';
import Axios from 'axios';
import { Link, RouteComponentProps } from 'react-router-dom';
import Footer from '../../components/Footer';
import { fusekiURL } from '../config';
import './Course.css'
import { Chapter, Lesson } from '../model.d'

type Title = {
  title: string
}

interface IState {
  chapterList: Array<Chapter>
}

class Course extends React.Component<RouteComponentProps, IState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      chapterList: []
    }
  }
  async getChapterList(uri: string) {
    const resp = await Axios.get(fusekiURL+"/chapter/all", { params: { uri } });
    const { res, data } = resp.data;
    if (res) {
      data.forEach((v: any) => {
        v.show = false;
      })
      return (data as Array<Chapter>).sort((prev, last) => prev.sequence - last.sequence);
    } else {
      return [];
    }
  }
  async getLessonList(uri: string) {
    const resp = await Axios.get(fusekiURL+"/lesson/all", { params: { uri } });
    const { res, data } = resp.data;
    if (res) {
      return (data as Array<Lesson>).sort((prev, last) => prev.sequence - last.sequence);
    } else {
      return [];
    }
  }
  componentDidMount() {
    const search = this.props.location.search;
    if (typeof search === 'string') {
      const parsed = parse(search);
      if (!!parsed.uri) {
        const uri = Base64.decode(parsed.uri as string);
        this.getChapterList(uri).then(chapterList => {
          this.setState({ chapterList });
        }).catch(err => console.error(err));
      }
    }
  }
  handlerChapterClick = (index: number) => {
    return () => {
      const _chapterList = JSON.parse(JSON.stringify(this.state.chapterList));
      _chapterList[index].show = !_chapterList[index].show;
      if (Array.isArray(_chapterList[index].lessons)) {
        this.setState({ chapterList: _chapterList });
        return;
      }
      this.getLessonList(_chapterList[index].uri).then(list => {
        _chapterList[index].lessons = list;
        this.setState({ chapterList: _chapterList });
      }).catch(err => console.error(err));
    }
  }
  render() {
    const { chapterList } = this.state;
    const renderLessonLi = (lessons: Array<Lesson>|undefined) => {
      if (typeof lessons === 'undefined') return;
      const list = lessons.map(lesson => (
        <li key={lesson.uri}>
          <Link to={{ pathname: '/lesson', search: `?uri=${Base64.encode(lesson.uri)}`, state: {title: lesson.title, mediaUri: lesson.mediaUri} }}>
            {lesson.title}
          </Link>
        </li>
      ))
      return (<ul>
        {list}
      </ul>);
    }
    const chapterUl = chapterList.map((chapter, index) => (
      <div className="chapter-li" onClick={this.handlerChapterClick(index)} key={chapter.uri}>
        <div className="flex start">
          <Button icon={ chapter.show ? "caret-down"  : "caret-right"} minimal />
          <h3>{chapter.title}</h3>
        </div>
        {(chapter.show) ? renderLessonLi(chapter?.lessons): null}
      </div>
    ));
    return (<Fragment>
      <div className="Page home">
        <article>
          <H2>{ (this.props.location.state as Title)?.title }</H2>
          {chapterUl}
        </article>
      </div>
      <Footer />
    </Fragment>)
  }
}

export default Course;