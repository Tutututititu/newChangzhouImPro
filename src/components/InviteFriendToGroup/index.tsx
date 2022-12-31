import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import {
  Modal,
  Form,
  Input,
  Select,
  message as Message,
} from 'antd';
import {
  InfoCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { UserInfo, UserList } from '@/typings/global';

interface Props {
  cid: string;
  onClose: () => void;
}

export default function (props: Props) {
  const {
    sdk,
    userInfo: { userId: myUserId },
  } = useModel('global');
  const [userList, setUserList] = useState<UserList>([]);
  const [pagination, setPanination] = useState({ pageIndex: 1, totalPage: 1 });
  const { cid, onClose } = props;
  const [form] = Form.useForm();

  console.log(pagination);

  const getUserList = async (pageIndex: number) => {
    const data = await sdk.queryUsers({ cid: '', pageIndex, pageSize: 20 });
    const { rows = [], totalPage } = data;
    let newList = rows
      .filter((item: UserInfo) => item.userId !== myUserId)
      .map((item: UserInfo) => ({
        value: item.userId,
        label: item.nickName || item.userName || item.userId,
      }));
    setUserList(pageIndex === 1 ? newList : [...userList, ...newList]);
    setPanination({ pageIndex, totalPage });
  };

  useEffect(() => {
    getUserList(1);
  }, []);

  const handleOk = async () => {
    const { selectUserIds = [], inputUserIds = [] } =
      await form.validateFields();
    const objUserIds = [
      ...selectUserIds,
      ...inputUserIds.filter((item: string) => item),
    ].map((userId) => ({ userId }));

    try {
      // source: '0'邀请入群 '1' 扫码入群
      sdk
        .addMemberToGroup({ cid, source: '0', members: objUserIds })
        .then(() => {
          Message.success({
            content: '邀请群成员成功',
          });
        });
      onClose();
    } catch {
      Message.error('邀请入群失败');
    }
  };

  return (
    <Modal
      visible
      title="添加群成员"
      width={480}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Form
        layout="vertical"
        form={form}
        validateTrigger={['onChange', 'onSubmit']}
        initialValues={{ inputUserIds: ['', ''] }}
      >
        <Form.Item style={{ color: 'rgba(0,0,0,0.45)' }}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          至少选择一个方式选择对象
        </Form.Item>
        <Form.Item
          name="selectUserIds"
          label="选择对象"
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const inputUserIds = getFieldValue('inputUserIds').filter(
                  (item: string) => item,
                );

                if ([...inputUserIds, ...value].length >= 1) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('请至少选择或输入一个联系人'));
              },
            }),
          ]}
        >
          <Select
            placeholder="请选择"
            mode="multiple"
            options={userList}
          ></Select>
        </Form.Item>
        <Form.List name="inputUserIds">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  {...field}
                  label={index === 0 ? '用户ID' : ''}
                  key={field.key}
                  required={false}
                >
                  <Form.Item {...field} validateTrigger={['onBlur']} noStyle>
                    <Input placeholder="请输入" style={{ width: '94%' }} />
                  </Form.Item>
                  {index === 0 ? (
                    <PlusOutlined
                      onClick={() => add()}
                      style={{ marginLeft: 8 }}
                    />
                  ) : (
                    <MinusCircleOutlined
                      onClick={() => remove(field.name)}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </Form.Item>
              ))}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
