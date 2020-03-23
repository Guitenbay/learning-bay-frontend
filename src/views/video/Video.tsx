import React, { Fragment } from 'react';
import { baseURL } from '../config';
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
          videoURL={`${baseURL}/video/1.mmcv`}
          audioURL={`${baseURL}/audio/1.webm`}
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
