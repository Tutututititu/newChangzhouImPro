import React, { useState, useEffect, useRef } from 'react';
import { history, useModel } from 'umi';
import { Checkbox, List, Popover, message as Message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import './style.less';
import PubSub from 'pubsub-js';
import BottomInputBar from '@/components/BottomInputBar';
import TopOperationvBar from '@/components/TopOperationvBar';
import MessageOperations from '@/components/MessageOperations';
import SelectorOperationsBar from '@/components/SelectorOperationsBar';
import SingleMessage from '@/components/SingleMessage';
import MessageReadedStatistic from '@/components/MessageReadedStatistic';
import ChatGroupNotice from '@/components/ChatGroupNotice';
import ReplyListDrawer from '@/components/ReplyListDrawer';
import EmoReplyBar from '@/components/EmoReplyBar';
import AvatarImage from '@/components/AvatarImage';
import UserMoreCard from '../../../components/UseMsgCard/useMsgCard';

import {
  ChangeMessagesStatus,
  CustomDataType,
  MessageDataChangeType,
  ConversationType,
} from '@/constants';

import { MessaageInChatBox } from '@/typings/chat';

export default function (props) {
  let { cid, toChangeGroupName } = props;
  useEffect(() => {
    scrollToBottom(true);
    return () => {
      PubSub.unsubscribe('clearMsg');
      PubSub.unsubscribe('chehuiToo');
    };
  }, []);

  const {
    sdk,
    userInfo,
    newMessage,
    globalConverList,
    updateGlobalConverList,
    setPagePath,
    webMeeting,
  } = useModel('global');
  const { userId: myUserId } = userInfo;
  // const { onNewConferenceInviteMessage } = useModel('conferenceModal');
  const anchorRef = useRef(null);
  sdk.onMsgStatusChange = (res) => {
    sdk.setCurrentCid(cid).then(async (currentConverInfo: any) => {
      setConverInfo(currentConverInfo);
      setBottomInputBarProps({
        // ...bottomInputBarProps,
        visible: currentConverInfo.type !== ConversationType.Notify,
        isVedioEnable: true,
        isStrech: false,
        cid,
        replyProps: null,
        converInfo: currentConverInfo,
      });

      const cursorMsgId =
        history.location?.state?.msgId || currentConverInfo.lastMsgId;
      await getHistoryMessages(cursorMsgId, { newPage: true });
      scrollToBottom(true);
      // 兼容图片加载完后的高度
      // setTimeout(() => scrollToBottom('instant'), 1500);
      if (currentConverInfo.notice) {
        setGroupNoticeProps({
          visible: true,
          notice: currentConverInfo.notice,
          onClose: () => setGroupNoticeProps({ visible: false }),
        });
      }
    });
  };
  const [pagination, setPagination] = useState({
    currentCursorId: 0,
    nextCursorId: 0,
  });
  const [messageList, setMessageList] = useState<MessaageInChatBox[]>([]);
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [converInfo, setConverInfo] = useState<MessaageInChatBox>({});
  const [bottomInputBarProps, setBottomInputBarProps] = useState({
    visible: false,
    isVedioEnable: true,
    isStrech: false,
    cid,
    replyProps: null,
    converInfo: {},
  });
  const [replyListProps, setReplyListProps] = useState({ visible: false });
  const [groupNoticeProps, setGroupNoticeProps] = useState({ visible: false });
  const [messageReadedStatisticVisibleId, setMessageReadedStatisticVisibleId] =
    useState('');

  const scrollToBottom = (flage = false) => {
    if (flage) {
      setTimeout(() => {
        // anchorRef.current.style.scrollBehavior = 'smooth';
        try {
          anchorRef.current.scrollTop = anchorRef?.current?.scrollHeight;
        } catch (e) {
          console.log(e);
        }
      }, 500);
    }
    // setTimeout(
    //   () => {
    //     anchorRef.current?.scrollIntoView({
    //       behavior,
    //       block: 'end',
    //       inline: 'center',
    //     });
    //   },
    //   behavior === 'smooth' ? 200 : 0,
    // );
  };

  const getHistoryMessages = async (
    cursorId = pagination.nextCursorId,
    { newPage = false } = {},
  ) => {
    if (!cursorId) {
      return;
    }
    const res = await sdk.getHistoryMessages({ cid, pageSize: 20, cursorId });
    const { list, next } = res;
    setPagination({ currentCursorId: cursorId, nextCursorId: next });
    if (list && list.length) {
      const unReadMsgs = list
        .filter((msg) => !msg.isRead && msg.from?.userId !== myUserId)
        .map((item) => ({ msgId: item.msgId, localMsgId: item.localMsgId }));
      if (unReadMsgs.length) {
        const matchIndex = globalConverList.findIndex(
          (conver) => conver.cid === cid,
        );
        // 更新会话列表unReadCount
        if (matchIndex >= 0) {
          const newConvers = [...globalConverList];
          const matchItem = newConvers[matchIndex];
          const { unReadCount, bizParams } = matchItem;
          if (!bizParams.is_default_read) {
            newConvers[matchIndex].unReadCount =
              unReadCount - unReadMsgs.length;
          }
          updateGlobalConverList([...newConvers]);
        }
        // 数据拉取后设置已读，更精细的处理模式是滚动已读
        sdk.changeMessagesStatus({ cid, type: 'read', msgIds: unReadMsgs });
      }
    }
    setMessageList((currentMessageList) =>
      cursorId === converInfo.lastMsgId || newPage
        ? list
        : [...list, ...currentMessageList],
    );
  };

  const onSendMessageOk = (messageData) => {
    console.log(messageData, 'm - e - s - s - a - g - e');

    console.log('onSendMessageOk==进入===', onSendMessageOk);
    if (messageData.cid !== cid) {
      return;
    }
    setMessageList((currentMessageList) => {
      let sdkList = currentMessageList;
      if (currentMessageList.length) {
        if (
          currentMessageList[currentMessageList.length * 1 - 1].msgId ==
          messageData.msgId
        ) {
          sdkList = currentMessageList.splice(
            0,
            currentMessageList.length * 1 - 1,
          );
        }
      }
      let list = [...sdkList, { ...messageData, from: userInfo }];

      return list;
    });

    scrollToBottom(true);
    if (messageData.quoteMessageId) {
      const addQouteCount = (item) => {
        if (item.quotedInfo) {
          item.quotedInfo.replyCounter += 1;
        } else {
          item.quotedInfo = {
            beQuoted: true,
            replyCounter: 1,
            topicId: messageData.quoteMessageId,
          };
        }
        return item;
      };
      setMessageList((currentMessageList) =>
        currentMessageList.map((item) =>
          item.msgId === messageData.quoteMessageId
            ? addQouteCount(item)
            : item,
        ),
      );
      setBottomInputBarProps({ ...bottomInputBarProps, replyProps: null });
    }

    // 列表移除的会话，在发送消息和接收到消息的时候需要再次展示
    if (converInfo.bizParams?.is_hidden === '1') {
      sdk.addConversationUserMark({
        cid,
        marks: [{ propertyName: 'is_hidden', propertyValue: 0 }],
      });
    }
  };

  const onSendMessageFail = (messageData) => {
    setMessageList((currentMessageList) => [
      ...currentMessageList,
      { ...messageData, msgId: messageData.localMsgId, isLocalFailed: true },
    ]);
  };

  const resolveNewMessage = (currentCid, messageData: any) => {
    console.log('onNewMessage by sendMessage', messageData);

    if (!currentCid) return;
    const newMessageList = messageData.filter(
      (item) => item.cid === currentCid,
    );

    if (newMessageList && newMessageList.length) {
      setMessageList((currentMessageList) => [
        ...currentMessageList,
        ...newMessageList,
      ]);
      sdk.changeMessagesStatus({
        cid,
        type: 'read',
        msgIds: newMessageList.map((item) => ({
          msgId: item.msgId,
          localMsgId: item.localMsgId,
        })),
      });
      scrollToBottom(true);
    }
  };

  const onMsgStatusChange = (messageData) => {
    console.log('onMsgStatusChange', messageData);
    if (messageData.msgStateChangeType == 'deleteFromCursor') {
      return setMessageList([]);
    }
    const { msgIds, readStatusInfosList, readStatusInfo } = messageData;
    const isMatch = (msgId) => !!msgIds.find((mid: string) => msgId === mid);
    if (messageData.msgStateChangeType === ChangeMessagesStatus.Read) {
      setMessageList((currentMessageList) => {
        return currentMessageList.map((item) => {
          if (isMatch(item.msgId)) {
            //群消息需要更新newReadStatusVO展示具体已读人数
            let matchRvo = readStatusInfo || {};
            if (readStatusInfosList && readStatusInfosList.length) {
              matchRvo = readStatusInfosList.find(
                (rvo: any) => rvo.messageId === item.msgId,
              );
            }
            const newReadStatusVO = Object.assign(
              {},
              item.readStatusVO,
              matchRvo,
            );
            item.readStatusVO = newReadStatusVO;
            item.isRead = true;
          }
          return item;
        });
      });
    } else if (messageData.msgStateChangeType === ChangeMessagesStatus.Recall) {
      setMessageList((currentMessageList) => {
        return currentMessageList.map((item) => {
          if (isMatch(item.msgId)) {
            item.isRecall = true;
          }
          return item;
        });
      });
    } else if (messageData.msgStateChangeType === ChangeMessagesStatus.Delete) {
      setMessageList((currentMessageList) => {
        return currentMessageList.map((item) => {
          if (isMatch(item.msgId)) {
            item.isDelete = true;
          }
          return item;
        });
      });
    }
  };

  const onRtcHangup = (messageData) => {
    setMessageList((currentMessageList) => {
      return currentMessageList.map((item) => {
        if (item.roomId === messageData.roomId) {
          item.msgContent.rtcAction = 'hangUp';
          item.msgContent.rtcRoomInfo = {
            createTime: item.createTime,
            closeTime: messageData.closeTime,
          };
          item.msgContent.invitedUserRejected =
            messageData.invitedUserRejected || false;
        }
        return item;
      });
    });
  };

  const onMsgDataChange = (messageData) => {
    if (messageData.type === MessageDataChangeType.AddInstantReplyFace) {
      setMessageList((currentMessageList) => {
        return currentMessageList.map((item) => {
          if (item.msgId === messageData.msgId) {
            return {
              ...item,
              instantReplyFaceInfos: item.instantReplyFaceInfos?.length
                ? item.instantReplyFaceInfos.concat([messageData.data])
                : [messageData.data],
            };
          } else {
            return item;
          }
        });
      });
    }
  };

  useEffect(() => {
    sdk.onSendMessageFail = onSendMessageFail;
    console.log(newMessage, '11122');

    // sdk.onMsgStatusChange = (res) => msgStatusChangffffff(res, globalConverList);
    if (newMessage && newMessage.length) {
      // if (newMessage[0]?.quoteReplyInfo?.quoteMessageContent?.text) {
      //   resolveNewMessage(cid, newMessage);
      // } else {
      resolveNewMessage(cid, newMessage);
      // }
    }
    // sdk.onNewMessage = (messageData) => {
    //   onNewConferenceInviteMessage(messageData);
    //   onNewMessage(messageData);
    // };
    // todo: sdk监听方法onSendMessageOk的参数没有格式化，与单条数据格式不一致
    // sdk.onSendMessageOk = onSendMessageOk;

    // return () => {
    // removeStore('ChatDetail');
    // sdk.onNewMessage = onNewConferenceInviteMessage;
    // };
  }, [newMessage]);
  // const msgStatusChangffffff = (res, val) => {
  //   alert('ooooo')
  // }
  useEffect(() => {
    PubSub.subscribe('clearMsg', (res, val) => {
      if (cid == val) {
        setMessageList([]);
      }
    });
    PubSub.subscribe('chehuiToo', (_, val) => {
      if (val?.msgStateChangeType == 'recall') {
        setMessageList((currentMessageList) => {
          return currentMessageList.map((item) => {
            if (item.msgId === val.msgId) {
              item.isRecall = true;
            }
            return item;
          });
        });
      }
    });
    sdk.onMsgStatusChange = onMsgStatusChange;
    sdk.onMsgDataChange = onMsgDataChange;
    sdk.setCurrentCid(cid).then(async (currentConverInfo: any) => {
      if (currentConverInfo.notice) {
        setGroupNoticeProps({
          visible: true,
          notice: currentConverInfo.notice,
          onClose: () => setGroupNoticeProps({ visible: false }),
        });
      } else {
        setGroupNoticeProps({ visible: false });
      }
      setConverInfo(currentConverInfo);
      setBottomInputBarProps({
        // ...bottomInputBarProps,
        visible: currentConverInfo.type !== ConversationType.Notify,
        isVedioEnable: true,
        isStrech: false,
        cid,
        replyProps: null,
        converInfo: currentConverInfo,
      });

      const cursorMsgId =
        history.location?.state?.msgId || currentConverInfo.lastMsgId;
      await getHistoryMessages(cursorMsgId, { newPage: true });
      scrollToBottom(true);
      // 兼容图片加载完后的高度
      // setTimeout(() => scrollToBottom('instant'), 1500);
      sdk.changeMessagesStatus({
        type: 'read',
        cursorMsgId:
          history.location?.state?.msgId || currentConverInfo.lastMsgId,
        cid,
      });
      PubSub.publish('getNewList');
    });
  }, [cid]);

  const handleMulitDeleteOk = (messageIds) => {
    setMessageList((currentMessageList) => {
      return currentMessageList.map((item) => {
        if (messageIds.indexOf(item.msgId) > -1) {
          item.isDelete = true;
        }
        return item;
      });
    });
    setIsMultiSelecting(false);
    setSelectedMessages([]);
  };

  const handleReply = (msg: any) => {
    setBottomInputBarProps({
      ...bottomInputBarProps,
      replyProps: msg,
    });
  };

  const handleReEdit = (text) => {
    setBottomInputBarProps({
      ...bottomInputBarProps,
      reEditProps: { message: text },
    });
  };

  const handleShowReply = (messageData) => {
    setReplyListProps({
      ...replyListProps,
      visible: true,
      ...messageData,
    });
  };

  const handleReplyListClose = () => {
    setReplyListProps({
      visible: false,
    });
  };

  const onRecallOk = (messageData) => {
    setMessageList((currentMessageList) => {
      return currentMessageList.map((item) => {
        if (item.msgId === messageData.msgId) {
          item.isRecall = true;
        }
        return item;
      });
    });
  };

  // const onDeleteOK = (messageData) => {
  //   setMessageList(currentMessageList => {
  //     return currentMessageList.map((item) => {
  //       if (item.msgId === messageData.msgId) {
  //         item.isDelete = true;
  //       }
  //       return item;
  //     });
  //   });
  // }
  const [addUserId, setaddUserId] = useState('none');
  const [showUserMoreCard, setShowUserMoreCard] = useState(false);
  useEffect(() => {
    if (addUserId == 'none') return;
    if (addUserId == '') {
      Message.error('userId为空');
      return;
    }
    handleOk(addUserId);
  }, [addUserId]);
  const handleOk = async (value) => {
    try {
      await sdk.addFriend({ invitedUserId: value });
    } catch (e) {
      Message.error(e.errorMessage || e.message);
      return;
    }
    Message.success('好友请求已发送');
  };

  const onAddEmojiReply = ({ msgId, instantReplyFaceInfo }) => {
    const addEmoji = (messageData) => {
      if (messageData.instantReplyFaceInfos) {
        messageData.instantReplyFaceInfos.push(instantReplyFaceInfo);
      } else {
        messageData.instantReplyFaceInfos = [instantReplyFaceInfo];
      }
      return messageData;
    };
    setMessageList(
      messageList.map((item) => (item.msgId === msgId ? addEmoji(item) : item)),
    );
  };

  const messageOperationsProps = {
    cid,
    onReply: handleReply,
    onMultiSelect: () => setIsMultiSelecting(true),
    onLater: () => {},
    onRecall: onRecallOk,
    onDelete: (res) => delMsg(res),
    onAddEmojiReply: onAddEmojiReply,
    onRtc: () => {},
    onSendMessageOk,
  };
  const delMsg = (res) => {
    handleMulitDeleteOkss(res);
  };
  const handleMulitDeleteOkss = (messageData) => {
    setMessageList((currentMessageList) => {
      return currentMessageList.map((item) => {
        if (item.msgId === messageData.msgId) {
          item.isDelete = true;
        }
        return item;
      });
    });
  };
  let [open, setOpen] = useState(false);

  const successMsg = () => {
    Message.success('删除成功');
    setOpen(false);
  };
  const handleOpenChange = () => {
    setOpen(!open);
  };
  const singleMessageProps = {
    onSendMessageOk,
  };

  const openMsg = async (val) => {
    console.log(val, 'pp');

    try {
      const res = await sdk.createConversation({
        type: 'single',
        subUserId: useData.userId,
      });
      console.log(res, 'pppp');
      setPagePath({ activeIcon: 'chat', cid: res.cid });
    } catch (e) {
      Message.error('操作失败');
    }
  };
  const renderMessage = (item) => {
    console.log(item, 'po1p');

    const { msgId, from, isDelete, isRecall, msgContent = {} } = item;
    const isLeft = from?.userId !== myUserId;

    if (isDelete) return null;

    if (msgContent.dataType === CustomDataType.Instruction) return null;

    if (item.time) {
      return (
        <div key={msgId} className="timeBar">
          {item.time}
        </div>
      );
    }

    if (isRecall) {
      return (
        <div className="center" key={msgId}>
          <SingleMessage
            {...singleMessageProps}
            onReEdit={handleReEdit}
            {...item}
            type="recall"
          >
            {item.message}
          </SingleMessage>
        </div>
      );
    }

    const MessageContent = (
      <>
        {isMultiSelecting ? (
          <Checkbox
            className="messageSelectCheckbox"
            value={item.msgId}
            style={{
              margin: isLeft ? '12px 12px 12px 0' : '12px',
              flex: isLeft ? '0' : '1 1',
            }}
          />
        ) : (
          <div></div>
        )}
        {isLeft && (
          <Popover
            trigger="click"
            content={
              <UserMoreCard
                successMsg={successMsg}
                conversationDetail={converInfo}
                getUseDataMore={item.from?.userId}
                useDataProps={item.from}
                setaddUserId={setaddUserId}
                clickType={'goPath'}
                noShowCLose={true}
              ></UserMoreCard>
            }
          >
            <AvatarImage
              src={
                converInfo.singleSession
                  ? converInfo.subAvatarUrl
                  : item.from?.avatarUrl
              }
              userName={item.from?.userName}
              nickName={item.from?.nickName}
              userId={item.from?.userId}
              style={{ marginRight: 6, borderRadius: 8 }}
              fit="cover"
              width={40}
              height={40}
            />
          </Popover>
        )}
        <div className={!isLeft ? 'rightContent' : 'leftContent'} id={msgId}>
          {isLeft && (
            <div className="nickName">
              {item.from?.userName || item.from?.nickName || item.from?.userId}
            </div>
          )}
          <div className="messageWithOperationWrap">
            <div className="message">
              <SingleMessage
                {...singleMessageProps}
                {...item}
                type={item.msgType}
              ></SingleMessage>
              {!!item.instantReplyFaceInfos?.length && (
                <EmoReplyBar list={item.instantReplyFaceInfos} />
              )}
            </div>
            <MessageOperations
              className="messageOperationsComponent"
              {...messageOperationsProps}
              messageData={item}
              converInfo={converInfo}
            />
          </div>
          <div className="bottomInfo">
            {item.quotedInfo?.beQuoted && (
              <a
                style={{ marginRight: 8 }}
                onClick={() => handleShowReply(item)}
              >
                {item.quotedInfo.replyCounter}条回复
              </a>
            )}
            {!!item.privateUsers?.length && (
              <span style={{ marginRight: 8 }}>
                <LockOutlined /> 仅你和被指定的人能看到
              </span>
            )}
            {!isLeft &&
              converInfo.type === ConversationType.Single &&
              (item.isRead ? (
                <span className="haveReadMark read">已读</span>
              ) : (
                <span className="haveReadMark unread">未读</span>
              ))}
            {!isLeft && converInfo.type === ConversationType.Group && (
              <MessageReadedStatistic
                visible={msgId === messageReadedStatisticVisibleId}
                cid={cid}
                messageId={msgId}
                onClose={() => setMessageReadedStatisticVisibleId('')}
              >
                {item.readStatusVO?.allRead ? (
                  <span
                    className="haveReadMark read"
                    onClick={() => setMessageReadedStatisticVisibleId(msgId)}
                  >
                    全部已读
                  </span>
                ) : (
                  <span
                    className="haveReadMark unread"
                    onClick={() => setMessageReadedStatisticVisibleId(msgId)}
                  >
                    {item.readStatusVO?.unReadUserCount ||
                      item.readStatusVO?.totalUnReadUserCount ||
                      converInfo?.memberCount - 1}
                    人未读
                  </span>
                )}
              </MessageReadedStatistic>
            )}
          </div>
        </div>
        {!isLeft && (
          <AvatarImage
            src={item.from?.avatarUrl}
            userName={item.from?.userName}
            nickName={item.from?.nickName}
            userId={item.from?.userId}
            style={{ marginRight: 18, marginTop: 16, borderRadius: 8 }}
            fit="cover"
            width={40}
            height={40}
          />
        )}
      </>
    );

    if (isLeft) {
      return (
        <div key={item.msgId} className="leftWrap">
          <div className="left">{MessageContent}</div>
        </div>
      );
    }

    return (
      <div key={item.msgId} className="rightWrap">
        <div className="right">{MessageContent}</div>
      </div>
    );
  };

  const onConverInfoChange = (changeInfo) => {
    if (changeInfo.notice !== groupNoticeProps.notice) {
      setGroupNoticeProps({ ...groupNoticeProps, notice: changeInfo.notice });
    }
  };
  const getConverInfoChange = () => {
    sdk.setCurrentCid(cid).then(async (currentConverInfo: any) => {
      setConverInfo(currentConverInfo);
      toChangeGroupName();
    });
  };
  return (
    <div className="chatDetailPage" style={{ scrollBehavior: 'smooth' }}>
      <TopOperationvBar
        converInfo={converInfo}
        useDataProps={
          converInfo?.subUserId
            ? sdk.queryUserInfoById({
                queryUserId: converInfo?.subUserId,
              })
            : ''
        }
        onConverInfoChange={onConverInfoChange}
        getConverInfoChange={getConverInfoChange}
      />
      <Checkbox.Group
        ref={anchorRef}
        className="messageBox"
        style={{ scrollBehavior: 'smooth' }}
        value={selectedMessages}
        onChange={(val) => {
          setSelectedMessages(val);
        }}
      >
        {/* <PullToRefresh onRefresh={() => getHistoryMessages()}> */}
        {/* {messageList.map(renderMessage)} */}
        <InfiniteScroll
          style={{ width: '100%' }}
          dataLength={messageList.length}
          pullDownToRefresh={true}
          pullDownToRefreshThreshold={5}
          refreshFunction={() => getHistoryMessages()}
          pullDownToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>
              &#8595; Pull down to refresh
            </h3>
          }
          releaseToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
          }
        >
          <List
            itemLayout="horizontal"
            dataSource={messageList}
            renderItem={renderMessage}
          />
        </InfiniteScroll>

        {/* </PuuseHistoryllToRefresh> */}
        {/* </PullToRefresh> */}
        {/* <div ref={anchorRef} /> */}
      </Checkbox.Group>
      {!isMultiSelecting ? (
        <BottomInputBar
          {...bottomInputBarProps}
          converInfo={converInfo}
          onSend={onSendMessageOk}
          onRtcHangup={onRtcHangup}
        />
      ) : (
        <SelectorOperationsBar
          selectedMessages={selectedMessages}
          cid={cid}
          cname={converInfo.sessionName}
          onClose={() => {
            setIsMultiSelecting(false);
            setSelectedMessages([]);
          }}
          onDeleteOk={handleMulitDeleteOk}
        />
      )}
      {replyListProps.visible && (
        <ReplyListDrawer {...replyListProps} onClose={handleReplyListClose} />
      )}
      {groupNoticeProps.visible && <ChatGroupNotice {...groupNoticeProps} />}
    </div>
  );
}
