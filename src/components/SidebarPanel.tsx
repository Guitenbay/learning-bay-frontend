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
    // foreach 列表
    if (this.props.type === 'directory') {
      entries = this.props.entries.map((dir, index) => (
        <div className="SidebarEntry Entry DirEntry RootEntry main expanded" key={dir.name+'-'+index}>
          <div className="EntryHead head" draggable="true">
            <i className="icon folder toggler"></i>
            <div className="name" id={ `Panel-dir-${dir.name}` }>{dir.name}</div>
          </div>
          <div className="body l0">
            { (dir as Directory).files.map(({ name, icon }, index) => (
              <SidebarEntry index={index} name={name} icon={icon} key={name+'-'+index} />
            )) }
          </div>
        </div>
      ))
    } else {
      entries = <div className="SidebarEntry Entry DirEntry RootEntry main expanded">
        <div className="body l0">
          { this.props.entries.map((depandancy, index) => (
            <SidebarEntry index={index} name={depandancy.name} key={depandancy.name+'-'+index} />
          )) }
        </div>
      </div>
    }
    return (
      <div className="SidebarPanel">
        <header className="header">
          <div className="title" id={ `Panel-${this.props.title}` }>{ this.props.title }</div>
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