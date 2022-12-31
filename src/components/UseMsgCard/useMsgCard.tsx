import { useEffect, useState } from 'react';
import AvatarImage from '../../components/AvatarImage';
import { Button, message as Message, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { UserInfo } from '@/typings/global';
// import PubSub from 'pubsub-js';
// import { ConversationInfo } from '@/typings/chat';
import { useModel } from 'umi';
import { ContentType, RtcAction } from '../../constants';
import './style.less';
const UseMsgCard = (props: {
  conversationDetail?: any;
  useDataProps?: any;
  setUserMoreCardFlage?: () => void;
  successMsg?: any;
  type?: string;
  setaddUserId?: (arg: string) => void;
  setShowUserMoreCard?: (arg: boolean) => void;
  closeList?: () => void;
  getUseDataMore?: any;
  noShowCLose?: boolean;
  clickType?: string;
}) => {
  const { sdk, userInfo: globalUserInfo, setPagePath } = useModel('global');
  const { userId: myUserId } = globalUserInfo;
  const {
    setVisible: setConferenceModalVisible,
    setProps: setConferenceModalProps,
  } = useModel('conferenceModal');
  let {
    conversationDetail,
    useDataProps,
    setUserMoreCardFlage,
    successMsg,
    type,
    setaddUserId,
    setShowUserMoreCard,
    closeList,
    getUseDataMore,
    noShowCLose,
    clickType,
  } = props;
  console.log(props, ' p - r - o - p - s');

  const [newType, setType] = useState(type);
  console.log(useDataProps, 'ppp1');

  const [newUseDataProps, setNewSseDataProps] = useState(useDataProps);
  console.log(getUseDataMore, 'popop');

  useEffect(() => {
    if (getUseDataMore) {
      sdk.queryUserInfoById({ queryUserId: getUseDataMore }).then((res) => {
        if (res?.isGoodFriend) {
          setType('del');
        } else {
          setType('add');
        }
        setNewSseDataProps(res);
      });
      // getUseDataMore.then((res) => {
      //   if (res?.isGoodFriend) {
      //     setType('del');
      //   } else {
      //     setType('add');
      //   }
      //   setNewSseDataProps(res);
      // });
    }
  }, [getUseDataMore]);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  let [showPhoneFlage, setShowPhoneFlage] = useState(false);
  // 加敏手机号
  const filterPhone = (val: string, flage: boolean) => {
    let head = val.slice(0, 3);
    let trail = val.slice(-3);
    if (!flage) return head + '*****' + trail;
    return val;
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);
  const [remak, setRemak] = useState(false);
  const openRemakInput = () => {
    setRemak(!remak);
  };
  // 删除好友
  const delFriend = async () => {
    let params = {
      deletedUserId: newUseDataProps?.userId,
    };
    let res = await sdk.deleteFriend(params);
    if (res === null) {
      if (successMsg) {
        successMsg();
        if (setaddUserId) {
          setaddUserId('none');
        }
      }
      if (setUserMoreCardFlage) {
        setUserMoreCardFlage();
      }
    }
  };
  const closeCard = () => {
    if (setShowUserMoreCard) {
      setShowUserMoreCard(false);
    }
    if (closeList) {
      closeList();
    }
  };
  const addConcern = async () => {
    await sdk.addUserConcern({
      relUserId:
        conversationDetail?.subUserId ||
        useDataProps?.userId ||
        conversationDetail?.subUserId,
      userId: myUserId,
    });
    Message.success('添加关注成功');
    setUserInfo(userInfo ? { ...userInfo, isConcern: true } : null);
  };

  const removeConcern = async () => {
    await sdk.removeUserConcern({
      relUserId:
        conversationDetail?.subUserId ||
        useDataProps?.userId ||
        conversationDetail?.subUserId,
      userId: myUserId,
    });
    Message.success('已取消关注');
    setUserInfo(userInfo ? { ...userInfo, isConcern: false } : null);
  };
  // const [showConcerIcon, setShowConcerIcon] = useState(false);
  // useEffect(() => {
  //   if (userInfo?.isConcern === true) {
  //     alert(true);
  //     setShowConcerIcon(true);
  //   } else {
  //     alert(false)
  //     setShowConcerIcon(false);
  //   }
  // }, [userInfo?.isConcern])
  const fetchUserInfo = async () => {
    if (
      !newUseDataProps?.userId &&
      !useDataProps?.userId &&
      !conversationDetail?.userId &&
      !conversationDetail?.subUserId
    ) {
      return Message.error('获取不到用户id');
    }
    let info = '';
    try {
      let queryUserId =
        newUseDataProps?.userId ||
        useDataProps?.userId ||
        conversationDetail?.userId ||
        conversationDetail?.subUserId;
      console.log(queryUserId, 'ppop');

      info = await sdk.queryUserInfoById({
        queryUserId,
      });
    } catch (e) {
      console.log(e);
    }
    if (!info) {
      Message.error('用户不存在');
      return;
    }
    setUserInfo(info);
  };

  const goPath = async (res) => {
    try {
      const data = await sdk.createConversation({
        type: 'single',
        subUserId: res,
      });
      setPagePath({ activeIcon: 'chat', cid: data.cid });
    } catch (e) {
      Message.error('操作失败');
      return;
    }
  };

  const showPhoneFun = () => {
    setShowPhoneFlage(!showPhoneFlage);
  };

  const openImPhone = async () => {
    let userId =
      newUseDataProps?.userId ||
      useDataProps?.userId ||
      conversationDetail?.userId ||
      conversationDetail?.subUserId;
    try {
      const res = await sdk.queryUserInfoById({ queryUserId: userId });
      const getInfo = await sdk.setCurrentCid(res.sessionVo.cid);
      setConferenceModalVisible(true);
      setConferenceModalProps({
        cid: res.sessionVo.cid,
        rtcAction: RtcAction.Invite,
        from: {
          userId: globalUserInfo.userId,
          avatarUrl: globalUserInfo.avatarUrl,
          nickName: globalUserInfo.nickName,
        },
        to: {
          userId: userId,
          avatarUrl: getInfo.singleSubUser?.avatarUrl,
          nickName: getInfo.singleSubUser?.nickName,
        },
        rtcType: 'AUDIO',
      });
      await sdk.sendMessage({
        msgType: ContentType.Rtc,
        msgContent: { rtcAction: RtcAction.Invite, rtcType: 'AUDIO' },
      });
    } catch (e: any) {
      Message.error(e.errorMessage || e.message);
    }
  };
  const listPath = (val) => {
    // JSON.parse(newUseDataProps?.departments)[0].deptName
    let list = JSON.parse(val);
    if (list.length) {
      let outList = list
        .map((x) => {
          return x.deptName;
        })
        .join(' | ');
      return outList;
    }
  };

  const [surfaceRemak, setSurfaceRemak] = useState('');

  const handleModifyNotice = async (val) => {
    if (val.length) {
      try {
        let params = {
          updateType: 'ALL',
          remark: val,
          invitedUserId:
            newUseDataProps?.userId ||
            useDataProps?.userId ||
            conversationDetail?.userId ||
            conversationDetail?.subUserId,
        };
        await sdk.updateGoodFriendRelationInfo(params);
        Message.success('设置成功');
        setRemak(false);
        setSurfaceRemak(val);
      } catch (e) {
        Message.error(e.errorMessage);
      }
    }

    // try {
    //   await sdk.updateGroup({
    //     cid,
    //     updateType: 'notice',
    //     group: { notice: value },
    //   });
    // } catch (e: any) {
    //   Message.error(e.message);
    // }
    // setModifyFieldProps({ ...modifyFieldProps, noticeVisible: false });
    // queryConversationDetail();
    // onConverInfoChange({ notice: value });
  };
  // 判断是否同组织架构
  // 如果是好友是联系人就可以聊天
  const isEach = () => {
    console.log(globalUserInfo, newUseDataProps, 'ppfefe');
    if (newUseDataProps?.departments) {
      if (
        JSON.parse(newUseDataProps?.departments)[0].deptName ==
        JSON.parse(globalUserInfo?.departments)[0].deptName
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  return (
    <div className="UserMoreCard">
      {newType == 'add' && !noShowCLose && (
        <CloseOutlined className="closeIcon" onClick={closeCard} />
      )}
      <div className="cardHead">
        <AvatarImage
          src={conversationDetail?.subAvatarUrl}
          nickName={
            conversationDetail?.nickName ||
            conversationDetail?.userName ||
            useDataProps?.nickName
          }
          userName={
            conversationDetail?.userName ||
            useDataProps?.nickName ||
            conversationDetail?.nickName
          }
          userId={conversationDetail?.userId || conversationDetail?.subUserId}
          style={{
            marginBottom: '1vw',
            borderRadius: '1.07vw',
            width: '42px',
            height: '42px',
            marginRight: '2vw',
            marginLeft: '1vw',
            marginTop: '1vw',
          }}
          fit="cover"
        />
        <div className="cardHeadData">
          <div className="cardHeadDataName">
            {conversationDetail.nickName ||
              conversationDetail.userName ||
              useDataProps?.nickName ||
              useDataProps?.userName}
          </div>
          <div className="cardHeadDataFun">
            <img
              onClick={openImPhone}
              src={require('../../assets/phone.png')}
              alt=""
            />
            {newType == 'del' ? (
              <div className="userConcern">
                {userInfo?.isConcern ? (
                  <img
                    onClick={removeConcern}
                    src={require('../../assets/starIn.png')}
                    alt=""
                  />
                ) : (
                  <img
                    onClick={addConcern}
                    src={require('../../assets/star@2x.png')}
                    alt=""
                  />
                )}
              </div>
            ) : (
              ''
            )}

            {newType == 'add' ? (
              <img
                onClick={() => {
                  setaddUserId(newUseDataProps?.userId || useDataProps?.userId);
                }}
                src={require('../../assets/userplus.png')}
                alt=""
              />
            ) : (
              <img
                onClick={delFriend}
                src={require('../../assets/iconPark-people-delete-one@2x.png')}
                alt=""
              />
            )}
          </div>
        </div>
      </div>
      <div className="cardMsg">
        <div className="cardMsgLi">
          <div className="li">
            <span className="li-title">电话</span>
            <div className="li-div">
              {showPhoneFlage ? (
                <span className="nowrap">
                  +86-
                  {newUseDataProps?.phoneNo
                    ? filterPhone(newUseDataProps.phoneNo, true)
                    : ''}
                </span>
              ) : (
                <span className="nowrap">
                  +86-
                  {newUseDataProps?.phoneNo
                    ? filterPhone(newUseDataProps.phoneNo, false)
                    : ''}
                </span>
              )}
              <span className="li-show" onClick={showPhoneFun}>
                {showPhoneFlage ? '点击关闭' : '点击查看'}
              </span>
            </div>
          </div>
          <div className="li">
            <span className="li-title nowrap">部门</span>
            <div className="li-div-wrap">
              <span className="wrap">
                {newUseDataProps?.departments
                  ? listPath(newUseDataProps.departments)
                  : ''}
              </span>
            </div>
          </div>
          {/* <div className="li">
            <span className="li-title">备注</span>
            <div className="li-div">
              {remak ? (
                <Input
                  maxLength={40}
                  defaultValue={conversationDetail.notice}
                  onBlur={(e) => handleModifyNotice(e.target.value)}
                />
              ) : (
                <span className="nowrap">
                  {surfaceRemak ||
                    useDataProps?.goodFriendRemark ||
                    newUseDataProps?.mark ||
                    newUseDataProps?.nickName}
                </span>
              )}
              <img
                onClick={openRemakInput}
                src={require('../../assets/antOutline-edit@2x.png')}
                alt=""
              />
            </div>
          </div> */}
        </div>
        {newType == 'add' ? (
          <div className="btnBox">
            <Button
              type="primary"
              className="btn"
              onClick={() =>
                setaddUserId(
                  newUseDataProps.userId || conversationDetail.subUserId,
                )
              }
            >
              添加好友
            </Button>
            {/* {isEach() && ( */}
            <Button
              type="primary"
              className="btn"
              onClick={() =>
                goPath(newUseDataProps.userId || conversationDetail.subUserId)
              }
            >
              发送消息
            </Button>
            {/* )} */}
          </div>
        ) : clickType == 'goPath' ? (
          <Button
            type="primary"
            className="btn"
            onClick={() =>
              goPath(newUseDataProps.userId || conversationDetail.subUserId)
            }
          >
            发送消息
          </Button>
        ) : (
          <Button
            type="primary"
            className="btn"
            onClick={() =>
              goPath(newUseDataProps.userId || conversationDetail.subUserId)
            }
          >
            发送消息
          </Button>
        )}
      </div>
    </div>
  );
};

export default UseMsgCard;
