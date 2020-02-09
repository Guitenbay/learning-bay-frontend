import React from 'react';

type IProps = {
  title?: string
}

const Layout: React.FunctionComponent<IProps> = ({
  children,
  title = 'This is the default title',
}) => (
  <React.Fragment>
    {children}
    <footer>
      <hr />
      <span>I'm here to stay (Footer)</span>
    </footer>
  </React.Fragment>
)

export default Layout