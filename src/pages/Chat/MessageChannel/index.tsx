import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useModel } from 'umi';
import { history } from 'umi';
import { List, message as Message, Empty, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import moment from 'moment';
import VirtualList from 'rc-virtual-list';
import { resolveMsgFormContent } from '@/utils';
import { MsgTypeMap } from '@/constants';
import AvatarImage from '@/components/AvatarImage';
import type { MenuProps } from 'antd';
import PubSub from 'pubsub-js';

import type { MessageInMessageChannel } from '@/typings/chat';

import './style.less';

interface PropsType {
  tabKey: string;
  onClose: () => void;
}

export default function (props: PropsType) {
  const {
    sdk,
    setPagePath,
    userInfo: { userId },
  } = useModel('global');
  const pageRef = useRef(null);
  const { tabKey, onClose } = props;
  const [messageList, setMessageList] = useState<MessageInMessageChannel[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pagination, setPagination] = useState({
    totalItemCount: 0,
    totalPage: 1,
  });

  console.log(tabKey, 'pppp000');

  const ContainerHeight = useMemo(
    () => pageRef?.current?.clientHeight - 200,
    [pageRef.current],
  );
  const apiMap = useMemo(
    () => ({
      atMeMessage: { api: 'queryAtMeMessage', title: '@我的' },
      concernMessage: { api: 'queryConcernMessage', title: '特别关注' },
      dealLaterMessage: { api: 'queryDealLaterMessage', title: '稍后处理' },
    }),
    [],
  );

  const getNextData = async (index: number) => {
    const api = apiMap[tabKey]?.api || 'queryAtMeMessage';
    const res = await sdk[api]({ pageIndex: index, pageSize: 100, userId });
    const { current = 1, totalItemCount, totalPage, rows = [] } = res || {};
    setPageIndex(current);

    // 从大到小排序
    function sortId(a: { timestamp: number }, b: { timestamp: number }) {
      return b.timestamp - a.timestamp;
    }
    rows.sort(sortId);
    console.log(rows, 'rows111');

    setMessageList([...messageList, ...rows]);
    setPagination({ totalItemCount, totalPage });
  };

  useEffect(() => {
    PubSub.subscribe('shaohouchuli', () => {
      getNextData(pageIndex);
    });
    getNextData(pageIndex);
  }, [tabKey]);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      ContainerHeight
    ) {
      getNextData(pageIndex + 1);
    }
  };

  const handlePassed = async (message) => {
    if (!message) {
      // 全部处理
      await sdk.closeAllMessageDealLater();
      Message.success('所有消息已处理');
      setMessageList([]);
    } else {
      // 单个处理
      await sdk.closeMessageDealLater({
        messages: [{ cid: message.cid, messageId: message.id }],
      });
      setMessageList(messageList.filter((item) => item.id !== message.id));
    }
    PubSub.publish('getLater');
  };

  const toChatDetailPage = (cid, msgId) => {
    history.push({ pathname: `/gov/cz/index_dev`, query: { msgId } });
  };

  const renderMessage = (item) => {
    try {
      const messageData = JSON.parse(item.content);
      let msgType = MsgTypeMap[item.templateCode]?.toLowerCase();
      if (msgType === 'strong_reminder') msgType = 'ding';
      return resolveMsgFormContent(msgType, messageData);
    } catch (e) {
      return '[自定义消息]';
    }
    // resolveMsgFormContent(messageData)
  };

  const renderLaterMessage = (item) => {
    const msgType = MsgTypeMap[item.messageContentType]?.toLowerCase();
    return resolveMsgFormContent(msgType, item.content);
  };

  const clearUpDate = (date) => {
    if (
      moment(date ? date : '').format('YYYY-MM-DD') ==
      moment().format('YYYY-MM-DD')
    ) {
      return moment(date ? date : '').format('HH:mm');
    } else {
      return moment(date ? date : '').format('MM-DD');
    }
  };

  const goOver = (msg) => {
    return (
      <Menu>
        {[
          {
            label: '已处理',
            key: 'over',
            onClick: () => handlePassed(msg),
          },
        ].map((item) => (
          <Menu.Item key={item.key} onClick={item.onClick}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const goPath = (item) => {
    console.log(item, '---0-0-');
    setPagePath({ activeIcon: 'chat', cid: item.sid || item.cid });
  };

  const list = (
    <>
      {!messageList.length ? (
        <Empty style={{ marginTop: 20 }} />
      ) : (
        <div className="tipBar">
          最近7天的消息
          {tabKey === 'dealLaterMessage' && (
            <a className="checkBtn" onClick={() => handlePassed()}>
              全部标记为已处理
            </a>
          )}
        </div>
      )}
      <List style={{ margin: '0 12px' }}>
        <VirtualList
          data={messageList}
          height={ContainerHeight}
          itemKey="email"
          onScroll={onScroll}
          className="ListNoScroll"
        >
          {(item: MessageInMessageChannel) => {
            // const content = JSON.parse(item.content);
            const listItem =
              tabKey == 'dealLaterMessage' ? (
                <Dropdown overlay={goOver(item)} trigger={['contextMenu']}>
                  <List.Item
                    onClick={() => goPath(item)}
                    key={item.msgId || item.id}
                  >
                    <List.Item.Meta
                      avatar={
                        <AvatarImage
                          src={item.from.avatarUrl}
                          nickName={item.from?.nickName}
                          userName={item.from?.userName}
                          userId={item.from?.userId}
                          style={{ borderRadius: 8 }}
                          fit="cover"
                          width={42}
                          height={42}
                        />
                      }
                      title={
                        <span className="messageTopBar">
                          {item.sessionName}
                          <span className="messageSendTime">
                            {clearUpDate(item.timestamp)}
                            {/* {moment(item.timestamp).format('HH:mm')} */}
                          </span>
                        </span>
                      }
                      description={
                        <div
                          className="userMessage"
                          onClick={() =>
                            toChatDetailPage(
                              item.cid || item.sid,
                              item.msgId || item.id,
                            )
                          }
                        >
                          {tabKey === 'dealLaterMessage'
                            ? renderLaterMessage(item)
                            : renderMessage(item)}
                        </div>
                      }
                      // {item.chatGroup}
                    />
                    {/* extra={moment(item.timestamp).format('HH:mm')} */}
                  </List.Item>
                </Dropdown>
              ) : (
                <List.Item
                  key={item.msgId || item.id}
                  onClick={() => goPath(item)}
                >
                  <List.Item.Meta
                    avatar={
                      <AvatarImage
                        src={item.from.avatarUrl}
                        nickName={item.from?.nickName}
                        userName={item.from?.userName}
                        userId={item.from?.userId}
                        style={{ borderRadius: 8 }}
                        fit="cover"
                        width={42}
                        height={42}
                      />
                    }
                    title={
                      <span className="messageTopBar">
                        {item.sessionName}
                        <span className="messageSendTime">
                          {clearUpDate(item.timestamp)}
                          {/* {moment(item.timestamp).format('HH:mm')} */}
                        </span>
                      </span>
                    }
                    description={
                      <div
                        className="userMessage"
                        onClick={() =>
                          toChatDetailPage(
                            item.cid || item.sid,
                            item.msgId || item.id,
                          )
                        }
                      >
                        {tabKey === 'dealLaterMessage'
                          ? renderLaterMessage(item)
                          : renderMessage(item)}
                      </div>
                    }
                    // {item.chatGroup}
                  />
                  {/* extra={moment(item.timestamp).format('HH:mm')} */}
                </List.Item>
              );
            return listItem;
          }}
        </VirtualList>
      </List>
    </>
  );

  return (
    <div className="messageChannelMask" ref={pageRef}>
      <div className="messageChannelPage" ref={pageRef}>
        <div className="pageTitle">
          <DownOutlined onClick={onClose} style={{ marginRight: 8 }} />
          {apiMap[tabKey]?.title}
        </div>
        {list}
      </div>
    </div>
  );
}
