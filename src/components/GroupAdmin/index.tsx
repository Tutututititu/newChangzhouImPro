import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  Button,
  List,
  Popover,
  Checkbox,
  message as Message,
} from 'antd';
import './style.less';
import AvatarImage from '@/components/AvatarImage';
import { useModel } from '@@/plugin-model/useModel';
import GroupMemberSelectContactor from '@/components/GroupMemberSelectContactor';
interface PropsType {
  visible: boolean;
  title: string;
  cid: string;
  getListApi: string;
  listFilterFunc?: (list: any[]) => any[];
  onOk: (arg0: any) => void;
  onClose: () => void;
}
export default function (props: any) {
  const {
    visible,
    title,
    cid,
    getListApi,
    listFilterFunc,
    onOk,
    onClose,
    administratorsFlag,
  } = props;
  console.log(props, 'props');
  const {
    sdk,
    userInfo: { userId: myUserId },
    mySdkStore,
  } = useModel('global');
  const [list, setList] = useState([]);
  const [groupMemberSelectContactorProp, setGroupMemberSelectContactorProp] =
    useState({
      visible: false,
      getListApi: '',
      onOk: () => {},
      onClose: () => {},
    });
  const [admin, setAdmin] = useState([]);
  useEffect(() => {
    getAdminUserInfo();
  }, []);
  const getAdminUserInfo = async () => {
    const res = await sdk.querySingleConversation({ cid });
    setAdmin(res.adminUsers);
    const { rows } = await sdk[getListApi]({
      cid,
      pageIndex: 1,
      pageSize: 500,
    });

    console.log(rows, '-----');

    // 管理员情况将管理员过滤出来
    if (administratorsFlag) {
      let newRows = rows.filter((v) => v.roleId === 2);
      setList(newRows);
    } else {
      setList(rows);
    }
  };
  const handleRemove = async (userId: any) => {
    const res = await sdk.updateGroup({
      cid,
      updateType: 'remove_admin_user',
      group: { adminUsers: [userId] },
    });
    setAdmin(res.adminUsers);
  };
  useEffect(() => {}, [admin]);
  const handleOk = () => {};
  const handleAdd = async (val) => {
    let params = { adminUsers: val };
    try {
      const res = await sdk.updateGroup({
        cid,
        updateType: 'add_admin_user',
        group: params,
      });
      // console.log(res.adminUsers, 'p');
      setAdmin(res?.adminUsers);
    } catch (e) {
      Message.error(e.errorMessage);
    }
  };
  return (
    <Modal title="配置群管理员" open={visible} onCancel={onClose} footer={null}>
      <div className="selectContractorComponent selectModal">
        <List style={{ marginTop: 12, '--border-inner': 0 }}>
          {list.map((item) => {
            return (
              <List.Item
                key={item.userId}
                extra={
                  !administratorsFlag &&
                  (admin.includes(item.userId) ? (
                    <Button
                      style={{
                        '--background-color': 'rgba(0,34,60,.2)',
                        '--text-color': 'rgba(0,0,0,0.65)',
                      }}
                      size="small"
                      onClick={() => handleRemove(item.userId)}
                    >
                      移除
                    </Button>
                  ) : (
                    <Button
                      style={{
                        '--background-color': 'rgba(0,34,60,.2)',
                        '--text-color': 'rgba(0,0,0,0.65)',
                      }}
                      size="small"
                      onClick={() => handleAdd(item.userId)}
                    >
                      新增
                    </Button>
                  ))
                }
              >
                <List.Item.Meta
                  avatar={
                    <AvatarImage
                      src={item.avatarUrl}
                      nickName={item.nickName}
                      userName={item.userName}
                      userId={item.userId}
                      style={{ borderRadius: 8 }}
                      fit="cover"
                      width={40}
                      height={40}
                    ></AvatarImage>
                  }
                  title={item.userName}
                ></List.Item.Meta>
                {/* </Checkbox> */}
              </List.Item>
            );
          })}
        </List>
      </div>
    </Modal>
  );
}
