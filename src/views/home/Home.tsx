import React, { Fragment } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import './Home.css';
import Footer from '../../components/Footer';
import { Card, Elevation, Button, H5, OL } from '@blueprintjs/core';
import Axios from 'axios';
import { fusekiURL } from '../config';
import { Course } from '../model.d'

interface IState {
  courseList: Array<Course>
}

class Home extends React.Component<RouteComponentProps, IState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      courseList: []
    }
  }
  async getCourseList(): Promise<any> {
    return Axios.get(fusekiURL+"/course/all");
  }
  componentDidMount() {
    this.getCourseList().then(resp => {
      const {res, data} = resp.data;
      if (res) {
        this.setState({ courseList: data === null ? [] : data });
      }
    }).catch(err => console.error(err));
  }
  render() {
    const { courseList } = this.state;
    const cards = courseList.map(course => (
      <Card interactive={true} elevation={Elevation.ONE} 
        key={course.uri}
        className="card"
        onClick={() => {this.props.history.push({pathname: `/course/${Base64.encode(course.uri)}`})}}>
        <H5><Link to={{pathname: `/course/${Base64.encode(course.uri)}`}}>
          {course.title.toUpperCase()}</Link>
        </H5>
        <p>章节：</p>
        <OL>
          { (course.firstChapter === undefined) ? null : (<li>{course.firstChapter}</li>) }
          { (course.secondChapter === undefined) ? null : (<li>{course.secondChapter}</li>) }
          { (course.thirdChapter === undefined) ? null : (<li>{course.thirdChapter}</li>) }
        </OL>
        <div style={{textAlign:'right'}}>
          <Button rightIcon="arrow-right" minimal>Go</Button>
        </div>
      </Card>
    ))
    return (
      <Fragment>
        <div className="Page home">
          <article>
            <div className="grid">
              {cards}
            </div>
            {/* <div><Link to="/play">Play</Link></div>
            <div><Link to="/record">Record</Link></div>
            <div><Link to="/code">Code</Link></div> */}
          </article>
        </div>
        <Footer />
      </Fragment>
    )
  }
}

export default Home;