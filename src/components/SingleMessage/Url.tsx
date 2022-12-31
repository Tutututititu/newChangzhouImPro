import React from 'react';

interface PropsType {
  msgContent: {
    href: string;
    title: string;
  }
}

export default function(props: PropsType) {
  const { href, title } = props.msgContent;
  return <a href={href} target="_blank">{title}</a>;
}