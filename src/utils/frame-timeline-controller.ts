// 暂时舍弃
export class FrameTimelineController {
  // 以 0.001s 为单位
  private bufferTime: number = 0;
  private startTime: number = 0;
  play() {
    this.startTime = +Date.now();
  }
  pause() {
    this.bufferTime = +Date.now() - this.startTime;
  }
  getCurrentTime() {
    const gap = +Date.now() - this.startTime;
    return this.bufferTime + gap;
  }
  setCurrentTime(currentTime: number) {
    // currentTime 以 1s 为单位
    this.bufferTime = currentTime * 1000;
    this.play();
  }
}