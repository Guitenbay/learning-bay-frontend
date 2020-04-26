import React from "react";
import { Button, Icon, Slider, Spinner } from "@blueprintjs/core";
import './AudioController.css'
import { formatTime } from "../utils/methods";

interface IProps { audioUrl: string, play: boolean, 
  onEnded: () => void, onPlay: () => void, onSeeked: ((event: Event) => void)
  onPause: () => void, onCanPlay: () => void
}
interface IState { 
  currentTime: string, volume: number, showSlider: boolean, percent: number, autoloaded: boolean
}

class AudioController extends React.Component<IProps, IState> {
  public audio: HTMLAudioElement|undefined = undefined;
  constructor(props: IProps) {
    super(props);
    this.state = {
      currentTime: "00:00", volume: 0.8, showSlider: false, percent: 0, autoloaded: false,
    }
  }
  componentDidMount() {
    this.audio = document.querySelector('audio#audio') as HTMLAudioElement;
    // audio 已经加载一段，可以播放时
    this.audio.addEventListener("canplay", () => {
      this.setState({ autoloaded: true });
      this.props.onCanPlay();
    })
    this.audio.addEventListener("timeupdate", () => {
      const audio = this.audio as HTMLAudioElement;
      // console.log('precent', audio.currentTime, audio.duration, audio.currentTime / audio.duration);
      this.setState({ 
        percent: audio.currentTime / audio.duration,
        currentTime: formatTime(audio.currentTime)
      });
    })
    this.audio.addEventListener('play', () => this.props.onPlay());
    this.audio.addEventListener('pause', () => this.props.onPause());
    this.audio.addEventListener('ended', () => {
      this.props.onEnded();
      this.setState({ 
        percent: 1,
        currentTime: formatTime((this.audio as HTMLAudioElement).currentTime)
      });
    });
    this.audio.addEventListener('seeked', event => this.props.onSeeked(event));
    const progress = document.querySelector('.Timeline') as HTMLElement;
    // 根据点击位置设置播放时间
    const handleScrub = (e: MouseEvent) => {
      const audio = (this.audio as HTMLAudioElement);
      if (isFinite(audio.duration)) {
        // 30 指进度条左边的按钮宽度
        const scrubTime = ((e.clientX - 30) / progress.offsetWidth) * audio.duration;
        audio.currentTime = scrubTime;
      }
    }
    progress.addEventListener('click', (e) => {
      // console.log('click');
      handleScrub(e);
    });
    // 拖动
    let mousedown = false;
    progress.addEventListener('mousedown', () => {
      // console.log('mousedown');
      mousedown = true;
      // this.audio?.pause();
    });
    progress.addEventListener('mouseup', () => {
      // console.log('mouseup');
      mousedown = false;
      // this.audio?.play();
    });
    progress.addEventListener('mousemove', e => mousedown && handleScrub(e));
  }
  private handlePlay = () => {
    if (this.audio?.paused) {
      this.audio.play();
    } else {
      this.audio?.pause();
    }
  }
  private handleSliderClick  = () => { this.setState({showSlider: !this.state.showSlider}) }
  // private handleSliderHidden = () => { console.log('blur');this.setState({showSlider: false}) }
  private handleVolumeChange = (value: number) => {
    (this.audio as HTMLAudioElement).volume = value;
    this.setState({ volume: value });
  }
  render() {
    const { currentTime, volume, showSlider, percent, autoloaded } = this.state;
    return (
      <div className="AudioController">
        <audio id="audio" preload="auto" src={this.props.audioUrl}>您的浏览器不支持 audio 标签。</audio>
        <div className="body flex">
          <div className="buttons play none">
            {
              (autoloaded)
              ? (<Button minimal onClick={this.handlePlay}>
                <Icon icon={ this.props.play ? "pause" : "play"} iconSize={20} color="var(--icon-color)" />
              </Button>)
              : (<div style={{ padding: 5 }}><Spinner size={20} /></div>)
            }
          </div>
          <div className="Timeline auto flex">
            <div className="track auto">
              <div className="Elapsed elapsed" style={{transform: `scaleX(${percent})`}}></div>
            </div>
            <div className="time none">
              <span className="elapsed label">{currentTime}</span>
              {/* &nbsp;/&nbsp;<span className="remaining label">-0:31</span> */}
            </div>
          </div>
          <div className="buttons right none">
            <div className="SliderButton VolumeButton">
              {/* <input type="range" name="volume" className="player__slider" min="0" max="1" step="0.05" value="1"> */}
              <div className={ showSlider ? "slider-bg" : "slider-bg hidden"}>
                <Slider labelRenderer={false} max={1} min={0} stepSize={0.01} labelStepSize={10}
                  className="volume_slider"
                  value={volume} onChange={this.handleVolumeChange}
                />
              </div>
              <Button minimal onClick={this.handleSliderClick}>
                <Icon icon="volume-up" iconSize={17} color="var(--icon-color)" />
              </Button>
            </div>
          </div>
        </div>
        {/* <div className="player__controls">
          <div className="progress">
            <div className="progress__filled"></div>
          </div>
          <button className="player__button toggle" title="Toggle Play">►</button>
          <input type="range" name="volume" className="player__slider" min="0" max="1" step="0.05" value="1" />
          <input type="range" name="playbackRate" className="player__slider" min="0.5" max="2" step="0.1" value="1" />
          <button data-skip="-10" className="player__button">« 10s</button>
          <button data-skip="25" className="player__button">25s »</button>
        </div> */}
      </div>
    )
  }
}

export default AudioController;