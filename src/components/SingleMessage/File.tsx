import React from 'react';
import { List } from 'antd';
import FileIcon from '@/components/FileIcon';

import { transferFileSize } from '../../utils';

import './style.less';

export default function (props) {
  const { type, size, fileName, url } = props.msgContent;

  const handleDownload = () => {
    const docA = document.createElement('a');
    docA.setAttribute('href', url);
    docA.setAttribute('download', fileName);
    docA.setAttribute('target', '_blank');
    console.log('href', url);
    console.log('download', fileName);
    console.log('d - o - w- - n');
    docA.click();
  };

  return (
    <List className="fileComponent">
      <List.Item onClick={handleDownload}>
        <List.Item.Meta
          avatar={<FileIcon type={type} />}
          title={<span className="fileName">{fileName}</span>}
          description={transferFileSize(size)}
        />
      </List.Item>
    </List>
  );
}
