import React, { useState, useEffect, useRef, memo } from 'react';
import { useModel } from 'umi';
import _ from 'lodash';
import { Input, Popover, message as Message, Tooltip, Button } from 'antd';
import { debounce } from 'lodash';
import classNames from 'classnames';
import Recorder from 'js-audio-recorder';
// import { Toast } from 'antd-mobile';
import {
  SmileOutlined,
  CloseCircleOutlined,
  VideoCameraOutlined,
  FolderOutlined,
  ProfileOutlined,
  LinkOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  AudioOutlined,
  TableOutlined,
  // UserOutlined,
} from '@ant-design/icons';
import SelectLocaotionInfo from './SelectLocaotionInfo';
import SendRichText from './SendRichText';
import SendLink from './SendLink';
// import SendUserCard from './SendUserCard';
import SelectAtUser from './SelectAtUser';

import './style.less';

import {
  ContentType,
  CustomDataType,
  ConversationType,
  MsgTypeMap,
  RtcAction,
} from '../../constants';
import { resolveCustomMsgFormContent, symbolEscape } from '../../utils';
const BottomInputBar = (props) => {
  const { mySdkStore, sdk, userInfo } = useModel('global');
  const renderReplySourceContent = (messageData) => {
    const { msgType, msgContent: content } = messageData;
    let lastMsg = '';
    switch (msgType?.toLowerCase()) {
      case 'rtc':
        lastMsg =
          content && content.rtcAction === 'invite'
            ? '发起实时音视频邀请'
            : '收到实时音视频邀请';
        break;
      case 'text':
        lastMsg = content.text;
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
        let innerMsgType = content?.sourceContentType;
        if (typeof content?.sourceContentType === 'number') {
          innerMsgType = MsgTypeMap[content?.sourceContentType];
        }
        lastMsg = renderReplySourceContent({
          msgType: innerMsgType,
          msgContent: content.sourceMessageContent,
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
  const {
    setVisible: setConferenceModalVisible,
    setProps: setConferenceModalProps,
  } = useModel('conferenceModal');
  const { emojiList } = mySdkStore;
  const inputRef = useRef(null);
  const { onSend, replyProps, reEditProps, converInfo } = props;
  console.log(props, 'kokofe');

  const { cid } = converInfo;
  const [selectLocaotionInfo, setSelectLocaotionInfo] = useState({
    visible: false,
  });
  const [textValue, setTextValue] = useState('');
  const [sendLinkProps, setSendLinkProps] = useState({ visible: false });
  const [sendRichTextProps, setSendRichTextProps] = useState({
    visible: false,
    onOk: () => {},
    onClose: () => {},
  });
  const [replySourceMessageProps, setReplySourceMessageProps] = useState({
    visible: false,
  });
  const handleSendLocation = async (positionResult) => {
    const { lat, lng, address, imageFileUrl, imageHeight, imageWidth } =
      positionResult;
    await sendMessage({
      msgType: 'location',
      msgContent: {
        latitude: lat,
        longitude: lng,
        title: address,
        imageFileUrl,
        imageHeight,
        imageWidth,
      },
    });
  };
  const [selectAtUserProps, setSelectAtUserProps] = useState({
    visible: false,
  });
  // const [sendUserCardProps, setSendUserCardProps] = useState({
  //   visible: false,
  //   getListApi: '',
  //   onOk: () => {},
  //   onClose: () => {},
  // });
  const [atUsers, setAtUsers] = useState([]);
  const [flage, setFlage] = useState(true);
  let [addAt, setAddAt] = useState(0);
  let [oldAtList, setOldAtList] = useState([]);
  useEffect(() => {
    if (reEditProps?.text) {
      setTextValue(reEditProps.text);
    }
  }, [reEditProps]);

  useEffect(() => {
    if (replyProps) {
      setReplySourceMessageProps({ ...replyProps });
    }
  }, [replyProps]);
  const getUserName = (params, item) => {
    console.log(params, item, '-----');
    let val;
    params.map((x) => {
      if (x.userId == item.userId) {
        val = x?.userName || x?.nickName;
      }
    });
    return val + '';
  };
  const handleAtOk = (userIds, allInfoUsers) => {
    let params = [...atUsers, ...userIds];
    setAtUsers(params);
    console.log(params, 'pp1pp');

    const atUsersText = userIds
      // .map((item) => `@${item.nickName || item.userName} `)
      .map((item) => `@${getUserName(params, item)} `)
      .join('');
    // let c = textValue.slice(0, textValue.length - 1);
    setTextValue(`${textValue}${atUsersText}`);

    setSelectAtUserProps({ visible: false });
    inputRef?.current?.focus();
  };
  const [ismobileFlage, setIsMobildFlage] = useState(false);
  useEffect(() => {
    setTextValue('');
    setAtUsers([]);
    isMobile();
  }, [cid]);

  useEffect(() => {
    if (!flage) {
      setAddAt(0);
    }
  }, [flage]);
  useEffect(() => {
    isMobile();
  }, []);
  const onInputChange = (e) => {
    const val = e.target.value.trim();
    setTextValue(val);
    if (ConversationType.Group === converInfo.type && val.endsWith('@')) {
      setSelectAtUserProps({
        visible: true,
        cid,
        onOk: handleAtOk,
        onClose: () => setSelectAtUserProps({ visible: false }),
      });
      inputRef?.current?.blur();
    }
    setFlage(true);
  };
  const readMore = (arr) => {
    let result = {};
    arr.forEach((item) => {
      result[item.userId + 'isAtRead'] = 'false';
    });
    return result;
  };
  const getAtId = (arr) => {
    let res = [];
    arr.map((x) => {
      res.push({ userId: x.userId });
    });
    return res;
  };

  const sendMessage = async (msgBody) => {
    await sdk.setCurrentCid(cid);
    // (@所有人时固定值为[{userId: '__at_all__'}]
    console.log(msgBody, 'ppp2');

    const params = { ...msgBody };
    if (replySourceMessageProps?.msgId) {
      params.quoteMessageId = replySourceMessageProps?.msgId;
    }
    if (atUsers.length) {
      params.bizParams = readMore(atUsers);
      params.atUsers = getAtId(atUsers);
    }

    // ...msgBody, quoteMessageId: replySourceMessageProps?.msgId || undefined, atUsers: []
    try {
      const msgParams = sdk.messageBuilder(params);
      sdk
        .sendMessage(msgParams)
        .then((sendResData) => {
          if (!sendResData) {
            Message.success('发送失败');
            return;
          }
          setFlage(false);

          if (replySourceMessageProps?.msgId) {
            setReplySourceMessageProps({ visible: false });
            sendResData.quoteReplyInfo = {
              quoteMessageId: sendResData.quoteMessageId,
              quoteMessageContent: replyProps.msgContent,
              quoteMessageContentType: replyProps.msgType,
              converInfo: converInfo,
            };
          }

          if (sendResData.msgContent?.mimeType?.indexOf('video') > -1) {
            sendResData.msgType = ContentType.Video;
          }

          if (sendResData.msgContent?.mimeType?.indexOf('audio') > -1) {
            sendResData.msgType = ContentType.Voice;
          }

          if (sendResData.msgContent?.mimeType?.indexOf('image') > -1) {
            sendResData.msgType = ContentType.Image;
          }

          // if (msgBody.msgContent?.dataType !== CustomDataType.Instruction) {
          // // 命令消息不展示在聊天窗
          setReplySourceMessageProps({ visible: false });
          if (replySourceMessageProps.visible) {
            onSend(sendResData);
          } else {
            onSend(sendResData);
          }
          // }
          return Promise.resolve();
        })
        .catch((e: any) => {
          console.log(e);
          Message.error(e.errorMessage || e.message);
        });
    } catch (e: any) {
      console.log(e);
      Message.success(e.errorMessage || e.message);
      return Promise.resolve();
    }
  };

  const onSendLink = ({ href, title }) => {
    const msgBody = {
      msgType: ContentType.Url,
      msgContent: {
        href,
        title,
      },
    };
    sendMessage(msgBody);
    setSendLinkProps({ visible: false });
  };

  const onSendRichText = (text) => {
    const enc = new TextEncoder();
    const msgBody = {
      msgType: ContentType.Custom,
      msgContent: {
        // data: new Uint8Array(text),
        data: enc.encode(text),
        dataType: CustomDataType.RichText,
        dataVersion: '0.0.1',
        extInfo: {},
        bizParams: {},
      },
    };
    sendMessage(msgBody);
    setSendRichTextProps({ visible: false });
  };

  // const onSendInstruct = (text) => {
  //   const enc = new TextEncoder();
  //   const msgBody = {
  //     msgType: ContentType.Custom,
  //     msgContent: {
  //       data: enc.encode(text),
  //       dataType: CustomDataType.Instruction,
  //       dataVersion: '0.0.1',
  //       extInfo: {  },
  //       bizParams: {},
  //     }
  //   }
  //   sendMessage(msgBody);
  //   setSendInstructProps({ visible: false });
  // }

  const handleSendText = async () => {
    console.log(converInfo, userInfo?.departments, 'poooeokroe');
    // if (converInfo.subUserId == userInfo.userId) {
    //   // 不知道那个天杀的,想出来自己要给自己发消息.
    // } else if (converInfo?.departments && userInfo?.departments) {

    //   if (JSON.parse(converInfo?.departments)[0].deptName == JSON.parse(userInfo?.departments)[0].deptName) {

    //   } else {
    //     Message.error('非同组织架构下不允许聊天')
    //     return;
    //   }
    // } else {
    //   Message.error('非同组织架构下不允许聊天')
    //   return;
    // }
    // if (!textValue) {
    //   return;
    // }
    console.log(textValue, '---------!!!!!!!!!!!!');

    // todo: /n 转换行
    await sendMessage({
      msgType: ContentType.Text,
      msgContent: {
        value: symbolEscape(textValue),
      },
    });

    setTextValue('');
    setAtUsers([]);
  };

  const handleOnKeyDown = (event) => {
    if (ismobileFlage) {
      if (event.key === 'Enter') {
        setTextValue(`${textValue}\n`);
      }
    } else {
      if (event.key === 'Enter') {
        if (event.metaKey) {
          setTextValue(`${textValue}\n`);
        } else {
          handleSendText();
        }
      }
    }
  };

  // const handleSendImage = (event) => {
  //   const { files } = event.currentTarget;
  //   sendMessage({
  //     msgType: ContentType.Image,
  //     msgContent: {
  //     value: files[0],
  //     }
  //   });
  // }

  const handleSendEmoji = (emojiData) => {
    const { globalUniqueId: iconId, cn } = emojiData;
    sendMessage({
      msgType: ContentType.Face,
      msgContent: {
        iconId,
        emoji: cn,
      },
    });
  };

  const handleCreateConference = async () => {
    try {
      setConferenceModalVisible(true);
      setConferenceModalProps({
        cid,
        rtcAction: RtcAction.Invite,
        from: {
          userId: userInfo.userId,
          avatarUrl: userInfo.avatarUrl,
          nickName: userInfo.nickName,
        },
        to: {
          userId: converInfo.singleSubUser?.userId,
          avatarUrl: converInfo.singleSubUser?.avatarUrl,
          nickName: converInfo.singleSubUser?.nickName,
        },
        rtcType: 'VIDEO',
      });
      await sendMessage({
        msgType: ContentType.Rtc,
        msgContent: { rtcAction: RtcAction.Invite, rtcType: 'VIDEO' },
      });
    } catch (e: any) {
      Message.error(e.errorMessage || e.message);
    }
  };

  const handleCreateVoice = async () => {
    try {
      setConferenceModalVisible(true);
      setConferenceModalProps({
        cid,
        rtcAction: RtcAction.Invite,
        from: {
          userId: userInfo.userId,
          avatarUrl: userInfo.avatarUrl,
          nickName: userInfo.nickName,
        },
        to: {
          userId: converInfo.singleSubUser?.userId,
          avatarUrl: converInfo.singleSubUser?.avatarUrl,
          nickName: converInfo.singleSubUser?.nickName,
        },
        rtcType: 'AUDIO',
      });
      await sendMessage({
        msgType: ContentType.Rtc,
        msgContent: { rtcAction: RtcAction.Invite, rtcType: 'AUDIO' },
      });
    } catch (e: any) {
      Message.error(e.errorMessage || e.message);
    }
  };

  const handleSendFile = (event) => {
    const { files } = event.currentTarget;
    let msgType = '';
    if (event.target.value.includes('.')) {
      let typeList = event.target.value.split('.');
      let getType = typeList[typeList.length * 1 - 1].toLowerCase();
      // let type = 'pptx,zip,txt,xlsx,rar,pdf,ppt,doc,xls,docx,jpg,image,bmp,gif,png,jpeg,video,voice,file,mp4,mov,video,wav,silk,mp3,aac,m4a,audio';
      let typeFile = 'pptx,zip,txt,xlsx,rar,pdf,ppt,doc,xls,docx';
      let typeImg = 'jpg,image,bmp,gif,png,jpeg';
      let typeVideo = 'mp4,mov,video,wav';
      let typeVoice = 'silk,mp3,aac,m4a,audio';
      if (typeFile.includes(getType)) {
        msgType = 'file';
      } else if (typeImg.includes(getType)) {
        msgType = 'image';
      } else if (typeVideo.includes(getType)) {
        msgType = 'video';
      } else if (typeVoice.includes(getType)) {
        msgType = 'voice';
      } else {
        return Message.error('暂不支持此类型文件');
      }
    } else {
      return Message.error('当前文件无后缀类型');
    }

    sendMessage({
      msgType,
      msgContent: {
        value: files[0],
      },
    });
  };

  const handleSendLink = () => {
    setSendLinkProps({
      visible: true,
      onOk: onSendLink,
      onClose: () => setSendLinkProps({ visible: false }),
    });
  };

  const handleSendRichText = () => {
    setSendRichTextProps({
      visible: true,
      onOk: onSendRichText,
      onClose: () => setSendRichTextProps({ visible: false }),
    });
  };

  const enterFunc = debounce(handleOnKeyDown, 200);
  const clickEnterFunc = debounce(handleSendText, 200);
  // const handleSendUserCard = async (userInfo) => {
  //   const { userName, nickName, userId, avatarUrl } = userInfo;
  //   const data = { userName, nickName, userId, avatarUrl };
  //   const enc = new TextEncoder();
  //   await sendMessage({
  //     msgType: ContentType.Custom,
  //     msgContent: {
  //       // data: new Uint8Array(url),
  //       data: enc.encode(JSON.stringify(data)),
  //       dataType: CustomDataType.UserCard,
  //       dataVersion: '0.0.1',
  //       extInfo: data,
  //       bizParams: {},
  //     },
  //   });
  //   setSendUserCardProps({ visible: false });
  // };

  // const handleUserCard = async () => {
  //   setSendUserCardProps({
  //     visible: true,
  //     title: '选择联系人',
  //     cid,
  //     getListApi: 'queryUsers',
  //     listFilterFunc: (list) => list.filter((item) => item.roleId !== 1),
  //     onOk: handleSendUserCard,
  //     onClose: () => setSendUserCardProps({ visible: false }),
  //   });
  // };

  const emojiListArea = (
    <div className="bottomBarEmojiListArea">
      {emojiList.map((emoji) => {
        return (
          <img
            key={emoji.globalUniqueId}
            src={emoji.url}
            onClick={() => handleSendEmoji(emoji)}
            alt="emoji"
            style={{ width: '24px', height: '24px', margin: '4px' }}
          />
        );
      })}
    </div>
  );

  const isMobile = () => {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      setIsMobildFlage(true);
    } else {
      // setIsMobildFlage(false);
      setIsMobildFlage(true);
    }
  };
  const [isAudioFlage, setIsAudioFlage] = useState(false);

  const isAudio = () => {
    setIsAudioFlage(!isAudioFlage);
  };

  let chunks = [];

  const [audioProps, setAudioProps] = useState({
    recorder: null,
    stream: null,
    dataChunk: [],
    startPageY: 0,
    startTime: 0,
  });
  let audioBodyProps = {
    startPageY: 0,
    startTime: 0,
  };
  const [isActive, setIsActive] = useState(false);

  let [recorder, setRecorder] = useState();
  const [cofig, setCofig] = useState();

  const handleStartSpeak = async (event) => {
    console.log('说话1');

    setIsActive(true);
    // Toast.show({
    //   icon: 'loading',
    //   content: '松开发送，上滑取消',
    //   duration: 0,
    // });
    console.log('说话2');

    const { pageY } = event.touches[0];

    // const { mediaDevices } = window.navigator;
    // console.log('说话3');

    // try {
    //   const stream = await mediaDevices.getUserMedia({ audio: true });
    //   console.log('说话4');

    //   const recorder = new MediaRecorder(stream);
    //   recorder.start();
    //   console.log('说话5');

    setAudioProps({
      ...audioProps,
      // recorder,
      // stream,
      startPageY: pageY,
      startTime: +new Date(),
    });
    console.log('说话6');
    // setRecorder(new Recorder());
    recorder = new Recorder({
      sampleBits: 8,
      sampleRate: 11025,
      numChannels: 1,
    });
    setRecorder(recorder);
    Recorder.getPermission().then(
      () => {
        console.log('开始录音');
        recorder.start(); // 开始录音
      },
      (error) => {
        console.log(`${error.name} : ${error.message}`);
      },
    );
  };

  const handleEndSpeak = async (event) => {
    setIsActive(false);
    try {
      const { pageY } = event.changedTouches[0];
      window.getSelection()?.removeAllRanges();
      console.log(audioBodyProps.startPageY, pageY, 'size');

      if (audioBodyProps.startPageY - pageY < -650) {
        // Toast.clear();
        // audioProps.recorder?.stop();
        console.log('停止录音');
        recorder.stop(); // 停止录音
        // const formData = new FormData();
        const blob = recorder.getWAVBlob(); // 获取wav格式音频数据
        // 此处获取到blob对象后需要设置fileName满足当前项目上传需求，其它项目可直接传把blob作为file塞入formData
        const newbolb = new Blob([blob], { type: 'audio/mp3' });
        const fileOfBlob = new File([newbolb], new Date().getTime() + '.mp3', {
          type: 'audio/mp3',
        });
        console.log(fileOfBlob, 'f - u - l - e - o - f- ');
        // const file = new File(chunks, `${new Date().valueOf()}.mp3`, {
        //   type: 'audio/mp3',
        // });
        await sendMessage({
          msgType: ContentType.Voice,
          msgContent: {
            value: fileOfBlob,
          },
        });
      } else {
        // Toast.clear();
      }
    } catch (e) {
      console.log(e, '结束讲话');
    }
  };

  return (
    <div className="bottomInputBarComponent">
      {replySourceMessageProps.visible && (
        <div className="replySourceArea">
          <div className="topBar">
            <span>
              {replySourceMessageProps.from?.userName ||
                replySourceMessageProps.from?.nickName ||
                replySourceMessageProps.from?.userId}
            </span>
            <CloseCircleOutlined
              onClick={() => setReplySourceMessageProps({ visible: false })}
              style={{ fontSize: 15 }}
            />
          </div>
          <div className="replySourceMessage">
            {renderReplySourceContent(replySourceMessageProps)}
          </div>
        </div>
      )}
      <div className="messageTypeArea">
        <Tooltip title="表情">
          <Popover
            title={null}
            content={emojiListArea}
            overlayClassName="bottomBarEmojiListPopover"
          >
            <SmileOutlined className="supIcon" />
          </Popover>
        </Tooltip>
        {ConversationType.Single === converInfo.type && (
          <Tooltip title="音视频">
            <VideoCameraOutlined
              className="supIcon"
              onClick={handleCreateConference}
            />
          </Tooltip>
        )}
        {ConversationType.Single === converInfo.type && (
          <Tooltip title="语音">
            <PhoneOutlined className="supIcon" onClick={handleCreateVoice} />
          </Tooltip>
        )}
        <Tooltip title="文件">
          <span className="fileInputWrap">
            <input
              type="file"
              className="fileInput"
              onChange={handleSendFile}
            />
            <FolderOutlined className="supIcon" />
          </span>
        </Tooltip>
        <Tooltip title="富文本">
          <ProfileOutlined className="supIcon" onClick={handleSendRichText} />
        </Tooltip>
        <Tooltip title="链接">
          <Popover
            title={null}
            placement="bottomRight"
            content={<SendLink {...sendLinkProps} />}
            trigger="click"
            open={false}
          >
            <LinkOutlined className="supIcon" onClick={handleSendLink} />
          </Popover>
        </Tooltip>
        {ismobileFlage && !isAudioFlage && (
          <Tooltip title="语音">
            <AudioOutlined className="supIcon" onClick={() => isAudio()} />
          </Tooltip>
        )}
        {ismobileFlage && isAudioFlage && (
          <Tooltip title="键盘">
            <TableOutlined className="supIcon" onClick={() => isAudio()} />
          </Tooltip>
        )}

        {/* <Tooltip title="位置">
          <Popover>
            <EnvironmentOutlined
              className="supIcon"
              onClick={() => {
                setSelectLocaotionInfo({
                  visible: true,
                });
              }}
            />
          </Popover>
        </Tooltip> */}
      </div>
      {isAudioFlage ? (
        <div
          className={classNames({ audioBox: true, btnActive: isActive })}
          onTouchStart={handleStartSpeak}
          onTouchEnd={handleEndSpeak}
          onTouchCancel={handleEndSpeak}
        >
          <div className="audioBtnBar">
            {isActive ? '松开发送，上滑取消' : '按住说话'}
          </div>
        </div>
      ) : (
        <div className="inputBox">
          <div className="inputBar">
            <Input.TextArea
              style={{ whiteSpace: 'pre-wrap' }}
              ref={inputRef}
              value={textValue}
              onChange={onInputChange}
              className="input"
              placeholder="请输入消息"
              onKeyDown={enterFunc}
            />
          </div>
          <div className="buttonBar">
            {ismobileFlage ? '' : 'Enter 发送'}
            {/* ，Command+Enter 换行 */}
            <Button
              disabled={!textValue}
              type="default"
              shape="round"
              style={{ marginLeft: 8 }}
              onClick={clickEnterFunc}
            >
              发送
            </Button>
          </div>
        </div>
      )}

      {sendRichTextProps.visible && <SendRichText {...sendRichTextProps} />}
      {sendLinkProps.visible && <SendLink {...sendLinkProps} />}
      {/* { sendInstructProps.visible && <Popup visible bodyStyle={{ height: '100%', background: 'rgba(242,244,245,1)' }}><SendInstruct { ...sendInstructProps } /></Popup>}
    { sendUserCardProps.visible && <SendUserCard {...sendUserCardProps} /> } */}
      {selectAtUserProps.visible && <SelectAtUser {...selectAtUserProps} />}
      {selectLocaotionInfo.visible && (
        <SelectLocaotionInfo
          title="选择地址"
          onOk={(positionResult) => {
            setSelectLocaotionInfo({
              visible: false,
            });
            handleSendLocation(positionResult);
          }}
          onClose={() => {
            setSelectLocaotionInfo({
              visible: false,
            });
          }}
        />
      )}
    </div>
  );
};

export default BottomInputBar;
