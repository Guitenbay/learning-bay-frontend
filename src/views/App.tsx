import React, { FunctionComponent, useState } from 'react';
import { Router, Route, Switch, Redirect, NavLink } from 'react-router-dom';
import { Navbar, Alignment, Button, Classes, Menu, Popover } from '@blueprintjs/core';
import history from './history';
import Home from './home/Home';
import Video from './video/Video';
import Record from './record/Record';
import Code from './code/Code';
import { store, SET_THEME } from './state'

const App: FunctionComponent = () => {
  const [ dark, setDark ] = useState(false);
  return (
    <div className={ dark ? Classes.DARK : '' } style={{display: "flex", flexDirection: "column"}} >
      <Router history={history}>
        <header style={{flex: "none"}}>
          <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
              <Navbar.Heading>LearningBay</Navbar.Heading>
              <Button icon={ dark ? "flash" : "moon"} minimal onClick={() => { setDark(!dark); store.dispatch({ type: SET_THEME, value: !dark }) }} />
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
              <NavLink to="/" className="bp3-button bp3-minimal bp3-icon-home">首页</NavLink>
              <NavLink to="/play" className="bp3-button bp3-minimal bp3-icon-video">视频</NavLink>
              <NavLink to="/record" className="bp3-button bp3-minimal bp3-icon-mobile-video">录制</NavLink>
              <NavLink to="/about" className="bp3-button bp3-minimal bp3-icon-help">关于</NavLink>
              <Navbar.Divider />
              <Popover>
                <Button icon="user" minimal />
                <Menu>
                  <Menu.Item disabled style={{textAlign: "center"}} text="以 Guitenbay 身份登录" />
                  <Menu.Item icon="clipboard" href="/record" text="你的个人信息" />
                  <Menu.Item icon="layout" href="/h" text="你的学习状态" />
                  <Menu.Divider />
                  <Menu.Item text="登出" icon="log-out" />
                </Menu>
              </Popover>
              {/* <Popover>
                <Button icon="cog" minimal />
                <Menu>
                  <Menu.Item icon={ dark ? "flash" : "moon"} text={ dark ? "亮色模式" : "暗色模式" } onClick={() => { setDark(!dark) }} />
                </Menu>
              </Popover> */}
            </Navbar.Group>
          </Navbar>
        </header>
        {/* 按从上往下顺序匹配
            exact 表示精确匹配
        */}
        <main style={{flex: "auto"}}>
          <Switch>
            <Route exact path="/"><Home /></Route>
            <Route path="/play"><Video /></Route>
            <Route path="/record"><Record /></Route>
            <Route path="/code"><Code /></Route>
            <Route path="/error"><div>404 Oops...</div></Route>
            <Route path="*"><Redirect to="/error" /></Route>
          </Switch>
        </main>
      </Router>
    </div>
  )
};

export default App;
