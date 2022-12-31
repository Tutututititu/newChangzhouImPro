import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Modal, Form, Select } from 'antd';

import AvatarImage from '../AvatarImage';
import { ConversationType } from '@/constants';

import { ConversationList } from '@/typings/chat';

interface Props {
  onOk: (selectedItems: { cid: string }[]) => void;
  onClose: () => void;
  listFilterFunc?: (list: ConversationList) => ConversationList;
}

export default function (props: Props) {
  const { sdk } = useModel('global');
  const { onOk, onClose, listFilterFunc } = props;
  const [form] = Form.useForm<{ single: string[]; group: string[] }>();
  const [singleOptions, setSingleOptions] = useState<ConversationList>([]);
  const [groupOptions, setGroupOptions] = useState<ConversationList>([]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const { single = [], group = [] } = values;
      onOk([...single, ...group].map((cid) => ({ cid })));
    });
  };

  const getList = async (pageIndex: number, type: string) => {
    // todo: 缺少totalpage，或totalItemCount
    const res = await sdk.queryConversationList({
      pageIndex,
      type,
      pageSize: 40,
    });
    let { list: rows } = res;
    if (typeof listFilterFunc === 'function') {
      rows = listFilterFunc(rows);
    }
    if (type === ConversationType.Single) {
      setSingleOptions((list) => (pageIndex === 1 ? rows : [...list, ...rows]));
    } else {
      setGroupOptions((list) => (pageIndex === 1 ? rows : [...list, ...rows]));
    }
  };

  useEffect(() => {
    getList(1, ConversationType.Single);
    getList(1, ConversationType.Group);
  }, []);

  return (
    <Modal
      title="选择转发对象"
      visible
      width={480}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Form name="transferMessageForm" form={form} layout="vertical">
        <Form.Item
          label="选择联系人"
          name="single"
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (value || getFieldValue('group')) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('请至少选择一个联系人或群聊'));
              },
            }),
          ]}
        >
          <Select
            mode="multiple"
            placeholder="请选择，可多选"
            optionLabelProp="label"
          >
            {singleOptions.map((item) => (
              <Select.Option
                key={item.cid}
                value={item.cid}
                label={item.nickName}
              >
                <AvatarImage
                  src={item.subAvatarUrl || item.logoUrl}
                  style={{ marginRight: 8 }}
                  width={32}
                />
                {item.nickName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="选择群聊" name="group">
          <Select
            mode="multiple"
            placeholder="请选择，可多选"
            optionLabelProp="label"
          >
            {groupOptions.map((item) => (
              <Select.Option
                key={item.cid}
                value={item.cid}
                label={item.sessionName}
              >
                <AvatarImage
                  src={item.subAvatarUrl || item.logoUrl}
                  style={{ marginRight: 8 }}
                  width={32}
                />
                {item.sessionName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
