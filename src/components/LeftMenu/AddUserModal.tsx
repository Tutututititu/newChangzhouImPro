import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import { Modal, Form, Input, message as Message } from 'antd';
import UserMoreCard from '../../components/UseMsgCard/useMsgCard';
// import PubSub from 'pubsub-js';
import './addUserModal.less';
interface Props {
  onClose: () => void;
}

export default function (props: Props) {
  // useEffect(() => {
  //   PubSub.subscribe('addFriend', (name, res, id) => {
  //     if ( res == 'add' ) {
  //       console.log(id, 'ooooo');

  //       if (conversationDetail.userId) {
  //         handleOk(conversationDetail.userId);
  //       } else {
  //         Message.error('用户没有userId')
  //       }
  //     }
  //   });
  // }, [])
  const { sdk } = useModel('global');
  const inputRef = useRef();
  const { onClose } = props;
  const [openModal, setOpenModal] = useState(true);
  const [hintTitle, setHintTitle] = useState('');
  const [showUserMoreCard, setShowUserMoreCard] = useState(false);
  const [hintBody, setHintBody] = useState('');
  const [openModalTitle, setOpenModalTitle] = useState(false);
  const [conversationDetail, setConversationDetail] = useState({});
  const [useDataProps, setUseDataProps] = useState({});
  const handleGet = () => {
    if (hintTitle == '未查到人员') {
      onClose();
      return;
    }
    if (hintTitle == '已发送好友申请') {
      onClose();
      return;
    }
    const pageIndex = 1;
    const pageSize = 10;
    const value = inputRef?.current?.input?.value;
    if (!value) return Message.error('查询条件不能为空');
    sdk
      .searchUser({ searchKey: value, pageIndex, pageSize })
      .then(async (res) => {
        if (res.rows.length) {
          // 展示信息
          console.log(res.rows.member);
          let data = res.rows[0];
          setConversationDetail({
            subAvatarUrl: data.member.avatarUrl,
            nickName: data.member.nickName,
            userName: data.member.userName,
            userId: data.member.userId,
          });
          let params = {
            queryUserId: data.member.userId,
          };
          const useDataProps = await sdk.queryUserInfoById(params);
          setUseDataProps(useDataProps);
          setShowUserMoreCard(true);
        } else {
          // 提示
          setHintBody(
            '您所查询的好友尚未纳入数字政府统一门户组织架构中，请核实',
          );
          setHintTitle('未查到人员');
          setOpenModalTitle(true);
        }
        setOpenModal(false);
      });
  };
  const [addUserId, setaddUserId] = useState('none');
  useEffect(() => {
    if (addUserId == 'none') return;
    if (addUserId == '') {
      Message.error('userId为空');
      return;
    }
    handleOk(addUserId);
    setShowUserMoreCard(false);
  }, [addUserId]);

  const handleOk = async (value) => {
    try {
      await sdk.addFriend({ invitedUserId: value });
    } catch (e) {
      Message.error(e.errorMessage || e.message);
      onClose();
      return;
    }
    // Message.success('请求已发送');
    setHintBody('申请添加好友成功');
    setHintTitle('已发送好友申请');
    setOpenModalTitle(true);
    // onClose();
  };
  const closeList = () => {
    onClose();
  };
  return (
    <div className="addModal">
      {showUserMoreCard && (
        <UserMoreCard
          type={'add'}
          setShowUserMoreCard={setShowUserMoreCard}
          setaddUserId={setaddUserId}
          conversationDetail={conversationDetail}
          useDataProps={useDataProps}
          closeList={closeList}
        ></UserMoreCard>
      )}
      <Modal
        open={openModal}
        title="添加用户"
        width={480}
        onOk={handleGet}
        onCancel={onClose}
      >
        <Form layout="vertical">
          <Form.Item required rules={[{ required: true }]}>
            <Input ref={inputRef} placeholder="姓名/手机号" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={openModalTitle}
        title={hintTitle}
        width={480}
        onOk={handleGet}
        onCancel={onClose}
      >
        <span>{hintBody}</span>
      </Modal>
    </div>
  );
}
