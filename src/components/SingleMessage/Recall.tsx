import React from 'react';
import { useModel } from 'umi';
import { ContentType } from '../../constants';

import './style.less';

export default function (props) {
  const {
    mySdkStore: { mockConfig },
  } = useModel('global');
  const {
    from: { userId },
    content,
    onReEdit,
    from: newFrom,
  } = props;

  return (
    <div className="recallComponent">
      {userId === mockConfig.userId ? '你' : newFrom.nickName}撤回了一条消息{' '}
      {content?.msgType === ContentType.Text && (
        <a className="editBtn" onClick={() => onReEdit(content.text)}>
          重新编辑
        </a>
      )}
    </div>
  );
}
