import React from 'react';
import { Drawer, Space, Input, Form, Button } from 'antd';

import './style.less';

export default function (props) {
  const { onOk, onClose } = props;
  const [form] = Form.useForm();

  const handleSend = () => {
    form.validateFields().then((value) => {
      onOk(value);
    });
  };

  return (
    <Drawer
      visible
      title="链接"
      width={480}
      onClose={onClose}
      bodyStyle={{ height: '100%', background: 'rgba(242,244,245,1)' }}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button onClick={handleSend} type="primary">
            发送
          </Button>
        </Space>
      }
    >
      <Form form={form} style={{ margin: '16px 0' }}>
        <Form.Item name="href" label="链接地址" rules={[{ required: true }]}>
          <Input placeholder="请输入链接地址" />
        </Form.Item>
        <Form.Item name="title" label="链接标题" rules={[{ required: true }]}>
          <Input placeholder="请输入链接标题" />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
