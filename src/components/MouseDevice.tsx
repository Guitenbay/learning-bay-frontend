import React, { CSSProperties } from 'react';

interface IProps {
  x?: number,
  y?: number
}

const MouseDevice: React.FunctionComponent<IProps> = ({
  x = 100, 
  y = 100
}) => (
  <React.Fragment>
    {/* 鼠标 */}
    <div style={Object.assign({ transform: `translate3d(${x}px, ${y}px, 0px)` }, styles.PointerView)}>
      <div style={styles.PointerBody}>
        <div style={styles.PointerShape}>
          <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <polygon points="35 35 29.2102052 35.6469727 24.9999029 39 24.9987284 25" fill="#8BB2FF" fillRule="evenodd"></polygon>
          </svg>
        </div>
      </div>
    </div>
  </React.Fragment>
)

const styles = {
  PointerView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    zIndex: 445,
    pointerEvents: 'none',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  },
  PointerBody: {
    transition: 'opacity .1s ease-out',
    opacity: .99
  },
  PointerShape: {
    backgroundPosition: 'center center',
    backgroundSize: '48px',
    transformOrigin: '50% 50%',
    transform: 'translate(-50%,-50%)',
    position: 'absolute'
  } as CSSProperties
}

export default MouseDevice