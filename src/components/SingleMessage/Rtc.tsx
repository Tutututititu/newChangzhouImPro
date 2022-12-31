import React from 'react';
import { useModel } from 'umi';
import { PhoneOutlined } from '@ant-design/icons';

import './style.less';
import moment from 'moment';

const paddingZone = (number) => {
  return `${number}`.padStart(2, '0').substring(0, 2);
};

const renderTimeDiff = ({ seconds, minutes, hours }) => {
  if (hours) {
    return `${paddingZone(hours)}:${paddingZone(minutes)}:${paddingZone(
      seconds,
    )}`;
  } else {
    return `${paddingZone(minutes)}:${paddingZone(seconds)}`;
  }
};

export default function (props) {
  console.log('props====', props);
  const {
    userInfo: { userId: myUserId },
  } = useModel('global');
  const { rtcAction, invitedUserRejected, rtcRoomInfo, rtcType } =
    props.msgContent || {};
  const { nickName, userId } = props.from || {};
  const to = props.to || {};
  const toUserName = to.nickName ? to.nickName : '';

  const renderText = () => {
    const actionUserText = myUserId === userId ? '你' : '对方';

    if (invitedUserRejected) {
      return `${myUserId === userId ? '对方' : '你'}已拒绝`;
    }
    // if (rtcRoomInfo && !rtcRoomInfo.closeTime) {
    //   return `${actionUserText}已取消`;
    // }
    // rtcAction "hangup" 已挂断
    // if (rtcRoomInfo?.closeTime && rtcRoomInfo?.createTime) {
    //   const duration = moment.duration(
    //     rtcRoomInfo.closeTime - rtcRoomInfo.createTime,
    //   );
    //   // @ts-ignore
    //   const { seconds, minutes, hours } = duration._data;
    //   return `通话时长 ${renderTimeDiff({ seconds, minutes, hours })}`;
    // }

    if (rtcAction === 'invite') {
      return rtcType == 1
        ? `${actionUserText}发起音频邀请`
        : `${actionUserText}发起音视频邀请`;
    }

    if (rtcAction === 'receiveInvite') {
      return rtcType == 1
        ? `收到${nickName || toUserName}发起的音频邀请`
        : `收到${nickName || toUserName}发起的音视频邀请`;
    }
  };

  return (
    <div className="rtcComponent">
      <PhoneOutlined style={{ marginRight: 8, fontSize: 16 }} />
      {renderText()}
    </div>
  );
}
