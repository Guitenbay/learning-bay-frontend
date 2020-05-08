import React from 'react';
import { Router, Route, Switch, Redirect, NavLink } from 'react-router-dom';
import { Navbar, Button, Classes, Menu, Popover, Toaster } from '@blueprintjs/core';
import history from './history';
import loadable from '@loadable/component';
import { store, SET_THEME, IStoreState, SET_USER } from './state'
import Axios from 'axios';
import { baseURL } from './config';
import { toastRef, addSuccessToast } from './toaster';

const loadComponent = (path: string) => loadable(() => import(`${path}`), {
  fallback: <div style={{
    position: 'relative', top: '45%', transform: 'translateY(-50%)',
    textAlign: 'center', fontSize: '20pt'
  }}>Loading...</div>,
});
const Home      = loadComponent('./home/Home');
// const Video     = loadComponent('./video/Video');
const Record    = loadComponent('./record/Record');
const Course    = loadComponent('./course/Course');
const Lesson    = loadComponent('./lesson/Lesson');
const Login     = loadComponent('./login/Login');
const Signup    = loadComponent('./signup/Signup');
const Code      = loadComponent('./code/Code');
const UserState = loadComponent('./user-state/UserState');
const About     = loadComponent('./about/About');
const ErrorPage = loadComponent('./error/Error');

interface IAPPProps {
  id: string,
}

interface IAPPState {
  dark: boolean,
  username: string
}

class App extends React.Component<IAPPProps, IAPPState> {
  constructor(props: IAPPProps) {
    super(props);
    this.state = {
      dark: false,
      username: ""
    }
  }
  componentDidMount(){
    Axios.get(baseURL+"/session", {withCredentials: true}).then(resp => {
      const { res, data } = resp.data;
      if (res) {
        store.dispatch({ type: SET_USER, value: data });
      }
    }).catch(err => console.error(err));
    // watch
    store.subscribe(() => {
      const storeState: IStoreState = store.getState();
      this.setState({ dark: storeState.darkTheme, username: storeState.username });
    })
  }
  handleSetDarkTheme = () => {
    store.dispatch({ type: SET_THEME })
  }
  handleLogout = () => {
    Axios.delete(baseURL+"/session", {withCredentials:true}).then(resp => {
      const { res } = resp.data;
      if (res) {
        addSuccessToast("登出成功");
        store.dispatch({ type: SET_USER, value: "" });
      }
    }).catch(err => console.error(err))
  }
  render() {
    const { id } = this.props;
    const { dark, username } = this.state;
    return (
      <div id={id} className={ dark ? Classes.DARK : '' } style={{display: "flex", flexDirection: "column"}} >
        <Toaster position="bottom-right"
          ref={toastRef} />
        <Router history={history}>
          <header style={{flex: "none", zIndex: 660}}>
            <Navbar className="flex center" style={{position: "fixed", top: "0"}}>
              <Navbar.Group style={{marginLeft: 'auto', width: '120px'}}>
                <Navbar.Heading>LearningBay</Navbar.Heading>
              </Navbar.Group>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: 'var(--main-width)'}}>
                <Navbar.Group>
                  <Button icon={ dark ? "flash" : "moon"} minimal onClick={this.handleSetDarkTheme} />
                </Navbar.Group>
                <Navbar.Group style={{justifySelf: 'end'}}>
                  <NavLink to="/" className="bp3-button bp3-minimal bp3-icon-home">首页</NavLink>
                  {/* <NavLink to="/play" className="bp3-button bp3-minimal bp3-icon-video">视频</NavLink>
                  <NavLink to="/record" className="bp3-button bp3-minimal bp3-icon-mobile-video">录制</NavLink> */}
                  <NavLink to="/about" className="bp3-button bp3-minimal bp3-icon-help">关于</NavLink>
                </Navbar.Group>
              </div>
              <Navbar.Group style={{marginRight: 'auto', width: '120px'}}>
                <Navbar.Divider />
                {
                  (username === '')
                  ? (<Button icon="log-in" minimal 
                      onClick={() => history.push("/login")}
                    />)
                  : (<Popover>
                    <Button icon="user" minimal />
                    <Menu>
                      <Menu.Item disabled style={{textAlign: "center"}} text={`以 ${username} 身份登录`} />
                      {/* <Menu.Item icon="clipboard" href="/record" text="你的个人信息" /> */}
                      <Menu.Item icon="layout" href="/user-state" text="你的学习状态" />
                      <Menu.Divider />
                      <Menu.Item text="登出" icon="log-out" onClick={this.handleLogout} />
                    </Menu>
                  </Popover>)
                }
                <Button icon="caret-left" minimal disabled style={{cursor: 'auto'}} />
              </Navbar.Group>
            </Navbar>
          </header>
          {/* 按从上往下顺序匹配
              exact 表示精确匹配
          */}
          <main style={{flex: "auto", paddingTop: "50px", height: "100%", width: "100%"}}>
            <Switch>
              <Route exact path="/" component={ Home } />
              <Route path="/login" component={ Login } />
              <Route path="/signup" component={ Signup } />
              {/* <Route path="/play"><Video /></Route> */}
              <Route path="/record"><Record /></Route>
              <Route path="/course/:uri" component={ Course } />
              <Route path="/lesson/:uri" component={ Lesson } />
              <Route path="/code/:uri" component={ Code } />
              <Route path="/user-state" component={ UserState } />
              <Route path="/about" component={ About } />
              <Route path="/error" component={ ErrorPage } />
              <Route path="*"><Redirect to="/error" /></Route>
            </Switch>
          </main>
        </Router>
      </div>
    )
  }
};

export default App;
