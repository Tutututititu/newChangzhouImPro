import React, { useState, useEffect } from 'react';
import {
  List,
  Button,
  Modal,
  Input,
  message as Message,
  Dropdown,
  Menu,
} from 'antd';
import classnames from 'classnames';
import { DashOutlined } from '@ant-design/icons';
import LayoutCenterHeader from '@/components/LayoutCenterHeader';
import { useModel } from 'umi';
import { tag } from '@/typings/collect';
import './style.less';

export default function (props: { changeTagType: (t: any) => void }) {
  const { sdk } = useModel('global');
  const [tags, setTags] = useState<Array<tag>>([]);
  const [tagModalParams, setTagModalParams] = useState({
    visible: false,
    code: '',
    title: '新增标签',
  });
  const [newTagName, setNewTagName] = useState<string>('');
  const [tagItemActive, setTagItemActive] = useState<string>('');
  const { changeTagType } = props;

  const getTagsData = async () => {
    const tsgData = await sdk.queryFavoriteTags();
    setTags(tsgData);
  };

  useEffect(() => {
    getTagsData();
  }, []);

  const onAddInputChange = (e: any) => {
    setNewTagName(e.target.value);
  };

  const handleAddTag = async () => {
    const params: any = { tagName: newTagName };
    if (tagModalParams.code) {
      params.tagCode = tagModalParams.code;
    }
    await sdk.addOrUpdateFavoriteTag(params);
    Message.success(tagModalParams.code ? '标签已更新' : '新增成功');
    setNewTagName('');
    if (tagModalParams.title == '重命名标签') {
      tagModalParams.title = '新建标签';
    }
    setTagModalParams({ ...tagModalParams, visible: false });
    getTagsData();
  };

  const deleteFavoriteTag = async (tagCode: string) => {
    try {
      await sdk.deleteFavoriteTag({ tagCode });
    } catch (e) {
      Message.error(e.errorMessage);
      return;
    }
    Message.success('标签已删除');
    changeTagType('');
    getTagsData();
  };
  const changeTag = (t: tag) => {
    changeTagType(t);
    setTagItemActive(t.code);
  };
  const cancelTagLog = () => {
    if (tagModalParams.title == '重命名标签') {
      tagModalParams.title = '新建标签';
    }
    setTagModalParams({ ...tagModalParams, visible: false });
  };
  return (
    <div className="collectListPage" style={{ height: window.innerHeight }}>
      <LayoutCenterHeader title="我的收藏" />
      <Button
        type="primary"
        onClick={() =>
          setTagModalParams({ ...tagModalParams, visible: true, code: '' })
        }
      >
        新建标签
      </Button>
      <div className="TagList">
        <List
          itemLayout="horizontal"
          dataSource={tags}
          renderItem={(t: tag) => (
            <List.Item
              key={t.code}
              className={classnames([
                'tagItem',
                tagItemActive === t.code ? 'tagItemActive' : '',
              ])}
              onClick={() => changeTag(t)}
              actions={[
                <Dropdown
                  key="actions"
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="rename"
                        onClick={() =>
                          setTagModalParams({
                            ...tagModalParams,
                            code: t.code,
                            visible: true,
                            title: '重命名标签',
                          })
                        }
                      >
                        重命名
                      </Menu.Item>
                      <Menu.Item
                        key="delete"
                        onClick={() => deleteFavoriteTag(t.code)}
                      >
                        删除
                      </Menu.Item>
                    </Menu>
                  }
                  placement="bottom"
                  arrow
                >
                  <DashOutlined />
                </Dropdown>,
              ]}
            >
              {t.name}
            </List.Item>
          )}
        />
      </div>
      <Modal
        title={tagModalParams?.title || '新建标签'}
        open={tagModalParams.visible}
        width={450}
        onOk={() => handleAddTag()}
        onCancel={() => cancelTagLog()}
      >
        <Input
          key="newTag"
          placeholder="请输入新标签名称"
          maxLength={20}
          onChange={onAddInputChange}
          style={{ width: 345 }}
          value={newTagName}
        />
      </Modal>
    </div>
  );
}
