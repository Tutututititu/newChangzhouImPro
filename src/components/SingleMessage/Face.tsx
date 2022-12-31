import React from 'react';

export default function (props) {
  const { iconUrl, value } = props.msgContent;
  console.log(props, '正常 -- 发送');

  return (
    <img
      key={iconUrl}
      src={iconUrl || value}
      alt="emoji"
      style={{ width: '24px', height: '24px', margin: '0 4px' }}
    />
  );
}
