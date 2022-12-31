import React from 'react';
import {
  FileExcelFilled,
  FileWordFilled,
  FileZipFilled,
  FilePptFilled,
  FilePdfFilled,
  FileMarkdownFilled,
  FileFilled,
} from '@ant-design/icons';

const defaultIconProps = {
  style: { color: 'rgba(44,151,255,1)', fontSize: 55 },
};

interface Props {
  type: string;
}

export default function (props: Props) {
  const { type, ...restProps } = props;
  const iconProps = { ...defaultIconProps, ...restProps };

  let Icon = <></>;

  switch (type) {
    case 'xls':
    case 'xlsx':
      Icon = <FileExcelFilled {...iconProps} />;
      break;

    case 'word':
      Icon = <FileWordFilled {...iconProps} />;
      break;

    case 'zip':
      Icon = <FileZipFilled {...iconProps} />;
      break;

    case 'ppt':
    case 'pptx':
      Icon = <FilePptFilled {...iconProps} />;
      break;

    case 'pdf':
      Icon = <FilePdfFilled {...iconProps} />;
      break;

    case 'markdown':
      Icon = <FileMarkdownFilled {...iconProps} />;
      break;

    default:
      Icon = <FileFilled {...iconProps} />;
      break;
  }
  return Icon;
}
