import React from 'react';
import { useState } from 'react';
import { useModel } from 'umi';

import { resolveCustomMsgFormContent } from '../../utils';
// import ReplyList from '@/components/ReplyList';
import { MsgTypeMap } from '@/constants';

import './style.less';

const renderReplySourceContent = (msgType, quoteReplyInfo) => {
  const content =
    quoteReplyInfo.quoteMessageContent || quoteReplyInfo.sourceMessageContent;

  let lastMsg = '';

  switch (msgType?.toLowerCase()) {
    case 'rtc':
      lastMsg =
        content && content.rtcAction === 'invite'
          ? '发起实时音视频邀请'
          : '收到实时音视频邀请';
      break;
    case 'text':
      console.log(content, '好烦好烦好烦好烦哈哈');

      if (content?.iconUrl) {
        lastMsg = (
          <img
            src={content.iconUrl}
            alt="emoji"
            style={{ width: '24px', height: '24px' }}
          />
        );
        return;
      }
      lastMsg = content.text || content.content || content.m;
      break;
    case 'url':
      lastMsg = `[链接]${content.title}`;
      break;
    case 'image':
      lastMsg = `[图片]`;
      break;
    case 'custom':
      if (content?.dataType == 'meetingCard') {
        lastMsg = '会议邀请';
      } else {
        lastMsg = resolveCustomMsgFormContent(content.dataType, content);
      }
      break;
    case 'file':
      lastMsg = `[文件]`;
      break;
    case 'video':
      lastMsg = `[视频]`;
      break;
    case 'strong_reminder': {
      let subType = quoteReplyInfo.quoteMessageContent?.sourceContentType;
      if (typeof subType === 'number')
        subType =
          MsgTypeMap[quoteReplyInfo.quoteMessageContent.sourceContentType];
      lastMsg = renderReplySourceContent(subType, {
        quoteMessageContent:
          quoteReplyInfo.quoteMessageContent?.sourceMessageContent,
      });
      break;
    }
    case 'voice':
      lastMsg = `[语音]`;
      break;
    case 'robot':
      lastMsg = `[机器人]`;
      break;
    case 'face':
      lastMsg = (
        <img
          src={content.iconUrl}
          alt="emoji"
          style={{ width: '24px', height: '24px' }}
        />
      );
      break;
    case 'merged':
      lastMsg = `[${content.msgTitle}]`;
      break;
    default:
      break;
  }
  return lastMsg;
};

export default function (props) {
  const { quoteReplyInfo, msgContent } = props;
  const [replyListProps, setReplyListProps] = useState({});

  const showTopicList = () => {
    setReplyListProps({
      ...replyListProps,
      visible: true,
      ...props,
      quotedInfo: quoteReplyInfo,
    });
  };

  // const handleReplyListClose = () => {
  //   setReplyListProps({
  //     visible: false,
  //   });
  // }
  const { userInfo, sdk } = useModel('global');
  let { userId } = userInfo;
  let { text = '' } = props.msgContent;
  let newStr = '';
  if (props?.atUsers?.length) {
    let chat;
    props?.atUsers.forEach((x, i) => {
      if (x.userId == userId) {
        chat = i;
      }
    });
    if (chat != undefined) {
      let index = 0;
      newStr = text.replace(/,/g, ' ').replace(/@(\S+)/g, (str) => {
        let p;
        if (props?.atUsers[index]?.userId == userId) {
          p = `<a class="at hightColor">${str}</a>`;
          index++;
        } else {
          p = `<a class="at">${str}</a>`;
          index++;
        }
        return p;
      });
    } else {
      if (props?.from?.userId == userId) {
        // debugger
        let index = 0;
        // newStr = text.replace(/,/g, ' ').replace(/@(\S+)/g, `<a class="at">@$1</a>`);
        newStr = text.replace(/,/g, ' ').replace(/@(\S+)/g, (str) => {
          // if (props?.bizParams) {

          let p;
          console.log(props, 'p - r - o - p - s');
          if (props?.atUsers[index]?.userId == '__at_all__') {
            index++;
            return (p = `<a class="at">${str}</a>`);
          }
          if (props?.atUsers[index].extInfo?.at_user_read_status == 1) {
            p = `<a class="at">${str}</a><span class="newRead"></span>`;
            index++;
          } else {
            p = `<a class="at">${str}</a><span class="unRead"></span>`;
            index++;
          }
          return p;
        });
      } else {
        newStr = text
          .replace(/,/g, ' ')
          .replace(/@(\S+)/g, `<a class="at">@$1</a>`);
      }
    }
  } else {
    newStr = text.replaceAll(/@.+\s/g, (str) => `<a>${str}</a>`);
  }

  const html = newStr;

  return (
    <div className="replyComponent">
      <div className="resourceMessage">
        <span onClick={showTopicList}>
          {renderReplySourceContent(
            quoteReplyInfo.quoteMessageContentType,
            quoteReplyInfo,
          )}
        </span>
      </div>
      {/* <div className="content">{msgContent?.text}</div> */}
      <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
      {/* { replyListProps.visible && <ReplyList {...replyListProps} onClose={handleReplyListClose} /> } */}
    </div>
  );
}
