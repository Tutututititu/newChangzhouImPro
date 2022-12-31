import React, { useState } from 'react';
import { Image } from 'antd';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import './style.less';
interface PropsType {
  msgContent: {
    pic: string;
    height: number;
    width: number;
  };
}

export default function (props: PropsType) {
  const { pic } = props.msgContent;
  const [visible, setVisible] = useState(false);
  return (
    <Image
      preview={{
        visible,
        src: pic,
        onVisibleChange: (value) => {
          setVisible(value);
        },
      }}
      style={{ maxHeight: '250px', maxWidth: '100%', pointerEvents: 'none' }}
      rootClassName="bigIcon"
      src={pic}
    />
  );
}
