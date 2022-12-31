import React from 'react';
import { useModel } from 'umi';
import { useState, useRef, useMemo } from 'react';

import './style.less';

export default function (props) {
  const audioRef = useRef(null);
  const { url = '', duration } = props.msgContent;
  const {
    userInfo: { userId: myUserId },
  } = useModel('global');
  const [isPlaying, setIsPlaying] = useState(false);
  const audio = useMemo(() => new Audio(url), [url]);

  const togglePlay = (e) => {
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }

    e.stopPropagation();
  };

  audio.onended = () => {
    setIsPlaying(false);
  };

  return (
    <div
      onClick={togglePlay}
      className={`voiceComponent ${
        props.from?.userId === myUserId ? 'rightVoice' : 'leftVoice'
      }`}
      style={{ width: '30vw' }}
    >
      <span className={isPlaying ? 'playingIcon' : 'pauseIcon'} />
      {Math.ceil(duration)}&quot;
      <audio src={url} ref={audioRef} />
    </div>
  );
}
