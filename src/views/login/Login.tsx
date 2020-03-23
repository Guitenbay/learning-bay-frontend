import React, { Fragment } from 'react';
import Footer from '../../components/Footer';
import { FormGroup, InputGroup, H2, Button, Tooltip, Intent } from '@blueprintjs/core';
import './Login.css';
import Axios from 'axios';
import { baseURL } from '../config';
import { RouteComponentProps, Link } from 'react-router-dom';
import { store, SET_USER } from '../state';
import { addErrorToast, addSuccessToast } from '../toaster';

interface IState {
  showPassword: boolean;
  username: string,
  usernameError: boolean,
  password: string,
  passwordError: boolean
}

class Login extends React.Component<RouteComponentProps, IState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      showPassword: false,
      username: "",
      usernameError: false,
      password: "",
      passwordError: false
    }
  }
  checkInput(username: string, password: string): boolean {
    let usernameError = username.length === 0,
        passwordError = password.length < 7;
    this.setState({ usernameError, passwordError });
    return !usernameError && !passwordError;
  }
  handleLockClick = () => {
    this.setState({ showPassword: !this.state.showPassword });
  }
  handleSubmit = () => {
    const { username, password } = this.state;
    if (!this.checkInput(username, password)) {
      addErrorToast("输入错误");
      return;
    }
    Axios.post(baseURL+"/login", 
      {username, password}, 
      { headers: {'Content-Type': 'application/json'}, withCredentials: true }
    ).then(resp => {
      const {res} = resp.data;
      if (res) {
        store.dispatch({ type: SET_USER, value: username });
        addSuccessToast("登录成功");
        this.props.history.push("/");
      } else {
        addErrorToast("登录失败");
      }
    }).catch(err => console.error(err));
  }
  render() {
    const { showPassword, username, password, usernameError, passwordError } = this.state;
    const lockButton = (
      <Tooltip content={`${showPassword ? "隐藏" : "显示"}密码`}>
        <Button
          icon={showPassword ? "eye-on" : "eye-off"}
          intent={Intent.WARNING}
          minimal={true}
          onClick={this.handleLockClick}
        />
      </Tooltip>
    );
    return (<Fragment>
      <div className="Page home">
        <article>
          <div className="input-card">
            <H2>Log in to LearningBay</H2>
            <FormGroup
              label="用户名"
              labelFor="name"
            >
                <InputGroup id="name" 
                  large intent={usernameError ? Intent.DANGER : Intent.NONE}
                  leftIcon="user"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    this.setState({username: event.target.value});
                  }}
                />
            </FormGroup>
            <FormGroup
              helperText="密码应该大于等于7位..."
              label="密码"
              labelFor="pwd"
            >
                <InputGroup
                    large intent={passwordError ? Intent.DANGER : Intent.NONE}
                    id="pwd"
                    placeholder="请输入密码"
                    leftIcon="lock"
                    rightElement={lockButton}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState({password: event.target.value});
                    }}
                />
            </FormGroup>
            <Button type="submit" large intent="primary" text="登录" fill
              onClick={this.handleSubmit}
            />
            <div style={{textAlign: "center"}}>
              <Link to="/signup">不是我们的成员？<strong>点此注册</strong></Link>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </Fragment>)
  }
}

export default Login;