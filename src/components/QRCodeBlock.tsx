import React from 'react';
import QRCodeImg from '../assets/qrcode.jpg';
import { Card, Elevation } from '@blueprintjs/core';

const QRCodeBlock = () => (
  <Card elevation={Elevation.ONE} className="flex" style={{maxWidth: '450px'}}>
    <div style={{marginRight: '7px'}} className="flex vertical between">
      <p>体验过该网站后，邀请您参与本网站的<i>反馈工作</i>。请帮助我们将网站建设的更好！</p>
      <p>扫描<b>二维码</b>，参与问卷调查。</p>
    </div>
    <img width={120} src={QRCodeImg} alt="Questionnaire survey QR code of Questionnaire star" />
  </Card>
)

export default QRCodeBlock;