import React from 'react';
import ReactDOM from 'react-dom';
import Media from 'react-media';
import './index.css';
import App from './views/App';
// import * as serviceWorker from './serviceWorker';

ReactDOM.render(
// 媒体查询
<Media queries={{ small: '(max-width: 700px)' }}>
  {matches =>
    matches.small ? (
      <div id="device-error" className="flex vertical center">
        <p style={{textAlign: 'center'}}>屏幕宽度太小了，请更换设备或调大屏幕宽度</p>
      </div>
    ) : (
      <App id="app" />
    )
  }
</Media>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
