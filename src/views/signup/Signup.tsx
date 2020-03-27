import React, { Fragment } from 'react';
import { FormGroup, InputGroup, H2, Button, Tooltip, Intent } from '@blueprintjs/core';
import Axios from 'axios';
import shortId from 'shortid';
import Footer from '../../components/Footer';
import { fusekiURL } from '../config';
import { RouteComponentProps } from 'react-router-dom';
import './Signup.css';
import signupImg from '../../assets/signup-img.jpg';
import { addErrorToast, addSuccessToast } from '../toaster';

interface IState {
  showPassword: boolean;
  username: string,
  usernameError: boolean,
  password: string,
  passwordError: boolean
}

class Signup extends React.Component<RouteComponentProps, IState> {
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
    Axios.put(fusekiURL+"/user", 
      {id: shortId.generate(),username, password}, 
      { headers: {'Content-Type': 'application/json'} }
    ).then(resp => {
      const {res} = resp.data;
      if (res) {
        addSuccessToast("注册成功");
        this.props.history.push("/login");
      } else {
        addErrorToast("注册失败");
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
        <article className="flex evenly">
          <img src={signupImg} alt="golden gate bridge san francisco california"
            style={{height: '600px',width: '640px', alignSelf: 'center'}}
          />
          <div className="input-card">
            <H2>Get Start to LearningBay</H2>
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
                <InputGroup id="pwd"
                    large intent={passwordError ? Intent.DANGER : Intent.NONE}
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
            <Button type="submit" large intent="primary" text="注册" fill
              onClick={this.handleSubmit}
            />
          </div>
        </article>
      </div>
      <Footer />
    </Fragment>)
  }
}

export default Signup;