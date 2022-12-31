import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { message as Message, List, Menu, Skeleton } from 'antd';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';

import ChatInboxCard from '@/components/ChatInboxCard';
import TagModal from '@/components/TagModal';

import { resolveMsgFormContent } from '../../../utils/index';

import './style.less';

const ConverList = (props) => {
  const { onCidChange } = props;
  const {
    sdk,
    newMessage,
    userInfo: { userId: myUserId },
    globalConverList,
    updateGlobalConverList,
    clearGlobalConverList,
  } = useModel('global');
  const [currentCid, setCurrentCid] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPage: 1 });
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [topModeId, setTopModeId] = useState();
  const [shieldModeId, setShieldMode] = useState();
  const [topModeList, setTopModeList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTankTopList = async () => {
    const group = await sdk.queryConversationGroups();
    console.log('getTankTopList========group==============',group)
    const topModeId = group.find(
      (item) => item.groupName.indexOf('置顶') > -1,
    )?.id;
    const shieldModeId = group.find(
      (item) => item.groupName.indexOf('打扰') > -1,
    )?.id;
    setTopModeId(topModeId);
    setShieldMode(shieldModeId);
    if (topModeId) {
      const { list = [] } = await sdk.queryConversationListByGroup({
        pageIndex: 1,
        pageSize: 100,
        groupId: topModeId,
      });
      const newConvers = list.map((conver) => {
        const {
          gmtCreate,
          lastMsgContentType,
          lastMsgContent,
          lastMsgSenderId,
          lastMsgRecallStatus,
        } = conver;
        const lastMsg =
          lastMsgRecallStatus > 0
            ? `${lastMsgSenderId === myUserId ? '你' : '对方'}撤回了一条消息`
            : resolveMsgFormContent(lastMsgContentType, lastMsgContent);
        return {
          ...conver,
          gmtCreate: moment(gmtCreate).format('YYYY/MM/DD HH:mm:ss'),
          lastMsg,
        };
      });
      // updateGlobalConverList(newConvers);
      setTopModeList(newConvers);
      return newConvers;
    } else {
      return [];
    }
  };

  const getConver = (pageIndex: number, clear: boolean, topList?) => {
    sdk
      .queryConversationList({ pageIndex, pageSize: 20, type: 'all' })
      .then((data) => {
        const { list, totalPage } = data;
        setPagination({ pageIndex, totalPage });
        setLoading(false);
        const newConvers = list
          .map((conver) => {
            const {
              gmtCreate,
              lastMsgContentType,
              lastMsgContent,
              lastMsgSenderId,
              lastMsgRecallStatus,
            } = conver;
            const lastMsg =
              lastMsgRecallStatus > 0
                ? `${
                    lastMsgSenderId === myUserId ? '你' : '对方'
                  }撤回了一条消息`
                : resolveMsgFormContent(lastMsgContentType, lastMsgContent);
            return {
              ...conver,
              gmtCreate: moment(gmtCreate).format('YYYY/MM/DD HH:mm:ss'),
              lastMsg,
            };
          })
          .filter(
            (item) =>
              !(topList || topModeList).find(({ cid }) => item.cid === cid),
          );

        const conversList = [...topList, ...newConvers];
        if (clear) {
          updateGlobalConverList([...conversList]);
        } else {
          updateGlobalConverList([...globalConverList, ...conversList]);
        }
      });
  };

  const refreshConverData = async () => {
    const topModeList = await getTankTopList();
    await getConver(1, true, topModeList);
  };

  const resolveNewMessage = (msgs) => {
    const lastMsg = msgs[msgs.length - 1];
    const {
      cid,
      msgType,
      msgContent,
      msgId,
      lastMsgRecallStatus,
      lastMsgSenderId,
      from,
    } = lastMsg;

    const newConvers = [...globalConverList];
    const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
    if (matchIndex >= 0) {
      const lastMsg =
        lastMsgRecallStatus > 0
          ? `${lastMsgSenderId === myUserId ? '你' : '对方'}撤回了一条消息`
          : resolveMsgFormContent(msgType, msgContent);
      console.log('onNewMessage change lastmag>>>:', matchIndex, lastMsg);
      const matchItem = newConvers[matchIndex];
      const { unReadCount, bizParams } = matchItem;
      // 计算新的会话维度，考虑是否默认已读，是否存在转发、多端同步等本人发送的消息
      const converDefaultRead = bizParams.is_default_read;
      let calcuUnReadCount = unReadCount;
      if (
        !converDefaultRead &&
        from?.userId !== myUserId &&
        cid !== currentCid
      ) {
        calcuUnReadCount = unReadCount + msgs.length;
      }
      newConvers[matchIndex] = {
        ...matchItem,
        unReadCount: calcuUnReadCount,
        lastMsgId: msgId,
        lastMsgContentType: msgType,
        lastMsg,
        gmtModified: new Date().valueOf(),
        bizParams: { ...bizParams, is_hidden: '0' },
      };
      if (bizParams.is_hidden === '1') {
        sdk.addConversationUserMark({
          cid,
          marks: [{ propertyName: 'is_hidden', propertyValue: 0 }],
        });
      }
    }
    updateGlobalConverList([...newConvers]);
  };

  const msgStatusChange = (msg, list) => {
    switch (msg.msgStateChangeType) {
      case 'deleteFromCursor':
        modificationList(msg, list);
        break;
    }
  };

  const modificationList = (msg, list) => {
    list.forEach((x) => {
      if (x.cid == msg.cid) {
        x.lastMsg = '';
      }
    });
    updateGlobalConverList([...globalConverList]);
  };

  const sendMessageOk = (messageData, converList) => {
    console.log('onSendMessageOk----------', messageData, converList);
    const {
      cid,
      msgType,
      msgContent,
      messageContentType,
      msgId,
      lastMsgRecallStatus,
      lastMsgSenderId,
      from,
    } = messageData;
    if (!messageContentType) return;

    const newConvers = [...converList];
    const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
    if (matchIndex >= 0) {
      const lastMsg =
        lastMsgRecallStatus > 0
          ? `${lastMsgSenderId === myUserId ? '你' : '对方'}撤回了一条消息`
          : resolveMsgFormContent(msgType, msgContent);
      console.log('onSendMessageOk change lastmag>>>:', matchIndex, lastMsg);
      const matchItem = newConvers[matchIndex];
      const { unReadCount, bizParams } = matchItem;
      // 计算新的会话维度，考虑是否默认已读，是否存在转发、多端同步等本人发送的消息
      const converDefaultRead = bizParams.is_default_read;
      let calcuUnReadCount = unReadCount;
      if (!converDefaultRead && from?.userId !== myUserId) {
        calcuUnReadCount = unReadCount + 1;
      }
      newConvers[matchIndex] = {
        ...matchItem,
        unReadCount: calcuUnReadCount,
        lastMsgId: msgId,
        lastMsgContentType: msgType,
        lastMsg,
        gmtModified: new Date().valueOf(),
        bizParams: { ...bizParams, is_hidden: '0' },
      };
      if (bizParams.is_hidden === '1') {
        sdk.addConversationUserMark({
          cid,
          marks: [{ propertyName: 'is_hidden', propertyValue: 0 }],
        });
      }
    }
    updateGlobalConverList([...newConvers]);
  };

  useEffect(() => {
    setTopModeList([]);
    refreshConverData();
    return () => {
      clearGlobalConverList();
    };
  }, []);

  useEffect(() => {
    if (newMessage && newMessage.length) {
      resolveNewMessage(newMessage);
    }
  }, [newMessage]);

  useEffect(() => {
    sdk.onMsgStatusChange = (res) => msgStatusChange(res, globalConverList);
    if (sdk && globalConverList && globalConverList.length)
      sdk.onSendMessageOk = (data) => sendMessageOk(data, globalConverList);
  }, [globalConverList]);

  useEffect(() => {
    sdk.onGroupInfoChange = (updateGroupRepones) => {
      const { cid, updateType, name, logoUrl } = updateGroupRepones;

      const newConvers = [...globalConverList];
      const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
      if (matchIndex > -1) {
        const matchItem = newConvers[matchIndex];
        if (updateType === 'name') {
          newConvers[matchIndex] = { ...matchItem, name };
        } else if (updateType === 'logo') {
          newConvers[matchIndex] = { ...matchItem, logoUrl };
        }
      }
      updateGlobalConverList([...newConvers]);
      console.log('onGroupInfoChange>>>: ', updateGroupRepones);
    };

    sdk.onConverChange = (changeInfo) => {
      // setPageIndex(1);
      refreshConverData();
      setCurrentCid(changeInfo.cid);
    };

    // return () => {
    //   removeStore('ConversationList');
    // };
  }, [sdk]);

  const conversationEdit = (action, converInfo) => {
    const { lastMsgId, cid, bizParams = {} } = converInfo;
    console.log('conversationEdit>>>', action, converInfo);
    const { val } = action;
    if (!sdk) return;
    if (val === 'allRead') {
      //消息游标已读
      sdk.changeMessagesStatus({ type: 'read', cursorMsgId: lastMsgId, cid });

      const newConvers = [...globalConverList];
      const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
      if (matchIndex > -1) {
        const matchItem = newConvers[matchIndex];
        newConvers[matchIndex] = { ...matchItem, unReadCount: 0 };
      }
      updateGlobalConverList([...newConvers]);
    }
    if (val === 'is_default_read') {
      //会话新消息默认已读
      const newDefaultReadState = !bizParams.is_default_read;
      sdk.setConversationTag({
        cid,
        type: 'is_default_read',
        value: newDefaultReadState,
      });

      const newConvers = [...globalConverList];
      const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
      if (matchIndex > -1) {
        const matchItem = newConvers[matchIndex];
        const { bizParams = {} } = matchItem;
        newConvers[matchIndex] = {
          ...matchItem,
          bizParams: { ...bizParams, is_default_read: newDefaultReadState },
        };
      }
      updateGlobalConverList([...newConvers]);
    }

    if (val === 'remove') {
      sdk
        .addConversationUserMark({
          cid,
          marks: [{ propertyName: 'is_hidden', propertyValue: 1 }],
        })
        .then((res) => {
          if (res?.errorMessage) {
            Message.error(res.errorMessage);
            return;
          }

          const newConvers = [...globalConverList];
          updateGlobalConverList([
            ...newConvers.filter((item) => item.cid !== cid),
          ]);
        });

      onCidChange(null);
    }
  };

  const toChatPage = (cid: string) => {
    setCurrentCid(cid);
    onCidChange(cid);
  };

  const handleToggleShieldMode = async (cid, rowData) => {
    if (!rowData.shieldMode) {
      // 设置免打扰
      rowData.shieldMode = true;
      await sdk.addConversationToGroups({ cid, groupId: shieldModeId });
      console.log(
        globalConverList.map((item) => (item.cid === cid ? rowData : item)),
      );

      const newConvers = [...globalConverList];
      updateGlobalConverList(
        newConvers.map((item) => (item.cid === cid ? rowData : item)),
      );
    } else {
      // 取消免打扰
      rowData.shieldMode = false;
      await sdk.removeConversationFromGroups({ cid, groupId: shieldModeId });

      const newConvers = [...globalConverList];
      updateGlobalConverList(
        newConvers.map((item) => (item.cid === cid ? rowData : item)),
      );
    }
  };

  const handleToggleStayTop = async (cid, rowData) => {
    if (!rowData.topMode) {
      // 置顶
      rowData.topMode = true;
      await sdk.addConversationToGroups({ cid, groupId: topModeId });

      const newConvers = [...globalConverList];
      updateGlobalConverList([
        rowData,
        ...newConvers.filter((item) => item.cid !== cid),
      ]);
      setTopModeList([...topModeList, rowData]);
    } else {
      // 取消置顶
      rowData.topMode = false;
      await sdk.removeConversationFromGroups({ cid, groupId: topModeId });

      const newConvers = [...globalConverList];
      updateGlobalConverList([
        ...newConvers.filter((item) => item.cid !== cid),
        rowData,
      ]);
      setTopModeList((converList) => {
        return converList.filter((item) => item.cid !== cid);
      });
    }
  };

  const handleRemoveConversation = async (cid) => {
    const res = await sdk.addConversationUserMark({
      cid,
      marks: [{ propertyName: 'is_hidden', propertyValue: 1 }],
    });
    if (res?.errorMessage) {
      Message.error(res.errorMessage);
      return;
    }

    const newConvers = [...globalConverList];
    updateGlobalConverList(newConvers.filter((item) => item.cid !== cid));

    onCidChange(null);
  };

  const handleCollectionOk = async (tagCodes) => {
    try {
      await sdk.collectSession({ cid: currentCid, tagCodes });
      Message.success('标记成功');
      setTagModalVisible(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCollect = (cid: string) => {
    setCurrentCid(cid);
    setTagModalVisible(true);
  };

  const createConverOpesationAction = (cid: string, conver: any) => {
    console.log('cid==========',cid)
    return (
      <Menu>
        {[
          {
            label: conver.topMode ? '取消置顶' : '置顶会话',
            key: 'stayTop',
            onClick: () => handleToggleStayTop(cid, conver),
          },
          // {
          //   label: '标签',
          //   key: 'setTag',
          //   onClick: () => handleCollect(cid),
          // },
          {
            label: '移除会话',
            key: 'remove',
            onClick: () => handleRemoveConversation(cid),
          },
          {
            label: conver.shieldMode ? '取消免打扰' : '消息免打扰',
            key: 'setShildMode',
            onClick: () => handleToggleShieldMode(cid, conver),
          },
        ].map((item) => (
          <Menu.Item key={item.key} onClick={item.onClick}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const renderRow = (rowData) => {
    const { cid, bizParams = {} } = rowData;
    const { is_default_read } = bizParams;

    return (
      <List.Item>
        <Skeleton loading={loading} paragraph={{ rows: 1 }} active avatar>
          <ChatInboxCard
            key={cid}
            onCardClicked={() => toChatPage(cid)}
            {...rowData}
            isDefaultRead={is_default_read}
            currentCid={currentCid}
            editFunc={(action) => conversationEdit(action, rowData)}
            dropdownMenu={createConverOpesationAction(cid, rowData)}
          />
        </Skeleton>
      </List.Item>
    );
  };

  return (
    <>
      <div id="scrollableDiv" style={{ height: '100%', overflow: 'auto' }}>
        <InfiniteScroll
          dataLength={globalConverList.length}
          next={() => getConver(pagination.pageIndex + 1, false)}
          hasMore={pagination.totalPage > pagination.pageIndex}
          loader={<div style={{ textAlign: 'center' }}>加载中...</div>}
          scrollableTarget="scrollableDiv"
        >
          <List
            className="converList"
            rowKey="cid"
            dataSource={globalConverList.filter(
              (item) => item.bizParams?.is_hidden !== '1',
            )}
            renderItem={renderRow}
            loadMore={pagination.pageIndex < pagination.totalPage}
          />
        </InfiniteScroll>
      </div>
      {tagModalVisible && (
        <TagModal
          onClose={() => setTagModalVisible(false)}
          onOk={handleCollectionOk}
        />
      )}
    </>
  );
};

export default ConverList;
