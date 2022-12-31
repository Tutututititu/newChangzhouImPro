import React from 'react';

import './style.less';

export default function (props) {
  const { title } = props;

  return <div className="im-layout-right-header">{title}</div>;
}
