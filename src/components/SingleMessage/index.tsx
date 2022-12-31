import React, { useState } from 'react';
import ChatRecord from './ChatRecord';
import Reply from './Reply';
import Recall from './Recall';
import Text from './Text';
import Url from './Url';
import Image from './Image';
import Face from './Face';
import Custom from './Custom';
import File from './File';
import Rtc from './Rtc';
import StrongReminder from './StrongReminder';
import Voice from './Voice';
import Video from './Video';
import Location from './Location';
import { useModel } from 'umi';

import { ContentType } from '../../constants';

// const getList = async () => await sdk.queryMessageReadOrUnReadUsers({
//   cid: "S0190342975916711706044020000000",
//   messageId: "437398166849996800",
//   status: 1,
//   pageIndex: 1,
// });

export default function MessageContent(props) {
  const { sdk } = useModel('global');

  let { type, ...restProps } = props;
  // getList();
  if (restProps?.quoteReplyInfo?.quoteMessageId && type === ContentType.Text) {
    type = 'reply';
  }

  if (restProps.isLocalFailed) {
    // 待chatDetail中合并过来后处理发送失败样式
  }

  // console.log(res, ';p;ppp;');

  switch (type?.toLowerCase()) {
    case ContentType.Text:
      return <Text {...restProps} />;
    case ContentType.Url:
      return <Url {...restProps} />;
    case ContentType.Voice:
      return <Voice {...restProps} />;
    case ContentType.Image:
      return <Image {...restProps} />;
    case ContentType.Custom:
      return <Custom {...restProps} />;
    case ContentType.Face:
      return <Face {...restProps} />;
    case ContentType.Merged:
      return <ChatRecord {...restProps} />;
    case ContentType.File:
      return <File {...restProps} />;
    case ContentType.Rtc:
      return <Rtc {...restProps} />;
    case ContentType.StrongReminder:
      return <StrongReminder {...restProps} />;
    case ContentType.Video:
      return <Video {...restProps} />;
    case ContentType.Location:
      return <Location {...restProps} />;
    case 'reply':
      return <Reply {...restProps} />;
    case 'recall':
      return <Recall {...restProps} />;
    default:
      return <>{props.children || ''}</>;
  }
}
