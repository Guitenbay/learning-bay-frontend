import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { Divider } from '@blueprintjs/core';
import './Footer.css'

const Footer: FunctionComponent = () => (
  <footer style={{flex: "none"}}>
    <div>
      <Divider style={{marginLeft: "0", marginRight: "0"}} />
      <div className="grid bp3-text-disabled">
        <div style={{justifySelf: "start"}}>Built with<a href="/">React</a></div>
        <div style={{justifySelf: "center"}}>Creacted by<a href="https://github.com/Guitenbay">@Guitenbay</a></div>
        <div style={{justifySelf: "end"}}>
          <Link to="/">Home</Link>
          {/* <Link to="/play">Play</Link>
          <Link to="/record">Record</Link> */}
          <Link to="/about">About</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
