import React, { useState, useEffect } from 'react';
import { Avatar } from 'antd';
import classNames from 'classnames';

import './style.less';

export default function (props) {
  // 防止闪耀
  const [isTimeout, setIsTimout] = useState(false);
  const size = props.width || 42;
  const {
    nickName = '',
    userName = '',
    userId = '',
    groupName = '',
    defaultImageText,
    width = 42,
    height = 42,
    style: defaultStyle = {},
    className,
    ...imageProps
  } = props;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimout(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (props.src || !isTimeout) {
    return <Avatar {...imageProps} style={defaultStyle} size={size} />;
  } else {
    let imageText = '';

    if (defaultImageText) {
      imageText = defaultImageText;
    } else {
      imageText =
        (nickName || userName || '').toString().substr(-2, 2) ||
        groupName.toString().substr(0, 1) ||
        userId.toString().substr(0, 1).toUpperCase();
    }
    const style = {
      ...defaultStyle,
      width,
      height,
      lineHeight: `${height}px`,
      fontSize: imageText.length === 1 ? '22px' : '16px',
    };

    return (
      <div
        className={classNames({
          defaultAvatarImage: true,
          [className]: !!className,
        })}
        {...imageProps}
        style={style}
      >
        {imageText}
      </div>
    );
  }
}
