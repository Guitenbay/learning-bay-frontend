import React from 'react';

type IProps = {
  title?: string
}

const Layout: React.FunctionComponent<IProps> = ({
  children,
  title = 'This is the default title',
}) => (
  <React.Fragment>
    <head>
      <title>{ title }</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="inital-scale=1.0, width=device-width" />
    </head>
    {/* <header>
      <nav>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/users">Users</Link>
        </li>
      </nav>
    </header> */}
    {children}
    <footer>
      <hr />
      <span>I'm here to stay (Footer)</span>
    </footer>
  </React.Fragment>
)

export default Layout