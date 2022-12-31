import React from 'react';
import { useModel } from 'umi';
import { useState } from 'react';
import { Badge } from 'antd';
import { ThunderboltFilled } from '@ant-design/icons';

import { ContentType, StrongRemainderReplyContent, MsgTypeMap } from '@/constants';
import MessageContent from './index';

import './style.less';

export default function(props) {
  const { mySdkStore, sdk } = useModel('global');
  const [visible, setVisible] = useState(false);
  // todo: 自定义
  // const replyContent = [...StrongRemainderReplyContent, '自定义...'];
  const replyContent = StrongRemainderReplyContent;
  const { onSendMessageOk, msgContent, msgId, from, componentDisplaySource = 'chatDetail' } = props;

  const renderReplySourceContent = (contentData) => {
    // 兼容onSendMessageOk数据来源和queryHistoryMessage数据不同
    let msgType = contentData.sourceContentType;
    const sourceContent = contentData.sourceMessageContent || contentData.sourceContent;

    if (typeof msgType === 'number') {
      msgType = MsgTypeMap[msgType]?.toLowerCase();
    }

    let lastMsg = '';
    switch (msgType) {
      case 'text':
        lastMsg = <MessageContent type={msgType} msgContent={{ text: contentData.content }} />
        break;
      case 'face':
        if (!sourceContent.iconUrl) {
          sourceContent.iconUrl = mySdkStore.emojiList.find(({ globalUniqueId }) => globalUniqueId === sourceContent.iconId)?.url;
        }
        lastMsg = <MessageContent type={msgType} msgContent={sourceContent} from={props.from} />
        break;
      default:
        lastMsg = <MessageContent type={msgType} msgContent={sourceContent} from={props.from} />
        break;
    }
    return lastMsg;
  }

  const handleReply = async (item) => {
    const msgBody = {
      msgType: ContentType.Text,
      msgContent: { value: item },
      quoteMessageId: msgId
    };
    const msgParams = sdk.messageBuilder(msgBody);
    const sendRes = await sdk.sendMessage(msgParams);
    sendRes.quoteReplyInfo = {
      quoteMessageId: sendRes.quoteMessageId,
      quoteMessageContent: msgContent,
      quoteMessageContentType: ContentType.StrongReminder,
    }
    onSendMessageOk(sendRes);
    setVisible(false);
  }

  return (<>
    <div className="strongRemainerComponent">
      <Badge color="#0091FF" style={{ '--top': '-10px', '--right': '-10px' }} content={<ThunderboltFilled style={{ color: '#fff' }} />}>
          <div className="content">
            { renderReplySourceContent(msgContent) }
          </div>
          { from?.userId !== mySdkStore.mockConfig.userId && componentDisplaySource === 'chatDetail' &&
            <div className="replyBtn" onClick={() => { setVisible(true) }}>
              快速回复
            </div>
            }
      </Badge>
    </div>
    {/* <Popup visible={visible} className="dingReplyPopoverComponent">
      <div>
        <div className="btnsTitle">
          选择回复内容
        </div>
        {replyContent.map((item) =>
          <div className="btnBar" key={item} onClick={() => handleReply(item)}>{ item }</div>
        )}
        <div className="cancelBar" onClick={() => setVisible(false)}>
          取消
        </div>
      </div>
    </Popup> */}
    </>
  )
}