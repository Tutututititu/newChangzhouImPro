import React from 'react';

export default function(props) {
  const { data } = props.msgContent;
  const utf8decoder = new TextDecoder();
  let text = ''
  try {
    text = utf8decoder.decode(data);
  } catch(e) {
    console.log(e);
  }

  return <div dangerouslySetInnerHTML={{__html: text}}></div>
}