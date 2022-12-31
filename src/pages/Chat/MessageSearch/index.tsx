import React, { useState } from 'react';
import { Modal, Tabs, Input } from 'antd';
import TextMessage from './TextMessage';
import FileMessage from './FileMessage';
import PictureMessage from './PictureMessage';
import LinkMessage from './LinkMessage';

interface Props {
  cid: string;
  sessionName: SVGStringList;
  onClose: () => void;
}

export default function (props: Props) {
  const { cid, sessionName, onClose } = props;
  const [keyword, setKeyword] = useState('');

  const onChange = () => {};

  return (
    <Modal
      width={800}
      title={sessionName}
      visible
      footer={null}
      onCancel={onClose}
    >
      <Input.Search
        placeholder="搜索"
        enterButton
        style={{ marginBottom: 24 }}
        onSearch={(value) => setKeyword(value)}
      />
      <Tabs onChange={onChange} className="searchMessageTab">
        <Tabs.TabPane tab="全部" key="all">
          <TextMessage keyword={keyword} cid={cid} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="文件" key="file">
          <FileMessage keyword={keyword} cid={cid} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="图片与视频" key="picture">
          <PictureMessage keyword={keyword} cid={cid} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="链接" key="link">
          <LinkMessage cid={cid} keyword={keyword} />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
}
