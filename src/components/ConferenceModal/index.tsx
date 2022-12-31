import React, { useEffect, useState } from 'react';
import { Button, Tag, message as Message } from 'antd';
import { useModel } from 'umi';
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

import { getTimeDiff } from '@/utils';
import { ContentType, RtcAction } from '@/constants';

import styles from './style.less';

import AvatarImage from '@/components/AvatarImage';

export default function () {
  const { sdk, userInfo, newMessage } = useModel('global');
  const { visible, setVisible, props, setProps } = useModel('conferenceModal');
  const myUserId = userInfo.userId;
  const { cid, from = {}, to = {}, rtcAction = '', rtcType } = props;

  const [durationTime, setDurationTime] = useState('--:--');
  const [startTime, setStartTime] = useState(0);
  let [sizePeople, setSizePeople] = useState(1);
  let timerId = null;
  const resolveNewMessage = (messageData) => {
    console.log('resolveNewMessage=====', messageData);
    if (!(messageData && messageData.length)) return;
    const rtcMessage = messageData.find(
      (msg) => msg.msgType === ContentType.Rtc,
    );
    if (
      rtcMessage &&
      rtcMessage.msgContent?.rtcAction === RtcAction.ReceiveInvite
    ) {
      let rtcType = 'VIDEO';
      if (rtcMessage.msgContent.rtcType == 'AUDIO') {
        rtcType = 'AUDIO';
      } else if (rtcMessage.msgContent.rtcType == 'VIDEO') {
        rtcType = 'VIDEO';
      }
      setProps({
        cid: rtcMessage.cid,
        from: rtcMessage.from,
        to: userInfo,
        rtcAction: RtcAction.AcceptInvite,
        rtcType,
      });
      setVisible(true);
    }
  };

  useEffect(() => {
    resolveNewMessage(newMessage);
  }, [newMessage]);

  useEffect(() => {
    if (startTime) {
      timerId = setInterval(() => {
        setDurationTime(getTimeDiff({ endTime: +new Date(), startTime }));
      }, 1000);
    }

    return () => {
      clearInterval(timerId);
    };
  }, [startTime]);

  const sendMessage = async (msgBody) => {
    console.log('cid=====', cid);
    await sdk.setCurrentCid(cid);
    const params = { ...msgBody };
    const msgParams = sdk.messageBuilder(params);
    sdk
      .sendMessage(msgParams)
      .then((sendResData) => {
        if (!sendResData) {
          Message.success('发送失败');
          return;
        }

        return Promise.resolve();
      })
      .catch((e: any) => {
        Message.success(e.errorMessage || e.message);
      });
  };

  const handleClose = async () => {
    console.log('去挂断======');
    console.log('handleClose=====cid=====', cid);
    await sendMessage({
      msgType: ContentType.Rtc,
      msgContent: { rtcAction: RtcAction.HangUp },
    });
    setAudioFlage(true);
    setOpneOrOff(true);
    setVisible(false);
    setStartTime(0);
    setSizePeople(1);
  };

  const handleAccept = async () => {
    let newRtcType = 'AUDIO';
    if (rtcType == 'AUDIO') {
      newRtcType = 'AUDIO';
    } else {
      newRtcType = 'VIDEO';
    }
    await sendMessage({
      msgType: ContentType.Rtc,
      msgContent: { rtcAction: RtcAction.AcceptInvite, rtcType: newRtcType },
    });
    setStartTime(+new Date());
    let size = sizePeople + 1;
    setSizePeople(size);
  };

  const handleReject = async () => {
    await sendMessage({
      msgType: ContentType.Rtc,
      msgContent: { rtcAction: RtcAction.RejectInvite },
    });
    setAudioFlage(true);
    setOpneOrOff(true);
    setVisible(false);
  };

  const onParticipantJoinRtcRoom = (res) => {
    const { joinUserId } = res;
    setStartTime(+new Date());
    sdk.queryUserInfoById({ queryUserId: joinUserId }).then((res) => {
      Message.success(`${res.nickName || res.userName}已接通`);
      let size = sizePeople + 1;
      setSizePeople(size);
    });
  };

  const [hagUp, setHagUp] = useState();
  useEffect(() => {
    // if (hagUp) {
    //   sdk.sendMessage(hagUp)
    //     .then(() => {
    // })
    // }
  }, [hagUp]);

  const onParticipantLeaveRtcRoom = async (res) => {
    console.log('已挂断============', res);
    const { leaveUserId } = res;
    if (leaveUserId !== myUserId) {
      await sdk.queryUserInfoById({ queryUserId: leaveUserId }).then((res) => {
        // Message.success(`${res.nickName || res.userName}已接通`);
        Message.success(`${res.nickName || res.userName}已挂断`);
        console.log('已挂断============2', res);
      });
      const msgBody = {
        msgType: ContentType.Rtc,
        msgContent: { rtcAction: 'hangUp' },
      };
      const msgParams = await sdk.messageBuilder(msgBody);
      setVisible(false);
      setStartTime(0);
      setSizePeople(1);
      // await sdk.sendMessage(msgParams)
      // .then(() => {
      //   setVisible(false);
      //   setStartTime(0);
      //   setSizePeople(1);
      // })
      // .catch((e) => {
      //   Message.error(e.errorMessage || e.message);
      // });
      // 单纯移除视图渲染，音视频依然在房间中，会导致下一次音视频失败，需要发送hangUp推出房间
      // setVisible(false);
    }
  };

  const onParticipantRejectRtcInvite = (res) => {
    const { userId } = res;
    if (userId !== myUserId) {
      sdk.queryUserInfoById({ queryUserId: userId }).then((res) => {
        Message.success(`${res.nickName || res.userName}已拒绝`);
      });
      setVisible(false);
    }

    const msgBody = {
      msgType: ContentType.Rtc,
      msgContent: { rtcAction: 'hangUp' },
    };
    const msgParams = sdk.messageBuilder(msgBody);
    sdk
      .sendMessage(msgParams)
      .then(() => {
        // onRtcHangup({ ...res, invitedUserRejected: true });
      })
      .catch((e) => {
        Message.error(e.errorMessage || e.message);
      });
  };

  const onError = (res) => {
    Message.error(res.message);
  };

  useEffect(() => {
    sdk.onParticipantJoinRtcRoom = onParticipantJoinRtcRoom;
    sdk.onParticipantLeaveRtcRoom = onParticipantLeaveRtcRoom;
    sdk.onParticipantRejectRtcInvite = onParticipantRejectRtcInvite;
    sdk.onError = onError;
  }, []);
  const [opneOrOff, setOpneOrOff] = useState(true);

  const openOrOffCam = () => {
    setOpneOrOff(!opneOrOff);
  };

  useEffect(async () => {
    if (!visible) return;
    try {
      await sdk.setLocalVideoEnable({ enabled: opneOrOff });
    } catch (e) {
      Message.error(Message.error(e.errorMessage || e.message));
    }
  }, [opneOrOff]);
  const [audioFlage, setAudioFlage] = useState(true);

  const openOrOffAudio = () => {
    setAudioFlage(!audioFlage);
  };

  useEffect(() => {
    if (visible) {
      if (audioFlage) {
        sdk.setLocalAudioEnable({ enabled: true });
      } else {
        sdk.setLocalAudioEnable({ enabled: false });
      }
    }
  }, [audioFlage]);

  useEffect(() => {
    return () => {
      setAudioFlage(true);
      setOpneOrOff(true);
    };
  }, []);

  return !visible ? null : rtcType == 'AUDIO' ? (
    <div
      className={styles.conferenceModal}
      style={{ zIndex: visible ? 9999 : -9999 }}
    >
      <div className={styles.topBar}>
        {from.nickName}发起的语音会议 ｜ {durationTime} ｜ {sizePeople}
        人在会议中
        {/* <CloseOutlined style={{ float: 'right', marginTop: 5 }} onClick={closeModal} /> */}
      </div>
      <div className={styles.body}>
        <div
          className={styles.cardWrap}
          key="from"
          style={{ backgroundColor: '#1e1c20' }}
        >
          {
            <AvatarImage
              className={styles.avatarImage}
              src={from.avatarUrl}
              nickName={from.nickName}
              userName={from.userName}
              userId={from.userId}
              style={{
                borderRadius: 8,
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              fit="cover"
              width={54}
              height={54}
            />
          }
          <video
            width="100%"
            height="100%"
            autoPlay={false}
            muted={false}
            playsInline={false}
            id={
              myUserId === from.userId
                ? 'implusPublishVideoElementId'
                : 'implusSubscribeVideoElementId'
            }
          />
          <div className={styles.extra}>
            <Tag color="#52B750">主持人</Tag>
            {/* <AudioMutedOutlined /> */}
            {myUserId === from.userId ? '我' : from.nickName}
          </div>
        </div>
        <div className={styles.cardWrap} key="to">
          {/* {rtcAction === RtcAction.Invite && !startTime && ( */}
          <>
            {!startTime && <div className={styles.loading}></div>}
            <AvatarImage
              src={to.avatarUrl}
              nickName={to.nickName}
              userName={to.userName}
              userId={to.userId}
              style={{
                borderRadius: '50%',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              fit="cover"
              width={54}
              height={54}
            />
          </>
          {/* )} */}
          <video
            autoPlay={false}
            muted={false}
            playsInline={false}
            width="100%"
            height="100%"
            id={
              myUserId === to.userId
                ? 'implusPublishVideoElementId'
                : 'implusSubscribeVideoElementId'
            }
          />
          <div className={styles.extra}>
            {/* <AudioMutedOutlined /> */}
            {myUserId === to.userId ? '我' : to.nickName}
          </div>
        </div>
        <audio autoPlay={true} id="implusSubscribeAudioElementId" />
      </div>
      <div className={styles.footer}>
        <div className={styles.iconWrap}>
          <a className={styles.iconButton}>
            {audioFlage ? (
              <AudioOutlined
                onClick={() => openOrOffAudio()}
                className={styles.icon}
              />
            ) : (
              <AudioMutedOutlined
                onClick={() => openOrOffAudio()}
                className={styles.icon}
              />
            )}
            {audioFlage ? '静音' : '取消静音'}
          </a>
          {/* <a className={styles.iconButton}>
      <AudioOutlined />
      <AudioMutedOutlined className={styles.icon} />
      取消静音
    </a> */}
          {/* <a className={styles.iconButton}>
            <VideoCameraOutlined
              onClick={openOrOffCam}
              className={styles.icon}
            />
            {opneOrOff ? '关闭摄像头' : '打开摄像头'}
          </a> */}
        </div>
        <div>
          {rtcAction === RtcAction.AcceptInvite && !startTime ? (
            <>
              <Button
                type="primary"
                onClick={handleAccept}
                style={{ marginRight: 8 }}
              >
                接受
              </Button>
              <Button type="primary" onClick={handleReject} danger>
                拒绝
              </Button>
            </>
          ) : (
            <Button type="primary" danger onClick={handleClose}>
              结束会议
            </Button>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div
      className={styles.conferenceModal}
      style={{ zIndex: visible ? 9999 : -9999 }}
    >
      <div className={styles.topBar}>
        {from.nickName}发起的视频会议 ｜ {durationTime} ｜ {sizePeople}
        人在会议中
        {/* <CloseOutlined style={{ float: 'right', marginTop: 5 }} onClick={closeModal} /> */}
      </div>
      <div className={styles.body}>
        <div
          className={styles.cardWrap}
          key="from"
          style={{ backgroundColor: '#1e1c20' }}
        >
          {!startTime && (
            <AvatarImage
              className={styles.avatarImage}
              src={from.avatarUrl}
              nickName={from.nickName}
              userName={from.userName}
              userId={from.userId}
              style={{
                borderRadius: 8,
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              fit="cover"
              width={54}
              height={54}
            />
          )}
          <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            width="100%"
            height="100%"
            style={{ opacity: startTime ? '1' : '0' }}
            id={
              myUserId === from.userId
                ? 'implusPublishVideoElementId'
                : 'implusSubscribeVideoElementId'
            }
          />
          <div className={styles.extra}>
            <Tag color="#52B750">主持人</Tag>
            {/* <AudioMutedOutlined /> */}
            {myUserId === from.userId ? '我' : from.nickName}
          </div>
        </div>
        <div className={styles.cardWrap} key="to">
          {rtcAction === RtcAction.Invite && !startTime && (
            <>
              <div className={styles.loading}></div>
              <AvatarImage
                src={to.avatarUrl}
                nickName={to.nickName}
                userName={to.userName}
                userId={to.userId}
                style={{
                  borderRadius: '50%',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                fit="cover"
                width={54}
                height={54}
              />
            </>
          )}
          <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            width="100%"
            height="100%"
            id={
              myUserId === to.userId
                ? 'implusPublishVideoElementId'
                : 'implusSubscribeVideoElementId'
            }
          />
          <div className={styles.extra}>
            {/* <AudioMutedOutlined /> */}
            {myUserId === to.userId ? '我' : to.nickName}
          </div>
        </div>
        <audio autoPlay={true} id="implusSubscribeAudioElementId" />
      </div>
      <div className={styles.footer}>
        <div className={styles.iconWrap}>
          <a className={styles.iconButton}>
            {audioFlage ? (
              <AudioOutlined
                onClick={() => openOrOffAudio()}
                className={styles.icon}
              />
            ) : (
              <AudioMutedOutlined
                onClick={() => openOrOffAudio()}
                className={styles.icon}
              />
            )}
            {audioFlage ? '静音' : '取消静音'}
          </a>
          <a className={styles.iconButton}>
            <VideoCameraOutlined
              onClick={openOrOffCam}
              className={styles.icon}
            />
            {opneOrOff ? '关闭摄像头' : '打开摄像头'}
          </a>
        </div>
        <div>
          {rtcAction === RtcAction.AcceptInvite && !startTime ? (
            <>
              <Button
                type="primary"
                onClick={handleAccept}
                style={{ marginRight: 8 }}
              >
                接受
              </Button>
              <Button type="primary" onClick={handleReject} danger>
                拒绝
              </Button>
            </>
          ) : (
            <Button type="primary" danger onClick={handleClose}>
              结束会议
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
