import { useModel } from 'umi';
import React from 'react';
import { List, Space } from 'antd';

import './style.less';
import AvatarImage from '@/components/AvatarImage';

export default function (props) {
  const extInfo = props.extInfo || props.msgContent.extInfo;
  const { mySdkStore } = useModel('global');
  const sendByme = props.from?.userId === mySdkStore.mockConfig.userId;

  return (
    <div className="userCardComponent">
      <List className={sendByme ? 'rightCardContent' : ''}>
        <List.Item>
          <Space>
            <AvatarImage
              src={extInfo.avatarUrl}
              nickName={extInfo.nickName}
              userName={extInfo.userName}
              userId={extInfo.userId}
              style={{ borderRadius: 8 }}
              fit="cover"
              width={40}
              height={40}
            />
            {extInfo.nickName || extInfo.userName || extInfo.userId}
          </Space>
        </List.Item>
      </List>
      <div className="userCardDesc">个人名片</div>
    </div>
  );
}
