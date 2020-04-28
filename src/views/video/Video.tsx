import React, { Fragment } from 'react';
import { aliyunOSSURL } from '../config';
import Footer from '../../components/Footer';
import { store } from '../state';
import VideoPlayer from '../../components/VideoPlayer';

class Video extends React.Component {
  render() {
    const { darkTheme } = store.getState();
    return (
      <Fragment>
        <VideoPlayer
          darkTheme={darkTheme}
          videoURL={`${aliyunOSSURL}/videos/1`}
          audioURL={`${aliyunOSSURL}/audios/1`}
        />
        <div className="Page">
          <article>
            something in here...
          </article>
        </div>
        <Footer />
      </Fragment>
    );
  }
}

export default Video;
