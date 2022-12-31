import React, { useEffect, useState } from 'react';
import { Popover, message as Message } from 'antd';
import { useModel, history } from 'umi';
import {
  FileSearchOutlined,
  UserAddOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import AvatarImage from '../AvatarImage';
import ChatDetailSetting from '@/pages/Chat/ChatDetailSetting';
import ChatGroupDetailSetting from '@/pages/Chat/ChatGroupDetailSetting';
import SelecteGroupMember from '@/components/SelecteGroupMember';
import MessageSearch from '@/pages/Chat/MessageSearch';
import UserInfoModal from '@/components/UserInfoModal';
import UserMoreCard from '../../components/UseMsgCard/useMsgCard';
import PubSub from 'pubsub-js';

import { ConversationType } from '@/constants';

import './style.less';

interface Props {
  converInfo: any;
  onConverInfoChange: (changeInfo: { [field: string]: any }) => void;
}

export default function (props: Props) {
  const { sdk, pagePath, setPagePath } = useModel('global');
  const { converInfo, onConverInfoChange, getConverInfoChange, useDataProps } =
    props;

  const [useData, setUseDataProps] = useState();
  useEffect(() => {
    if (useDataProps) {
      useDataProps.then((res) => {
        setUseDataProps(res);
      });
    }
  }, [useDataProps]);

  const [organizationTitle, setOrganizationTitle] = useState('');

  const { cid } = converInfo;
  useEffect(() => {
    if (chatDetailSettingVisible) {
      setChatDetailSettingVisible(() => {
        return false;
      });
    }
    setTimeout(() => {
      console.log(pagePath, '!!!---!!');

      if (pagePath?.action == 'openSeting') {
        setChatDetailSettingVisible(() => {
          return true;
        });
        let params = pagePath;
        params.action = '';
        setPagePath({ ...params });
      }
    }, 600);
  }, [cid]);
  useEffect(() => {
    console.log(useData, 'ppp--!!');

    if (useData?.departments) {
      let res = JSON.parse(useData?.departments);
      setOrganizationTitle(listPath(res));
    } else {
      setOrganizationTitle('');
    }
  }, [useData]);
  const [chatDetailSettingVisible, setChatDetailSettingVisible] =
    useState(false);
  const [addToGroupVisible, setAddToGroupVisible] = useState(false);
  const [messageSearchVisbile, setMessageSearchVisbile] = useState(false);
  const [addToGroupModalProps, setAddToGroupModalProps] = useState({});

  const handleChatDetailSettingVisible = () => {
    getConverInfoChange();
    setChatDetailSettingVisible(false);
  };
  const listPath = (val) => {
    console.log(val, 'pp1111');

    // JSON.parse(newUseDataProps?.departments)[0].deptName
    let list = val;
    if (list.length) {
      let outList = list
        .map((x) => {
          return x.deptName;
        })
        .join(' | ');
      return outList;
    }
  };

  const handleAddToGroupModalVisible = async () => {
    let inCatList;
    if (ConversationType.Group === converInfo.type) {
      const res = await sdk.listGroupMembers({
        cid,
        pageIndex: 1,
        pageSize: 500,
      });
      let { rows } = res;
      if (rows.length) {
        inCatList = rows.map((x) => {
          return x.userId;
        });
      }
    }

    setAddToGroupVisible(true);
    if (ConversationType.Single === converInfo.type) {
      setAddToGroupModalProps({
        type: 'create',
        subUser: converInfo.singleSubUser,
      });
    } else if (ConversationType.Group === converInfo.type) {
      setAddToGroupModalProps({ type: 'add', cid, inCatList });
    }
  };

  const avatarTitle = converInfo.groupSession ? (
    <>
      <AvatarImage
        src={converInfo.sessionLogoUrl}
        nickName={converInfo.nickName}
        userName={converInfo.userName}
        userId={converInfo.subUserId}
        style={{
          display: 'inline-block',
          borderRadius: 8,
          marginRight: 12,
        }}
        fit="cover"
        width={36}
        height={36}
      />
      {converInfo.name}
    </>
  ) : (
    <span className="topData">
      <AvatarImage
        src={converInfo.sessionLogoUrl}
        nickName={converInfo.nickName}
        userName={converInfo.userName}
        userId={converInfo.subUserId}
        style={{
          // display: 'flex',
          // flexDirection: 'column',
          borderRadius: 8,
          marginRight: 12,
        }}
        fit="cover"
        width={36}
        height={36}
      />
      <div>
        <div>{converInfo.singleSubUser?.nickName}</div>
        <div className="department">{organizationTitle}</div>
      </div>
    </span>
  );
  let [open, setOpen] = useState(false);
  const successMsg = () => {
    Message.success('删除成功');
    setOpen(false);
  };
  const handleOpenChange = () => {
    setOpen(!open);
  };
  const [addUserId, setaddUserId] = useState('none');
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

  return (
    <>
      <div className="topOperationBarComponent">
        {ConversationType.Single !== converInfo.type ? (
          avatarTitle
        ) : (
          <Popover
            open={open}
            onOpenChange={handleOpenChange}
            destroyTooltipOnHide
            trigger={'click'}
            placement="topLeft"
            overlayClassName="userInfoPopover"
            // content={<UserInfoModal userId={converInfo.subUserId} />}
            content={
              <UserMoreCard
                successMsg={successMsg}
                conversationDetail={converInfo}
                useDataProps={useData}
                getUseDataMore={useData?.subUserId || useData?.userId}
                setaddUserId={setaddUserId}
                noShowCLose={true}
              />
            }
          >
            {avatarTitle}
          </Popover>
        )}
        <div>
          <FileSearchOutlined
            style={{ fontSize: 20, marginRight: 30, cursor: 'pointer' }}
            onClick={() => setMessageSearchVisbile(true)}
          />
          <UserAddOutlined
            style={{ fontSize: 20, marginRight: 30, cursor: 'pointer' }}
            onClick={handleAddToGroupModalVisible}
          />
          <SettingOutlined
            style={{ fontSize: 20, cursor: 'pointer' }}
            onClick={() => setChatDetailSettingVisible(true)}
          />
        </div>
      </div>
      {chatDetailSettingVisible &&
        converInfo.type === ConversationType.Single && (
          <ChatDetailSetting
            cid={cid}
            converInfo={converInfo}
            onClose={handleChatDetailSettingVisible}
          />
        )}
      {chatDetailSettingVisible &&
        converInfo.type === ConversationType.Group && (
          <ChatGroupDetailSetting
            cid={cid}
            onClose={handleChatDetailSettingVisible}
            onConverInfoChange={onConverInfoChange}
          />
        )}

      {addToGroupVisible && (
        <SelecteGroupMember
          {...addToGroupModalProps}
          onClose={() => setAddToGroupVisible(false)}
        />
      )}

      {messageSearchVisbile && (
        <MessageSearch
          cid={cid}
          P={props}
          sessionName={converInfo.sessionName}
          onClose={() => setMessageSearchVisbile(false)}
        />
      )}
    </>
  );
}
