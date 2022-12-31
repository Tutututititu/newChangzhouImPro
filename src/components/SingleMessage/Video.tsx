import React from 'react';
import { useState } from 'react';

export default function(props) {
  const { url } = props.msgContent;
  // const [touchStartTime, setTouchStartTime] = useState();

  // const handleTouchStart = () => {
  //   setTouchStartTime(+new Date())
  // }

  // const handleTouchEnd = (e) => {
  //   if (+new Date() - touchStartTime < 200) {

  //     e.stopPropagation();
  //   }
  // }

  // return <video onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} src={url} />;
  return <video width="100%" height="100%" src={url} controls />
}