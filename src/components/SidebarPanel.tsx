import React from 'react';
import SidebarEntry from './SidebarEntry';
import { Directory, Depandency } from './sidebar.d'

interface IProps {
  title: string,
  type: 'directory' | 'depandency',
  entries: Array<Directory | Depandency>
} 

class SidebarPanel extends React.Component<IProps> {
  render() {
    let entries = null;
    if (this.props.type === 'directory') {
      entries = this.props.entries.map(dir => (
        <div className="SidebarEntry Entry DirEntry RootEntry main expanded">
          <div className="EntryHead head" draggable="true">
            <i className="icon folder toggler"></i>
            <div className="name">{dir.name}</div>
          </div>
          <div className="body l0">
            { (dir as Directory).files.map(({ name, icon }) => (
              <SidebarEntry name={name} icon={icon} />
            )) }
          </div>
        </div>
      ))
    } else {
      entries = <div className="SidebarEntry Entry DirEntry RootEntry main expanded">
        <div className="body l0">
          { this.props.entries.map(depandancy => (
            <SidebarEntry name={depandancy.name} />
          )) }
        </div>
      </div>
    }
    return (
      <div className="SidebarPanel">
        <header className="header">
          <div className="title">{ this.props.title }</div>
          <div className="tools">
            <div className="tool" data-icon="mcog"></div>
          </div>
        </header>
        { entries }
      </div>
    )
  }
}

export default SidebarPanel