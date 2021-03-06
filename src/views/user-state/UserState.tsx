import React, { Fragment, RefObject, createRef } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Popover, Position, Button, Menu, ButtonGroup, Icon } from '@blueprintjs/core';
import G6, { Graph } from '@antv/g6';
import { Axios, fusekiURL, baseURL } from '../config';
import { store } from '../state';
import { firstUpperCase } from '../../utils/methods';
import Footer from '../../components/Footer';
import { addErrorToast } from '../toaster';
import './UserState.css';

type Course = {
  uri: string,
  title: string,
  firstChapter?: string,
  secondChapter?: string,
  thirdChapter?: string,
}
type G6Node = {
  id: string,
  label: string,
  cluster: string,
  style?: any
}
type G6Edge = {
  sourse: string,
  target: string
}
interface IState {
  courseList: Array<{uri: string, title: string}>,
  currentCourseIndex: number,
  currentGravityIndex: number
}
const gravityList = [ 80, 50, 20, 10, 5, 3, 1, 0 ]
class UserState extends React.Component<RouteComponentProps, IState> {
  private containerRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
  private graph: Graph | undefined = undefined;
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      courseList: [],
      currentCourseIndex: 0,
      currentGravityIndex: 4
    }
  }
  async getAllCourse() {
    const resp = await Axios.get(fusekiURL+"/course/all");
    const { res, data } = resp.data;
    if (res) {
      return data.map(({uri, title}: Course) => ({uri, title}));
    } else {
      return [];
    }
  }
  async getKnowledgeState(courseUri: string) {
    const resp = await Axios.get(baseURL+"/user/knowledge/graph", { params: { courseUri }, withCredentials: true });
    const { res, data } = resp.data;
    if (res) {
      return data;
    } else {
      return null;
    }
  }
  componentDidMount() {
    this.getAllCourse().then(courseList => {
      this.setState({ courseList });
      return this.getKnowledgeState(courseList[this.state.currentCourseIndex].uri);
    }).then(data => {
      if (data !== null) {
        // this.setState({ nodes: data.nodes, edges: data.edges });
        this.renderGraph(data.nodes, data.edges);
      } else {
        addErrorToast('获取数据失败');
      }
    }).catch(err => console.error(err));

    const graphDiv = this.containerRef.current as HTMLDivElement;
    const width = graphDiv.scrollWidth;
    const height = graphDiv.scrollHeight || 700;
    this.graph = new G6.Graph({
      container: graphDiv,
      width,
      height,
      modes: {
        default: ['drag-canvas', 'drag-node'],
      },
      layout: {
        type: 'fruchterman',
        gravity: gravityList[this.state.currentGravityIndex],
        speed: 5
      },
      animate: true,
      defaultNode: {
        // type: 'rect',
        size: 70,
        // size: [130, 40],
        style: {
          lineWidth: 8,
        },
      },
      defaultEdge: {
        size: 1,
        color: '#e0e0e0',
        style: {
          endArrow: {
            path: 'M 0,0 L -8,4 L -8,-4 Z'
          },
          fill: '#e0e0e0'
        },
      },
      renderer: 'svg'
    });
  }
  componentDidUpdate(prevProps: RouteComponentProps, prevState: IState) {
    const { currentCourseIndex, courseList } = this.state; 
    if (currentCourseIndex !== prevState.currentCourseIndex) {
      this.getKnowledgeState(courseList[this.state.currentCourseIndex].uri).then(data => {
        if (data !== null) {
          // this.setState({ nodes: data.nodes, edges: data.edges });
          this.renderGraph(data.nodes, data.edges);
        } else {
          addErrorToast('获取数据失败');
        }
      }).catch(err => console.error(err));
    }
  }
  renderGraph = (nodes: Array<G6Node>, edges: Array<G6Edge>) => {
    nodes.forEach(node => {
      // node.label = node.label.slice(0, 7) + '...';
      if (!node.style) {
        node.style = {};
      }
      switch (node.cluster) {
        case 'grasp:1': 
          node.style.fill = '#BDD2FD';
          node.style.stroke = '#5B8FF9';
        break;
        case 'grasp:2':
          node.style.fill = '#fddfbd';
          node.style.stroke = '#f98b5b';
          break;
        case 'grasp:3':
          node.style.fill = '#c4ffd5';
          node.style.stroke = '#54ef9d';
          break;
        case 'none': 
          node.style.fill = '#c2c8d5';
          node.style.stroke = '#5D7092';
        break;
        default: break;
      }
    });
    this.graph?.data({nodes, edges});
    this.graph?.render();
  }
  render() {
    const { username } = store.getState();
    const { courseList, currentCourseIndex, currentGravityIndex } = this.state;
    const menuItemUI = courseList.map(({title}, index) => (
      <Menu.Item key={index} onClick={() => this.setState({currentCourseIndex: index})} icon="book" text={title.toUpperCase()} />
    ))
    return (<Fragment>
      <div className="Page user-state">
        <article>
          <h1 className="title-with-back">
            <Button minimal className="back"
              onClick={() => this.props.history.go(-1)}
            ><Icon icon="arrow-left" iconSize={25} /></Button>
            {firstUpperCase(username)+' 的学习状态'}</h1>
          <Popover position={Position.BOTTOM}>
            <Button icon="graph" text={`in ${courseList[currentCourseIndex]?.title.toUpperCase()}`} />
            <Menu>
              {menuItemUI}
            </Menu>
          </Popover>
          <div style={{marginTop: '15px'}}>
            <strong>说明：</strong>
            <ol style={{marginTop: '1px'}}>
              <li>灰色表示<i><strong>未学会或未学习</strong></i> 的知识点（末尾带数字 0 或不带数字）</li>
              <li>蓝色表示<i><strong>已理解</strong></i> 的知识点（末尾带数字 1）</li>
              <li>橙色表示<i><strong>状态存疑</strong></i> 的知识点（末尾带数字 2）</li>
              <li>绿色表示<i><strong>已掌握</strong></i> 的知识点（末尾带数字 3）</li>
            </ol>
          </div>
          <div style={{marginTop: '20px'}}>
          <ButtonGroup minimal={true}>
            <Button icon="zoom-in" onClick={() => {
              const current = Math.min(gravityList.length-1, currentGravityIndex + 1);
              this.setState({currentGravityIndex: current});
              this.graph?.updateLayout({ gravity: gravityList[current] });
            }}>放大</Button>
            <Button icon="zoom-out" onClick={() => {
              const current = Math.max(0, currentGravityIndex - 1);
              this.setState({currentGravityIndex: current});
              this.graph?.updateLayout({ gravity: gravityList[current] });
            }}>缩小</Button>
          </ButtonGroup>
          </div>
          <div id="container" ref={this.containerRef}></div>
        </article>
      </div>
      <Footer />
    </Fragment>)
  }
}

export default UserState;