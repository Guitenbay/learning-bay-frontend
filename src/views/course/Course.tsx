import React, { Fragment } from 'react';
import { Button, H1, Icon } from '@blueprintjs/core';
import Axios from 'axios';
import { Link, RouteComponentProps } from 'react-router-dom';
import Footer from '../../components/Footer';
import { fusekiURL } from '../config';
import './Course.css';
import { Chapter, Lesson, Course } from '../model.d';
import { store } from '../state';

interface IState {
  title: string,
  chapterList: Array<Chapter>
}

class CoursePage extends React.Component<RouteComponentProps, IState> {
  private uri:string = '';
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      title: '',
      chapterList: []
    }
  }
  async getCourse(uri: string) {
    const resp = await Axios.get(fusekiURL+"/course", { params: { uri } });
    const { res, data } = resp.data;
    if (res) {
      return data as Course;
    } else {
      return {} as Course;
    }
  }
  async getChapterList(uri: string) {
    const resp = await Axios.get(fusekiURL+"/chapter/all/course", { params: { uri } });
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
    const resp = await Axios.get(fusekiURL+"/lesson/all/chapter", { params: { uri } });
    const { res, data } = resp.data;
    if (res) {
      return (data as Array<Lesson>).sort((prev, last) => prev.sequence - last.sequence);
    } else {
      return [];
    }
  }
  componentDidMount() {
    const { uri } = this.props.match.params as { uri: string };
    if (!!uri) {
      this.uri = Base64.decode(uri as string);
      this.getCourse(this.uri).then(course => {
        this.setState({ title: course.title });
        return this.getChapterList(this.uri);
      }).then(chapterList => {
        this.setState({ chapterList }, () => {
          // 设置第一章为打开状态
          this.handlerChapterClick(0)();
        });
      }).catch(err => console.error(err));
    }
  }
  handlerChapterClick = (index: number) => {
    return () => {
      const _chapterList = JSON.parse(JSON.stringify(this.state.chapterList));
      if (_chapterList.length <= 0) return;
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
    const { chapterList, title } = this.state;
    const { darkTheme } = store.getState();
    const renderLessonLi = (lessons: Array<Lesson>|undefined) => {
      if (typeof lessons === 'undefined' || lessons.length === 0) return (
        <blockquote>即将推出，敬请期待</blockquote>
      );
      const list = lessons.map(lesson => (
        <li key={lesson.uri}>
          <Link to={{ pathname: `/lesson/${Base64.encode(lesson.uri)}`, state: {courseUri: this.uri} }}>
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
      <div className="code-bg">
        <img 
          alt="a group of shapes"
          src="http://images.ctfassets.net/go6kr6r0ykrq/2advO7mIOd1SAJ3G3fffiA/ccf6c970a6c214576add0f87e85ea288/sortingquiz.svg" />
        <div className="img-mark" style={{backgroundColor: darkTheme ? 'var(--dark-bg-color)' : 'var(--light-bg-color)'}} />
      </div>
      <div className="Page code">
        <article>
          <H1 className="title-with-back">
            <Button minimal className="back"
              onClick={() => this.props.history.push("/")}
            ><Icon icon="arrow-left" iconSize={25} /></Button>
            { title }</H1>
          {chapterUl}
        </article>
      </div>
      <Footer />
    </Fragment>)
  }
}

export default CoursePage;