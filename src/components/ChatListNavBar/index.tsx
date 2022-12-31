import React, { useEffect, useState } from 'react';
import {
  StarOutlined,
  ClockCircleOutlined,
  ClockCircleTwoTone,
} from '@ant-design/icons';
import MessageChannel from '@/pages/Chat/MessageChannel';
import PubSub from 'pubsub-js';
import './style.less';
import { useModel } from 'umi';
const ChatListNavBar: React.FC = () => {
  const { sdk, userInfo } = useModel('global');
  const [messageChannelPageProps, setMessageChannelPageProps] = useState({
    visible: false,
    tabKey: '',
  });
  let [numSum, setNumSum] = useState('0');
  PubSub.subscribe('numSum', (_, res) => {
    if (Number(res) > 99) {
      setNumSum('99+');
    } else {
      setNumSum(res);
    }
  });
  PubSub.subscribe('getLater', () => {
    getLater();
  });
  PubSub.subscribe('shaohouchuli', () => {
    getLater();
  });
  const [flage, setFlage] = useState(false);
  useEffect(() => {
    getLater();
    return () => {
      PubSub.unsubscribe('numSum');
      PubSub.unsubscribe('getLater');
      PubSub.unsubscribe('shaohouchuli');
    };
  }, []);
  const getLater = async () => {
    const res = await sdk.queryDealLaterMessage({ userId: userInfo.userId });
    if (res.rows.length) {
      setFlage(false);
    } else {
      setFlage(true);
    }
  };
  const barItems = [
    { title: '@我的', key: 'atMeMessage', icon: '@' },
    { title: '特别关注', key: 'concernMessage', icon: <StarOutlined /> },
    {
      title: '稍后处理',
      key: 'dealLaterMessage',
      icon: flage ? (
        <ClockCircleOutlined />
      ) : (
        <ClockCircleTwoTone twoToneColor="#33cc00" />
      ),
    },
  ];

  const handleToPage = (key: string) => {
    setMessageChannelPageProps({ visible: true, tabKey: key });
  };

  const checkNumSum = (val) => {
    if (typeof val == 'number') {
      if (val > 0) {
        return val;
      } else {
        return '';
      }
    } else {
      return '';
    }
  };

  return (
    <div className="barContainer">
      {barItems.map((i) => (
        <span key={i.key}>
          <a
            className="barButton"
            onClick={() => handleToPage(i.key)}
            color="rgba(0,0,0,0.43)"
            fill="outline"
            style={{ marginRight: i.divider ? 0 : 20 }}
          >
            {i.icon}
          </a>
        </span>
      ))}
      {!!numSum && checkNumSum(numSum) && (
        <span className="numSum">{numSum ? checkNumSum(numSum) : ''}</span>
      )}
      {/* todo: 没有接口 */}
      {/* <MoreOutline className="moreBtn" onClick={() => history.push({ pathname: '/layoutSetting'})} /> */}
      {messageChannelPageProps.visible && (
        <MessageChannel
          {...messageChannelPageProps}
          onClose={() =>
            setMessageChannelPageProps({ visible: false, tabKey: '' })
          }
        />
      )}
    </div>
  );
};

export default ChatListNavBar;
