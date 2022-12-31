import { CustomDataType } from '../constants';
import moment from 'moment';

export const resolveCustomMsgFormContent = (customerType) => {
  switch (customerType) {
    case CustomDataType.UserCard:
      return '[个人名片]';
    case CustomDataType.RichText:
      return '[富文本]';
    default:
      return '';
  }
};

//异步加载函数
export const loadScript = (url, callback?) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = false;
  if ((script as any).readyState) {
    //IE
    (script as any).onreadystatechange = function () {
      if (
        (script as any).readyState === 'loaded' ||
        (script as any).readyState === 'complete'
      ) {
        (script as any).onreadystatechange = null;
        if (callback && typeof callback === 'function') callback();
      }
    };
  } else {
    //Others
    script.onload = function () {
      if (callback && typeof callback === 'function') callback();
    };
  }
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
};
const embellish = (val) => {
  return val.replace(/<\/br>/g, '');
};

export const resolveMsgFormContent = (msgType, content) => {
  console.log(msgType, content, ' 0 - 2 - 3');
  let lastMsg: any;
  console.log(msgType, content, 'fefefefe');
  if (msgType == '' || msgType == undefined) return lastMsg;
  switch (msgType?.toLowerCase()) {
    
    case 'rtc':
      lastMsg =
        content && content.rtcAction === 'invite'
          ? '发起实时音视频邀请'
          : '收到实时音视频邀请';
      break;
    case 'text':
      lastMsg = embellish(content.text || content.m);
      break;
    case 'url':
      lastMsg = `[链接]${content.title}`;
      break;
    case 'image':
      lastMsg = `[图片]`;
      break;
    case 'custom':
      if (content?.dataType == "meetingCard") {
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
    case 'ding':
    case 'strong_reminder':
      lastMsg = `[提醒]`;
      break;
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
    case 'location':
      lastMsg = `[位置] ${content.title}`;
      break;
    default:
      break;
  }
  return lastMsg;
};

export const getRowData = (dataBlob, sectionID, rowID) => {
  return dataBlob[sectionID][rowID];
};

export const rowHasChanged = (row1, row2) => {
  return row1 !== row2;
};

export const diffPartWithArray = (list, filterlist, sameFunc) => {
  const diffpart: Array<any> = [];
  const samepart = list.filter((i) => {
    const matchIndex = filterlist.findIndex((j) => sameFunc(i, j));
    if (matchIndex === -1) {
      diffpart.push(i);
      return false;
    }
    return true;
  });

  return {
    diffpart,
    samepart,
  };
};

export const transferFileSize = (size) => {
  const kbSize = Math.ceil(size / 1024);
  if (kbSize < 1024) {
    return `${kbSize}KB`;
  } else {
    return `${Math.ceil(kbSize / 1024)}MB`;
  }
};

export const sleep = (delay) => {
  if (typeof delay !== 'number') {
    return;
  }
  const start = +new Date();
  while (+new Date() - start < delay) {
    continue;
  }
};

export const symbolEscape = (text: string) => {
  console.log(text, '[[p[pp[');

  return text.replace(/[<>"\t&|\n\r|\r\n|\r|\n|\f|\v]/g, (match) => {
    switch (match) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      case '\n':
        return '</br>';
      case '\r':
        return '</br>';
      case '\r\n':
        return '</br>';
      // case '\n\r':
      //   return '</br>';
      // case '\t':
      //   return '</br>';
      // case '\v':
      //   return '</br>';
      // case '\f':
      //   return '</br>';
      default:
        return match;
    }
  });
};

export const globalJump = (href: string) => {
  window.location.href = `${location.pathname}${location.search}${href}`;
};

export const isHideSomeFunctions = () => {
  // 直通车不要 消息搜索不要 钉消息不要 打标收藏不要
  return location.href.indexOf('version=all') === -1;
};

export const paddingZone = (number: number) => {
  return `${number}`.padStart(2, '0').substring(0, 2);
};

export const getTimeDiff = ({
  startTime,
  endTime,
}: {
  startTime: number;
  endTime: number;
}) => {
  const duration = moment.duration(endTime - startTime);
  // @ts-ignore
  const { seconds, minutes, hours } = duration._data;

  if (hours) {
    return `${paddingZone(hours)}:${paddingZone(minutes)}:${paddingZone(
      seconds,
    )}`;
  } else {
    return `${paddingZone(minutes)}:${paddingZone(seconds)}`;
  }
};
const isAddZero = (time: string | number) => {
  let str = '';
  str = time < 10 ? '0' + time : time.toString();
  return str;
};
export const filterTime = (time: string | number | Date) => {
  const date = new Date(time);
  const Y = date.getFullYear();
  const M =
    date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const D = date.getDate();
  const H = isAddZero(date.getHours()); // 小时
  const minutes = isAddZero(date.getMinutes()); // 分钟
  const S = isAddZero(date.getSeconds()); //秒
  return {
    Y,
    M,
    D,
    H,
    minutes,
    S,
  };
};
