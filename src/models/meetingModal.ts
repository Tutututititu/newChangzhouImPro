import { useEffect, useState } from 'react';
import { SdkType } from '@/typings/global';
import { COOKIE_USER_KEY } from '@/constants';
import { useModel } from 'umi';
const { McuController } = window;
// @ts-ignore
import Cookie from 'js-cookie';
const meetingModal = () => {
  const { userInfo } = useModel('global');
  const [visible, setVisible] = useState(false);
  // @ts-ignore
  const [groupController, setGroupController] = useState<SdkType>(null);
  const [connState, setConnState] = useState(0); //连接状态
  const [roomNum, setRoomNum] = useState(8); //房间数量
  const [roomState, setRoomState] = useState(0); //房间状态
  const [vodState, setVodState] = useState(0); //点播状态
  const [audioState, setAudioState] = useState(1); //开麦和关麦 1:开;0:关
  const [videoState, setVideoState] = useState(1); //开关摄像头,1:开;0:关
  const [role, setRole] = useState(''); //房间 类型
  const [roomId, setRoomId] = useState(''); //房间号码
  const [roomTitle, setRoomTitle] = useState(''); //房间标题
  const [roomToken, setRoomToken] = useState(''); //房间密码
  const [meetJoinTip, setMeetJoinTip] = useState(false); //是否显示加入消息提示
  const [meetList, setMeetList] = useState([]); //房间列表
  let [sizePeople, setSizePeople] = useState(1); //人数
  const [inMeetingType, setInMeetingType] = useState('');
  const [infoSelectUser, setInfoSelectUser] = useState([]);
  const [props, setProps] = useState({
    from: {
      nickName: '',
    },
    toList: [],
    selectedUserIds: [],
    rtcType: 'VIDEO',
  });
  const [webMeeting, setWebMeeting] = useState(''); // 创建会议返回参数;
  let mcuController;

  useEffect(() => {
    if (userInfo?.userId) {
      console.log(userInfo, 'I - n - f- o');

      mcuController = new window.McuController();
      // @ts-ignore
      console.log('页面渲染完成', McuController);
      // @ts-ignore
      try {
        if (connState != 1) {
          let configParam = {
            log: true,
            uid: userInfo.userId,
            // biz_name: 'demo',
            // sub_biz: 'default',
            workspaceId: 'default',
            room_server_url: 'wss://artvcroomdev.dl.alipaydev.com/ws',
            sign: 'signature',
            network_check_timeout: 120 * 1000, //允许最大断网时间 (超过未重连, 直接关闭)
            logCacheMaxLines: 200,
            biz_name: 'meeting',
            sub_biz: 'test',
          };

          mcuController.Connect(configParam);
          mcuController.OnConnectOK = OnConnectOK; //建立连接成功
          mcuController.OnConnectFailed = OnConnectFailed; //建立连接失败
          mcuController.OnConnectClose = OnConnectClose; //断开连接回调
          //房间与会者列表信息
          mcuController.OnRoomAttendanceList = (participant: any) => {
            console.log('房间与会者列表信息===', participant);
            setSizePeople(() => participant.length + 1);
          };
          mcuController.OnJoinRoomSucc = (res) => joinFunc(res);
          mcuController.OnJoinRoomFailed = (res) => joinNoFunc(res);
          //被邀请
          mcuController.OnInviteRequest = (
            room_id: any,
            rtoken: any,
            inviter: any,
            extra: any,
            inviteId: any,
            inviteInfo: any,
          ) => {
            console.log('被邀请====room_id', room_id);
            console.log('被邀请====rtoken', rtoken);
            console.log('被邀请====inviter', inviter);
            console.log(inviteId, '1 1- 22');

            console.log('被邀请====extra', extra);
            console.log('被邀请====inviteInfo', inviteInfo);
            setRoomTitle(extra.url);
            setRoomId(room_id);
            setRoomToken(rtoken);
            let obj = {
              room_id: room_id,
              rtoken: rtoken,
            };
            // @ts-ignore
            meetList.push(obj);
            setMeetList(meetList);
            let media_inviteInfo = {};
            if (inviteInfo) {
              media_inviteInfo.audioEnable = inviteInfo.audioEnable;
              media_inviteInfo.videoEnable = inviteInfo.videoEnable;
            }
            mcuController.ReplyInvite(
              room_id,
              inviter,
              2,
              inviteId,
              media_inviteInfo,
              extra,
            );
            setRole('callee');
            setMeetJoinTip(true);
          };
          // 邀请成功
          mcuController.OnInviteOK = () => {
            console.log('邀请成功====');
          };
          // 邀请失败
          mcuController.OnInviteFail = (code, msg) => {
            console.log('邀请失败====', msg);
          };
          setGroupController(mcuController);
        }
      } catch (e) {}
    }
  }, [userInfo]);
  const OnConnectOK = () => {
    console.log('建立连接成功===');
    if (userInfo) {
      setConnState(1);
    } else {
      setConnState(0);
    }
  };
  const OnConnectFailed = () => {
    console.log('建立连接失败, 请尝试https修复===');
    setConnState(0);
  };
  const OnConnectClose = () => {
    console.log('断开连接回调===');
    setConnState(0);
  };
  const joinNoFunc = (res) => {
    console.log(res, '1 -2');
  };
  const joinFunc = (res) => {
    console.log(res, '111');
  };
  return {
    visible,
    setVisible,
    props,
    setProps,
    groupController,
    setGroupController,
    connState,
    setConnState,
    roomState,
    setRoomState,
    role,
    setRole,
    audioState,
    setAudioState,
    videoState,
    setVideoState,
    roomId,
    setRoomId,
    roomToken,
    setRoomToken,
    meetJoinTip,
    setMeetJoinTip,
    meetList,
    setMeetList,
    roomNum,
    setRoomNum,
    sizePeople,
    setSizePeople,
    roomTitle,
    setRoomTitle,
    webMeeting,
    setWebMeeting,
    inMeetingType,
    setInMeetingType,
    infoSelectUser,
    setInfoSelectUser,
  };
};

export default meetingModal;
