import React, { useRef } from 'react';
import { useModel } from 'umi';
import { Modal, Form, Input, message as Message } from 'antd';

interface Props {
  onClose: () => void;
}

export default function(props: Props) {
  const { sdk } = useModel('global');
  const inputRef = useRef();
  const { onClose } = props;

  const handleOk = async () => {
    const value = inputRef?.current?.input?.value;
    sdk.queryUserInfoById({ queryUserId: value }).then((res: any) => {
      console.log('用户基本信息', res);

    });
    // await sdk.addFriend({ invitedUserId: value });
    // Message.success('请求已发送');
    // onClose();
  }

  return <Modal visible title="添加用户" width={480} onOk={handleOk} onCancel={onClose}>
    <Form layout="vertical">
      <Form.Item label="用户ID" required rules={[{ required: true }]}>
        <Input ref={inputRef} placeholder="请输入" />
      </Form.Item>
    </Form>
  </Modal>
}
