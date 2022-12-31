import React, { useEffect, useRef, useState } from 'react';
import { useModel, history } from 'umi';
import { Form, Input, Button, Space, Spin } from 'antd';

import styles from './style.less';

export default function () {
  const inputRef = useRef(null);
  const { login } = useModel('global');
  const [form] = Form.useForm();
  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef?.current]);
  const [loginFlage, setLoginFlage] = useState(false);

  useEffect(() => {
    if (history.location.query?.loginFlage === 'false') {
      setLoginFlage(false);
    }
  }, [history]);

  const handleLogin = async () => {
    const { userId, appId } = await form.validateFields();
    login(userId, appId);
  };

  return (
    <div className={styles.loginPage}>
      {loginFlage ? (
        <Space size="middle">
          <Spin size="large" />
        </Space>
      ) : (
        <div className={styles.loginBox}>
          <div className={styles.logoInfo} />
          <div className={styles.title}>IM+</div>
          <Form onFinish={handleLogin} form={form}>
            <Form.Item
              name="userId"
              rules={[{ required: true, message: '请输入用户ID' }]}
            >
              <Input placeholder="请输入用户ID" ref={inputRef} />
            </Form.Item>
            <Form.Item
              name="appId"
              rules={[{ required: true, message: '请输入APP ID' }]}
              initialValue={'9B16148C616CECA0'}
            >
              <Input placeholder="请输入APP ID" maxLength={50} />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" block type="primary">
                登 录
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
}
