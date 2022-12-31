import React from 'react';
import { Card } from 'antd';
import { CloseCircleOutlined, SoundOutlined } from '@ant-design/icons';

import './style.less';

export default function (props) {
  const { notice, onClose } = props;

  return (
    <Card
      className="chatGroupNoticeComponent"
      title={
        <div
          style={{
            fontWeight: 'normal',
            color: 'rgba(250,100,0,1)',
            fontSize: 13,
          }}
        >
          <SoundOutlined style={{ marginRight: '4px' }} />
          群公告
        </div>
      }
      extra={
        <CloseCircleOutlined
          onClick={onClose}
          style={{ color: 'rgba(0,0,0,.25)' }}
        />
      }
    >
      <div style={{ wordBreak: 'break-all' }}>{notice}</div>
    </Card>
  );
}
