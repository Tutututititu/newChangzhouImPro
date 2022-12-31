import React, { useState, useEffect } from 'react';
import { useModel, history } from 'umi';
import { Drawer, List, Switch, message as Message, Popover } from 'antd';
import GroupMemberSelectContactor from '@/components/GroupMemberSelectContactor/index';
import GroupAdmin from '@/components/GroupAdmin';
import QRCode from '@/components/QRCode';
import './style.less';
import { RightOutlined } from '@ant-design/icons';

export default function (props: any) {
  const {
    childrenDrawer,
    onChildrenDrawerClose,
    cid,
    onClose,
    img,
    isOwner,
    administratorsFlag,
  } = props;
  const { sdk, userInfo } = useModel('global');
  const [settings, setSettings] = useState({});
  const [admin, setAdmin] = useState([]);
  const [groupMemberSelectContactorProp, setGroupMemberSelectContactorProp] =
    useState({
      visible: false,
      getListApi: '',
      onOk: () => {},
      onClose: () => {},
    });
  const [groupAdminProp, setGroupAdminProp] = useState({
    visible: false,
    getListApi: '',
    onOk: () => {},
    onClose: () => {},
  });

  let [QRC, setQRC] = useState();
  useEffect(() => {
    let params = userInfo;
    params.cid = cid;
    console.log(params, 'ppopoop');
    params.img = img;
    setQRC(params);
  }, [cid]);

  console.log(groupMemberSelectContactorProp, '--');

  const fetchDetail = async () => {
    const { groupSetting } = await sdk.queryGroupSetting({ cid });
    setSettings(groupSetting);
  };
  useEffect(() => {
    // sdk.onGroupMembersChange = (res) => updateMembers(res);
    fetchDetail();
  }, []);
  // const updateMembers = (res) => {
  //   console.log(res, '群 - 更 - 新');
  //   fetchDetail();
  // };

  const handleTransferOwner = async (userId) => {
    try {
      await sdk.updateGroup({
        cid,
        updateType: 'owner',
        group: { ownerId: userId },
      });
      Message.success('转让成功');
      setGroupMemberSelectContactorProp({ visible: false });
      onChildrenDrawerClose();
      onClose();
    } catch (e: any) {
      Message.error(e.message || e.errorMessage);
    }
  };
  const handleAdd = async (userIds: { userId: any }[]) => {
    const adminUsers = userIds.map(({ userId }) => userId);
    try {
      await sdk.updateGroup({
        cid,
        updateType: 'add_admin_user',
        group: { adminUsers },
      });
      Message.success('添加群管理员');
      setGroupAdminProp({ visible: false });
      onChildrenDrawerClose();
      onClose();
    } catch (e: any) {
      Message.error(e.message || e.errorMessage);
    }
  };
  const handleGroupAdmin = async () => {
    setGroupAdminProp({
      visible: true,
      title: '添加群管理员',
      cid,
      getListApi: 'listGroupMembers',
      listFilterFunc: (list: any[]) =>
        list.filter((item) => admin.indexOf(item.userId) === -1),
      onOk: handleAdd,
      onClose: () => setGroupAdminProp({ visible: false }),
    });
  };
  const handleAddAdminVisible = async () => {
    setGroupMemberSelectContactorProp({
      visible: true,
      title: '转让群主',
      cid,
      getListApi: 'listGroupMembers',
      listFilterFunc: (list: any[]) => list.filter((item) => item.roleId !== 1),
      onOk: handleTransferOwner,
      onClose: () => setGroupMemberSelectContactorProp({ visible: false }),
    });
  };

  const [showChatQRC, setShowChatQRC] = useState(false);

  const handleQRCodeVisible = () => {
    setShowChatQRC(!showChatQRC);
  };

  const handleChangeSetting = async (changedInfo) => {
    // todo: 后端似乎没更新上
    await sdk.saveGroupSetting({ cid, groupSetting: changedInfo });
    setSettings({ ...settings, ...changedInfo });
  };

  return (
    <Drawer
      closable={false}
      onClose={onChildrenDrawerClose}
      open={childrenDrawer}
      // mask={false}
    >
      <div className="chatGroupPermissionPage">
        {/* <List style={{ margin: '12px 0' }}>
        <List.Item extra={<Switch checked={settings.isAllowUser}  onChange={() => handleChangeSetting({ isAllowUser: !settings.isAllowUser })} />}>
          仅群主和管理员可管理
        </List.Item>
      </List> */}
        {/* <List style={{ margin: '12px 0' }}>
        <List.Item extra={<Switch />}>
          群快捷键
        </List.Item>
        <List.Item onClick={() => {}}>
          快捷键管理
        </List.Item>
      </List> */}
        <List style={{ margin: '12px 0' }}>
          <List.Item onClick={handleGroupAdmin}>
            群管理员
            <RightOutlined />
          </List.Item>
          {/* <List.Item
            extra={
              <Switch
                checked={settings.isAllowAdminTopMessage}
                onChange={() =>
                  handleChangeSetting({
                    isAllowAdminTopMessage: !settings.isAllowAdminTopMessage,
                  })
                }
              />
            }
          >
            仅群主和管理员可置顶消息
          </List.Item> */}
          {/* <List.Item
            extra={
              <Switch
                checked={setSettings.isAllowAdminAtAll}
                onChange={() =>
                  handleChangeSetting({
                    isAllowAdminAtAll: !settings.isAllowAdminAtAll,
                  })
                }
              />
            }
          >
            仅群主和管理员可@所有人
          </List.Item> */}
        </List>
        {/* <List style={{ margin: '12px 0' }}>
          <List.Item
            extra={
              <Switch
                checked={setSettings.isAllowSearchGroupId}
                onChange={() =>
                  handleChangeSetting({
                    isAllowSearchGroupId: !settings.isAllowSearchGroupId,
                  })
                }
              />
            }
          >
            群可被搜索
          </List.Item>
        </List> */}
        {/* <List style={{ margin: '12px 0' }}>
          <List.Item
            // onClick={() => {
            //   history.push({ pathname: `/groupPermissionMute/${cid}` });
            // }}
          >
            群内设置禁言
            <RightOutlined />
          </List.Item>
          <List.Item
            extra={
              <Switch
                checked={setSettings.isShowHistoryMessage}
                onChange={() =>
                  handleChangeSetting({
                    isShowHistoryMessage: !settings.isShowHistoryMessage,
                  })
                }
              />
            }
          >
            新成员可查看聊天历史
          </List.Item>
        </List> */}
        {/* <List style={{ margin: '12px 0' }}>
          <List.Item
            extra={
              <Switch
                checked={settings.isDisbandGroup}
                onChange={() =>
                  handleChangeSetting({
                    isDisbandGroup: !settings.isDisbandGroup,
                  })
                }
              />
            }
          >
            群成员退群成员数{'<'}1时解散群
          </List.Item>
          <List.Item
            extra={
              <Switch
                checked={setSettings.isAllowMemberTalkSecret}
                onChange={() =>
                  handleChangeSetting({
                    isAllowMemberTalkSecret: !settings.isAllowMemberTalkSecret,
                  })
                }
              />
            }
          >
            禁止群成员私聊
          </List.Item>
        </List> */}
        {/* <List>
          <List.Item
            extra={
              <Switch
                checked={setSettings.isAllowNotice}
                onChange={() =>
                  handleChangeSetting({
                    isAllowNotice: !settings.isAllowNotice,
                  })
                }
              />
            }
          >
            支持群公告
          </List.Item>
          <List.Item
            extra={
              <Switch
                checked={settings.isAllowInputAt}
                onChange={() =>
                  handleChangeSetting({
                    isAllowInputAt: !settings.isAllowInputAt,
                  })
                }
              />
            }
          >
            试试直接输入@
          </List.Item>
        </List> */}
        {isOwner && !administratorsFlag ? (
          <List style={{ margin: '12px 0' }}>
            <List.Item onClick={handleAddAdminVisible}>
              转让群主
              <RightOutlined />
            </List.Item>
          </List>
        ) : (
          ''
        )}
        <List style={{ margin: '12px 0' }}>
          <Popover
            content={<QRCode {...QRC} type={'group'} />}
            trigger="click"
            placement="left"
            key="chatKey"
          >
            <List.Item onClick={handleQRCodeVisible}>
              群二维码
              <RightOutlined />
            </List.Item>
          </Popover>
        </List>
        {groupAdminProp.visible && (
          <GroupAdmin
            administratorsFlag={administratorsFlag}
            {...groupAdminProp}
          />
        )}
        {groupMemberSelectContactorProp.visible && (
          <GroupMemberSelectContactor {...groupMemberSelectContactorProp} />
        )}
      </div>
    </Drawer>
  );
}
