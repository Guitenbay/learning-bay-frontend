import React, { Fragment } from 'react'
import Footer from '../../components/Footer';
import QRCodeBlock from '../../components/QRCodeBlock';

const About = () => (<Fragment>
  <div className="Page about">
    <article style={{fontSize: '12pt', letterSpacing: '1px'}}>
      <h1 style={{fontSize: '27pt'}}>LearningBay 编程学习平台</h1>
      <p>我们旨在设计一种编程学习平台。</p>
      <p>
        在传统编程教育平台的基础上，添加第二类交互式视频与基于语义网的智能导学系统两大模块，用以尝试解决当前大多数编程教育平台存在的学习者学习的低主动性问题和难以从众多学习资源中寻找合适内容的问题。
      </p>
      <p>本平台的创新点：</p>
      <ol>
        <li>创新了视频格式，允许学习者直接与播放器中的代码进行交互。给用户以参与感，激发学习兴趣；</li>
        <li>设计了知识元学习状态评价方法，结合基于语义网的智能导学系统分析学习者知识元学习状态，为学习者推荐下阶段学习、复习的课程；</li>
        <li>基于抽象语法树，设计了代码语法分析功能，能通过分析学习者提交的代码，更新知识元学习状态；</li>
      </ol>
      <QRCodeBlock />
    </article>
  </div>
  <Footer />
</Fragment>)

export default About;