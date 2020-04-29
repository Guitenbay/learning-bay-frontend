import React, { Fragment } from 'react';
import Slider from 'react-slick';
import { Lesson } from '../views/model';
import { Card, H5, Button } from '@blueprintjs/core';
import { Link } from 'react-router-dom';
import * as H from 'history';
import './Recommend.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface IProps {
  history: H.History,
  reviewList: Lesson[],
  recommendList: Lesson[],
  showNoneRecommend: boolean,
  courseUri: string
}

class Recommend extends React.Component<IProps> {
  private settings = {
    dots: true,
    infinite: true,
    speed: 500
  };
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
              onClick={() => { this.props.history.push({ pathname: `/lesson/${Base64.encode(lesson.uri)}`, search: `course_uri=${this.props.courseUri}` }) }}>
              <H5><Link to={{ pathname: `/lesson/${Base64.encode(lesson.uri)}`, search: `course_uri=${this.props.courseUri}` }}>
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
    const { reviewList, recommendList, showNoneRecommend } = this.props;
    return (
      <Fragment>
        { this.createRecommendUI('经过分析您的学习状态，推荐您复习课时', reviewList) }
        { this.createRecommendUI('经过分析您的学习状态，推荐您接下来学习课时', recommendList) }
        { (showNoneRecommend)
          ? (<h2 style={{textAlign: 'center'}}>您的学习状态已达标，没有需要推荐学习的课时了</h2>) : null
        }
      </Fragment>
    )
  }

}

export default Recommend;