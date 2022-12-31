import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Drawer, Space, Skeleton } from 'antd';
import moment from 'moment';
import { GlobalOutlined, CloseOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';

import SingleMessage from '../SingleMessage';
import AvatarImage from '../AvatarImage';

import { MsgTypeMap } from '../../constants';

import { CommonMessage, ConversationList } from '@/typings/chat';

import './style.less';

interface Props {
  cid: string;
  quotedInfo: any;
  onClose: () => void;
}

export default function (props: Props) {
  const { cid, quotedInfo, onClose } = props;
  const { sdk } = useModel('global');
  const [sourceMessage, setSourceMessage] = useState<CommonMessage>({});
  const [list, setList] = useState<ConversationList>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    totalItemCount: 1,
    totalPage: 1,
  });

  const getList = async (pageIndex: number) => {
    const data = await sdk.queryTopicMessage({
      cid,
      topicId: quotedInfo?.topicId,
      pageIndex,
    });
    const { rows = [], current, totalItemCount, totalPage } = data;
    setPagination({ pageIndex: current, totalItemCount, totalPage });

    if (pageIndex === 1) {
      const [source = {}, ...reply] = rows;
      setList(reply);
      setSourceMessage(source);
    } else {
      setList([...list, ...rows]);
    }
  };

  const handleScollToTopic = () => {
    document.getElementById(quotedInfo?.topicId)?.scrollIntoView();
    onClose();
  };

  useEffect(() => {
    getList(1);
  }, []);

  return (
    <Drawer
      title="话题"
      visible
      className="replyListComponent"
      closable={false}
      extra={
        <Space>
          {/* todo: 定位图标没有找到 */}
          <GlobalOutlined
            style={{ fontSize: 20, color: '#000', cursor: 'pointer' }}
            onClick={handleScollToTopic}
          />
          <CloseOutlined
            style={{ fontSize: 20, color: '#000', cursor: 'pointer' }}
            onClick={onClose}
          />
        </Space>
      }
    >
      <div id="scrollableDiv" style={{ height: '100%', overflow: 'auto' }}>
        {/* todo: 首屏内容高度没超过100%，不能自动加载下一页数据 */}
        <InfiniteScroll
          dataLength={list.length}
          next={() => getList(pagination.pageIndex + 1)}
          hasMore={pagination.totalPage > pagination.pageIndex}
          loader={
            <Skeleton.Input
              style={{ textAlign: 'right' }}
              active
              size="large"
            />
          }
          scrollableTarget="scrollableDiv"
        >
          <List split={false}>
            <List.Item className="sourceMessage" key={sourceMessage.userId}>
              <List.Item.Meta
                avatar={
                  <>
                    <AvatarImage
                      src={sourceMessage.from?.avatarUrl}
                      nickName={sourceMessage.from?.nickName}
                      userName={sourceMessage.from?.userName}
                      userId={sourceMessage.from?.userId}
                      style={{
                        display: 'inline-block',
                        marginTop: 12,
                        borderRadius: 8,
                      }}
                      fit="cover"
                      width={42}
                      height={42}
                    />
                  </>
                }
                title={
                  <>
                    {sourceMessage.from?.userName ||
                      sourceMessage.from?.nickName ||
                      sourceMessage.from?.userId}
                    <div
                      style={{
                        float: 'right',
                        marginBottom: 8,
                        color: 'rgb(153, 153, 153)',
                        fontSize: 12,
                      }}
                    >
                      {moment(sourceMessage.timestamp).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )}
                    </div>
                  </>
                }
                description={
                  <SingleMessage
                    type={MsgTypeMap[
                      sourceMessage.contentTypeCode
                    ]?.toLowerCase()}
                    msgContent={sourceMessage.content}
                    componentDisplaySource="replyList"
                  />
                }
              />
            </List.Item>
            {list.map((item) => {
              return (
                <List.Item key={item.id} style={{ justifyContent: 'flex-end' }}>
                  {/* <SingleMessage {...item} msgContent={item.content} type={item.msgType} /> */}
                  <div className="rightContent">
                    <SingleMessage
                      type={MsgTypeMap[item.contentTypeCode]?.toLowerCase()}
                      msgContent={item.content}
                      componentDisplaySource="replyList"
                    />
                  </div>
                </List.Item>
              );
            })}
          </List>
        </InfiniteScroll>
      </div>
    </Drawer>
  );
}
