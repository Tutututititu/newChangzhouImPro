import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Popover } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import AvatarImage from '../AvatarImage';

import { UserInfo } from '@/typings/global';

import './style.less';

interface PropsType {
  visible: boolean;
  cid: string;
  messageId: string;
  children: any;
  onClose: () => void;
}

const ReadStatus = {
  Unread: 0,
  Readed: 1,
};

interface ReadStaticRes {
  list: UserInfo[];
  currentPage: number;
  totalPage: number;
}

interface CountMumber {
  unReadUserCount: number;
  readUserCount: number;
}

export default function (props: PropsType) {
  const { sdk } = useModel('global');
  const { visible, cid, messageId, children, onClose } = props;
  const [countNumber, setCountNumber] = useState<CountMumber>({
    unReadUserCount: 0,
    readUserCount: 0,
  });
  const [readedRes, setReadedRes] = useState<ReadStaticRes>({
    list: [],
    currentPage: 1,
    totalPage: 1,
  });
  const [unreadRes, setUnreadRes] = useState<ReadStaticRes>({
    list: [],
    currentPage: 1,
    totalPage: 1,
  });

  const getList = async (pageIndex: number, status: number) => {
    const data = await sdk.queryMessageReadOrUnReadUsers({
      cid,
      messageId,
      status,
      pageIndex,
    });
    const { rows = [], current, totalPage } = data;
    if (status === ReadStatus.Readed) {
      setReadedRes({
        list: [...readedRes.list, ...rows],
        currentPage: current,
        totalPage,
      });
    } else {
      setUnreadRes({
        list: [...unreadRes.list, ...rows],
        currentPage: current,
        totalPage,
      });
    }
  };

  const reinitialize = () => {
    setReadedRes({
      list: [],
      currentPage: 1,
      totalPage: 1,
    });
    setUnreadRes({
      list: [],
      currentPage: 1,
      totalPage: 1,
    });
    setCountNumber({
      unReadUserCount: 0,
      readUserCount: 0,
    });
  };

  useEffect(() => {
    if (visible) {
      getList(1, ReadStatus.Readed);
      getList(1, ReadStatus.Unread);
      sdk
        .queryMessageReadOrUnReadStatus({ cid, messageId })
        .then((data: CountMumber) => setCountNumber(data));
    } else if (visible === false) {
      reinitialize();
    }
  }, [visible]);

  const renderList = (list: UserInfo[]) => {
    return (
      <>
        <List>
          {list.map((item) => {
            return (
              <List.Item key={item.userId}>
                <AvatarImage
                  src={item.avatarUrl}
                  style={{
                    display: 'inline-block',
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                  fit="cover"
                  width={36}
                  height={36}
                  nickName={item.nickName}
                  userName={item.userName}
                  userId={item.userId}
                />
                {item.nickName || item.userName || item.userId}
              </List.Item>
            );
          })}
        </List>
        {/* <InfiniteScroll loadMore={() => getList(pagination.pageIndex + 1)} hasMore={pagination.totalPage > pagination.pageIndex} /> */}
      </>
    );
  };

  return visible ? (
    <Popover
      visible={visible}
      title={
        <>
          接收人列表
          <CloseOutlined
            style={{ float: 'right', marginTop: 12 }}
            onClick={onClose}
          />
        </>
      }
      trigger="click"
      placement="leftTop"
      overlayClassName="messageReadedStatisticPopover"
      content={
        <div className="messageReadedStatisticBox">
          <div
            className="listBox"
            style={{ borderRight: '1px solid rgba(0,0,0,0.09)' }}
          >
            <div className="listBoxTitle">
              {countNumber.unReadUserCount}人未读
            </div>
            {renderList(unreadRes.list)}
          </div>
          <div className="listBox">
            <div className="listBoxTitle">
              {countNumber.readUserCount}人已读
            </div>
            {renderList(readedRes.list)}
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  ) : (
    children
  );
}
