import React from 'react'

interface IProps {
  name: string,
  icon?: string
}

class SidebarEntry extends React.Component<IProps> {
  render() {
    let icon = undefined;
    if (typeof this.props.icon !== 'undefined') {
      icon = <i className={`icon ${this.props.icon}`}></i>
    }
    return (
      <div className="SidebarEntry Entry FileEntry">
        <div className="EntryHead head" draggable="true" data-sref="-10$2">
          { icon }
          <div className="name">{ this.props.name }</div>
        </div>
      </div>
    );
  }
}

export default SidebarEntry