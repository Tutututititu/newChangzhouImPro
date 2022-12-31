import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Button, message as Message, Switch, Space, Popover } from 'antd';
import { CopyOutlined, RightOutlined } from '@ant-design/icons';
import copy from 'copy-text-to-clipboard';
import QRCode from '../QRCode';
import AvatarImage from '@/components/AvatarImage';

import './style.less';

interface Props {
  userId: string;
  handleChangeTabKey: (arg: string) => void;
}
const flatObject = (obj: { [x: string]: any }) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      newObj = { ...newObj, ...obj[key] };
    } else {
      newObj[key] = obj[key];
    }
  });
  console.log('newObj===', newObj);
  return newObj;
};
export default function (props: Props) {
  const { userId, handleChangeTabKey } = props;
  const { userInfo, loginOut } = useModel('global');
  const { sdk } = useModel('global');
  const [mySetting, setMySetting] = useState({
    enableVerificationWhenAddMe: false,
  });
  useEffect(async () => {
    const setting = await sdk.querySecretConfig();
    setMySetting(flatObject(setting));
  }, []);
  const copyUserId = (e) => {
    copy(userId);
    Message.success('复制成功');
    e.stopPropagation();
  };

  const handleLoginOut = () => {
    loginOut();
  };
  const handleChangeSetting = async ({ property, value }) => {
    const res = await sdk.changeSecretConfig({ property, value });
    setMySetting({ ...mySetting, [property]: value });
  };
  const [showQRCode, setShowQRCode] = useState(false);
  const shoQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  return (
    <div className="userInfoPage">
      <List split={false}>
        <List.Item>
          <List.Item.Meta
            avatar={
              <AvatarImage
                nickName={userInfo.nickName}
                userName={userInfo.userName}
                userId={userId}
                style={{ borderRadius: '12px' }}
                src={userInfo.avatarUrl}
                width={40}
                height={40}
                fit="fill"
              />
            }
            title={userInfo.nickName}
            description={
              <div className="userId">
                {/* {'ID:' + userId} <CopyOutlined onClick={copyUserId} /> */}
              </div>
            }
          />
        </List.Item>
      </List>
      <div className="sloganArea">
        <div className="sloganLabel">设置</div>
        <List
          style={{
            '--border-top': 0,
            '--border-bottom': 0,
            '--border-inner': 0,
            marginTop: 12,
          }}
          className="setting-list"
        >
          <List.Item
            extra={
              <Switch
                onChange={(value) =>
                  handleChangeSetting({
                    property: 'enableVerificationWhenAddMe',
                    value: !value,
                  })
                }
                checked={!mySetting.enableVerificationWhenAddMe}
              />
            }
          >
            加我好友时无须验证
          </List.Item>
          <List.Item
            onClick={() => {
              handleChangeTabKey('collect');
            }}
          >
            我的收藏
            <Space className="listValue">
              <RightOutlined />
            </Space>
          </List.Item>
          <Popover
            content={<QRCode {...userInfo} type={'user'} />}
            trigger="click"
            placement="right"
            key="myKey"
          >
            <List.Item onClick={shoQRCode} className="QRCodeBox">
              我的二维码
              <Space className="listValue">
                <RightOutlined />
              </Space>
            </List.Item>
          </Popover>
          {/* <List.Item>
            设置
            <Space className="listValue">
              <RightOutlined />
            </Space>
          </List.Item> */}
        </List>
      </div>
      {/* <div className="bottomButtonBar">
        <Button danger type="link" onClick={handleLoginOut}>
          退出登录
        </Button>
      </div> */}
    </div>
  );
}
