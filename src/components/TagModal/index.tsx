import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import {
  Modal,
  Form,
  Select,
  Divider,
  Space,
  Input,
  message as Message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { TagList } from '@/typings/global';

interface Props {
  filterList?: (tagList: TagList) => TagList;
  onOk: (tagList: string[], allTagInfos: TagList) => void;
  onClose: () => void;
}

export default function (props: Props) {
  const { sdk } = useModel('global');
  const { filterList, onOk, onClose } = props;
  const [tags, setTags] = useState<TagList>([]);
  const [form] = Form.useForm<{ tagCodes: string[] }>();
  const [newTagName, setNewTagName] = useState<string>('');
  const [addFormError, setAddFormError] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    sdk.queryFavoriteTags().then((res: TagList) => {
      let tags = res;
      if (filterList) {
        tags = filterList(res);
      }
      setTags(tags);
    });
  }, [refreshCount]);

  const handleOk = () => {
    form.validateFields().then(({ tagCodes }) => {
      const allTagInfos = tags.filter((item) => tagCodes.includes(item.code));
      onOk(tagCodes, allTagInfos);
    });
  };

  const onAddInputChange = (e) => {
    setAddFormError(false);
    setNewTagName(e.target.value);
  };

  const handleAddTag = async () => {
    if (!newTagName) {
      setAddFormError(true);
      return;
    }

    await sdk.addOrUpdateFavoriteTag({ tagName: newTagName });
    Message.success('标签已新增');
    setNewTagName('');
    setRefreshCount(refreshCount + 1);
  };

  return (
    <Modal
      title="收藏"
      visible
      width={450}
      onOk={handleOk}
      onCancel={onClose}
      zIndex={1031}
    >
      <Form name="tagForm" form={form} layout="vertical">
        <Form.Item
          label="选择标签"
          name="tagCodes"
          rules={[{ required: true }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ padding: '0 8px 4px' }}>
                  <Input
                    placeholder="请输入新标签名称"
                    onChange={onAddInputChange}
                    style={{ width: 345 }}
                    value={newTagName}
                  />
                  <PlusOutlined
                    onClick={handleAddTag}
                    style={{
                      fontSize: 18,
                      color: 'rgba(0,0,0,0.45)',
                      cursor: 'pointer',
                    }}
                  />
                </Space>
                {addFormError && (
                  <div style={{ marginLeft: 8, color: '#ff4d4f' }}>
                    请先输入新标签名称
                  </div>
                )}
              </>
            )}
          >
            {tags.map((item) => (
              <Select.Option key={item.code}>{item.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
