import React from 'react';
import SidebarPanel from './SidebarPanel'
import { Directory, Depandency } from './sidebar.d'

interface IProps {
  title: string,
  dirs: Array<Directory>,
  depandencies: Array<Depandency>
} 

class Sidebar extends React.Component<IProps> {
  render() {
    return (
      <div className="main">
        <header className="header">
          <div className="title">{ this.props.title }</div>
          <div className="tool cog" data-icon="mcog"></div>
        </header>
        <SidebarPanel title="files" type="directory" entries={this.props.dirs} />
        <SidebarPanel title="depandencies" type="depandency" entries={this.props.depandencies} />
      </div>
    );
  }
}

export default Sidebar