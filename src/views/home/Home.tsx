import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Footer from '../../components/Footer';

class Home extends React.Component {
  render() {
    return (
      <Fragment>
        <div className="Page home">
          <article>
            <div><Link to="/play">Play</Link></div>
            <div><Link to="/record">Record</Link></div>
            <div><Link to="/code">Code</Link></div>
          </article>
        </div>
        <Footer />
      </Fragment>
    )
  }
}

export default Home;