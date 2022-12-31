import React, { useState, useRef } from 'react';
import { Drawer, Space, Button, Spin } from 'antd';
import { Editor } from '@tinymce/tinymce-react';

import './style.less';

interface Props {
  onOk: () => void;
  onClose: () => void;
}

export default function ({ onOk, onClose }: Props) {
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const handleSend = () => {
    if (!editorRef.current) {
      return;
    }
    const richText = editorRef.current.getContent();
    onOk(richText);
  };

  return (
    <Drawer
      visible
      title="富文本"
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
      <div
        style={{
          marginTop: 70,
          textAlign: 'center',
          display: loading ? 'block' : 'none',
        }}
      >
        <Spin />
        <p style={{ color: 'rgba(0,0,0,.45)', marginTop: 24 }}>
          富文本编辑器加载中...
        </p>
      </div>
      <div className="sendRichTextPage">
        <Editor
          // todo key
          apiKey="your-api-key"
          onInit={(evt, editor) => {
            editorRef.current = editor;
            setLoading(false);
          }}
          // initialValue="<p>This is the initial content of the editor.</p>"
          init={{
            height: '600',
            menubar: false,
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'preview',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'code',
              'help',
              'wordcount',
            ],
            toolbar:
              'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style:
              'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          }}
        />
      </div>
    </Drawer>
  );
}
