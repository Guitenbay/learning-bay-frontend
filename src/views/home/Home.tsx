import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

class Home extends React.Component {
  render() {
    return (
      <Fragment>
        <div><Link to="/play">Play</Link></div>
        <div><Link to="/record">Record</Link></div>
        <div><Link to="/code">Code</Link></div>
      </Fragment>
    )
  }
}

export default Home;