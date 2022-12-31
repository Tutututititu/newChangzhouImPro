import React, { useState } from 'react';
import { useModel, history } from 'umi';
import { Modal, Form, Radio, Input, Select, message as Message } from 'antd';

interface Props {
  onClose: () => void;
}

export default function (props: Props) {
  const { sdk } = useModel('global');
  const { onClose } = props;
  const [form] = Form.useForm();
  const [type, setType] = useState('selectId');

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  const handleOk = async () => {
    const { userId } = await form.validateFields();
    try {
      const { cid } = await sdk.createConversation({
        type: 'single',
        subUserId: userId,
      });
      history.push({ pathname: '/gov/cz/index_dev', query: { cid } });
      onClose();
    } catch {
      Message.error('创建单聊失败');
    }
  };

  return (
    <Modal
      visible
      title="发起单聊"
      width={480}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Form layout="vertical" form={form} initialValues={{ type }}>
        <Form.Item label="选择方式" name="type">
          <Radio.Group onChange={handleTypeChange}>
            <Radio value="selectId">选择联系人</Radio>
            <Radio value="inputId">用户ID添加</Radio>
          </Radio.Group>
        </Form.Item>
        {type === 'selectId' ? (
          <Form.Item
            name="userId"
            label="选择对象"
            required
            rules={[{ required: true }]}
          >
            <Select placeholder="请选择">
              <Select.Option value={1}>1</Select.Option>
            </Select>
          </Form.Item>
        ) : (
          <Form.Item
            name="userId"
            label="用户ID"
            required
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
