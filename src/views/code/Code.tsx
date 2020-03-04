import React, { Fragment, RefObject, createRef } from 'react';
import Footer from '../../components/Footer';
import { store } from '../state';
import CodeEditor from '../../components/CodeEditor';
import { Directory, Depandency } from '../../components/sidebar.d';
import './Code.css'

const dirs: Array<Directory> = [{
  name: 'src',
  files: [
    { name: 'index.html', icon: 'html' },
    { name: 'index.js', icon: 'js' },
  ]
}]
const depandencies: Array<Depandency> = [
  { name: 'react' },
  { name: 'react-dom' },
]

class Code extends React.Component {
  private editorRef: RefObject<CodeEditor> = createRef<CodeEditor>();
  
  render() {
    const { darkTheme } = store.getState();
    return (
      <Fragment>
        <div className="Page">
          <article>
            something in here...
          </article>
          <div id="code-area" style={{height: '600px', margin: '0 auto', maxWidth: 'var(--main-width)'}}>
            <CodeEditor ref={this.editorRef}
              darkTheme={darkTheme}
              dirs={dirs} depandencies={depandencies}
            />
          </div>
        </div>
        <Footer />
      </Fragment>
    )
  }
}

export default Code;