import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useModel, history } from 'umi';
import { Tabs, List, Empty, message as Message, Divider, Image } from 'antd';
// import { MoreOutline, RightOutline, DeleteOutline, SearchOutlined } from '';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import FileIcon from '@/components/FileIcon';
import AvatarImage from '@/components/AvatarImage';
import PubSub from 'pubsub-js';
import { SearchTypes, searchApi } from './config';

import './style.less';

interface Props {
  keyword: string;
}

export default function (props: Props) {
  const { sdk, setPagePath } = useModel('global');
  const { keyword } = props;
  const [result, setResult] = useState({});
  const [pagination, setPagination] = useState({});
  console.log(pagination);
  const [tabKey, setTabKey] = useState('all');

  const handleSearch = async (pageIndex, searchType = tabKey) => {
    if (!keyword) {
      return;
    }

    try {
      const respend = await sdk[searchApi[searchType]]({
        searchKey: keyword,
        pageIndex,
        sessionType: 'group',
      });
      if (searchType === 'all') {
        setResult(respend);
      } else {
        const { rows = [], totalPage } = respend;
        const userRows = SearchTypes.USER === searchType ? rows : [];
        const groupRows = SearchTypes.GROUP === searchType ? rows : [];
        const messageRows = SearchTypes.MESSAGE === searchType ? rows : [];
        setResult({
          [SearchTypes.USER]:
            pageIndex === 1
              ? userRows
              : [...(result[SearchTypes.USER] || []), ...userRows],
          [SearchTypes.GROUP]:
            pageIndex === 1
              ? groupRows
              : [...(result[SearchTypes.GROUP] || []), ...groupRows],
          [SearchTypes.MESSAGE]:
            pageIndex === 1
              ? messageRows
              : [...(result[SearchTypes.MESSAGE] || []), ...messageRows],
        });
        setPagination({ [searchType]: { pageIndex, totalPage } });
      }
    } catch (e: any) {
      Message.error(e.errorMessage || '操作失败');
    }
  };

  const handleDownload = (item) => {
    console.log(item, '-0-0');

    const docA = document.createElement('a');
    docA.setAttribute('href', item?.msgContent?.url);
    console.log(docA.href, 'p - 2- 312');

    docA.setAttribute('download', item?.msgContent?.fileName);
    console.log(docA.download, 'p - 2- 312');

    docA.setAttribute('target', '_blank');

    docA.click();
  };

  useEffect(() => {
    handleSearch(1, tabKey);
  }, [keyword]);

  const handleTabChange = (tabKey: string) => {
    setTabKey(tabKey);
    handleSearch(1, tabKey);
  };

  const getNextData = async () => {
    await handleSearch(pagination[tabKey]?.pageIndex + 1);
  };

  const createConversation = (userId) => {
    sdk.createConversation({ type: 'single', subUserId: userId }).then(
      (data) => {
        history.push({
          pathname: `/gov/cz/index_dev`,
          query: { cid: `${data.cid}` },
        });
      },
      () => {
        Message.error('操作失败');
      },
    );
  };

  const emptyTip = (
    <div className="emptyTipArea">
      {/* <div className="emptyIcon">todo: icon</div> */}
      <Empty />
      请输入关键词进行搜索
    </div>
  );

  const getPathF = (type, data) => {
    if (!data) return;
    switch (type) {
      case '联系人':
        return goLinkman(data);
      case '聊天记录':
        return goChat(data);
      case '我的群组':
        return goGroup(data);
    }
  };
  const goGroup = async (val: any) => {
    setPagePath({ activeIcon: 'chat', cid: val.sid });
    PubSub.publish('offVisible', false);
  };
  const goLinkman = async (val) => {
    const res = await sdk.createConversation({
      type: 'single',
      subUserId: val,
    });
    if (res?.cid) {
      diveIn(res.cid);
    }
  };

  const goChat = async (val) => {
    const res = await sdk.createConversation({
      type: 'single',
      subUserId: val,
    });
    if (res?.cid) {
      diveIn(res.cid);
    }
  };

  const diveIn = (res) => {
    setPagePath({ activeIcon: 'chat', cid: res });
    PubSub.publish('offVisible', false);
  };
  const listPath = (val) => {
    // JSON.parse(newUseDataProps?.departments)[0].deptName
    let list = JSON.parse(val);
    console.log(list, '--');

    if (list.length) {
      let outList = list
        .map((x) => {
          return x.deptName;
        })
        .join(' | ');
      return outList;
    }
  };

  return (
    <div className="globalSearchPage">
      <Tabs onChange={handleTabChange} className="pageTab" activeKey={tabKey}>
        <Tabs.TabPane tab="全部" key="all">
          {!keyword || !Object.keys(result).length ? (
            emptyTip
          ) : (
            <>
              {!!result[SearchTypes.USER]?.length && (
                <List
                  style={{
                    padding: '0 12px',
                    borderBottom: '8px solid rgba(0,0,0,0.04)',
                  }}
                  header={
                    <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                      联系人
                    </span>
                  }
                >
                  {(
                    result[SearchTypes.USER].filter((_, index) => index < 3) ||
                    []
                  ).map((item) => (
                    <List.Item
                      key={item.member?.userId}
                      onClick={() => {
                        getPathF('联系人', item.member?.userId);
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <AvatarImage
                            src={item.member?.avatarUrl}
                            nickName={item.member?.nickName}
                            userName={item.member?.userName}
                            userId={item.member?.userId}
                            style={{ marginTop: 12, borderRadius: 8 }}
                            fit="cover"
                            width={42}
                            height={42}
                          />
                        }
                        title={item.member.userName || item.member.nickName}
                        description={`${
                          item?.properties?.departments
                            ? listPath(item?.properties?.departments)
                            : ''
                        }`}
                      />
                      {/* <div className="userName" onClick={() => createConversation(item.member.userId)}></div> */}
                    </List.Item>
                  ))}
                  {result[SearchTypes.USER].length > 3 && (
                    <List.Item>
                      <a onClick={() => handleTabChange(SearchTypes.USER)}>
                        <SearchOutlined
                          style={{ marginRight: 4, fontSize: 14 }}
                        />{' '}
                        查看更多
                      </a>
                    </List.Item>
                  )}
                </List>
              )}
              {!!result[SearchTypes.GROUP]?.length && (
                <List
                  style={{
                    padding: '0 12px',
                    borderBottom: '8px solid rgba(0,0,0,0.04)',
                  }}
                  header={
                    <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                      我的群组
                    </span>
                  }
                >
                  {(
                    result[SearchTypes.GROUP].filter((_, index) => index < 3) ||
                    []
                  ).map((item) => {
                    return (
                      <List.Item
                        key={item.sid}
                        onClick={() => {
                          getPathF('我的群组', item);
                        }}
                      >
                        <List.Item.Meta
                          key={item.sid}
                          avatar={
                            <AvatarImage
                              src={item.member?.avatarUrl}
                              groupName={item.sessionName}
                              style={{ borderRadius: 8 }}
                              fit="cover"
                              width={42}
                              height={42}
                            />
                          }
                          title={
                            <span
                              className="searchContent"
                              dangerouslySetInnerHTML={{
                                __html: item.sessionName,
                              }}
                              onClick={
                                () => {}
                                // history.push(`/chatDetail/${item.sid}`)
                              }
                            ></span>
                          }
                          description={`${item.memberCount}人`}
                        />
                      </List.Item>
                    );
                  })}
                  {result[SearchTypes.GROUP].length > 3 && (
                    <List.Item key="more">
                      <a onClick={() => handleTabChange(SearchTypes.GROUP)}>
                        <SearchOutlined
                          style={{ marginRight: 4, fontSize: 14 }}
                        />{' '}
                        查看更多
                      </a>
                    </List.Item>
                  )}
                </List>
              )}
              {!!result[SearchTypes.MESSAGE]?.length && (
                <List
                  header="聊天记录"
                  style={{
                    padding: '0 12px',
                    borderBottom: '8px solid rgba(0,0,0,0.04)',
                  }}
                >
                  {(
                    result[SearchTypes.MESSAGE].filter(
                      (_, index) => index < 3,
                    ) || []
                  ).map((item) => {
                    return (
                      <List.Item
                        key={item.msgId}
                        onClick={() => {
                          getPathF('聊天记录', item.from?.userId);
                        }}
                      >
                        <List.Item.Meta
                          key={item.msgId}
                          avatar={
                            item?.msgType === 'file' ? (
                              <FileIcon
                                type={item.msgContent?.type}
                                onClick={() => {
                                  handleDownload(item);
                                }}
                              ></FileIcon>
                            ) : (
                              <AvatarImage
                                src={item.from?.avatarUrl}
                                nickName={item.from?.nickName}
                                userName={item.from?.userName}
                                userId={item.from?.userId}
                                style={{ marginTop: 12, borderRadius: 8 }}
                                fit="cover"
                                width={42}
                                height={42}
                              />
                            )
                          }
                          title={
                            <div className="briefInfoBar">
                              {item.from?.userName || item.from?.nickName}
                              {/* &gt; 林育 */}
                              <div className="time">
                                {moment(item.timestamp).format('HH:mm')}
                              </div>
                            </div>
                          }
                          description={
                            item.msgContent?.pic ? (
                              <Image src={item.msgContent?.pic} />
                            ) : item?.msgType == 'video' ? (
                              <video
                                width="100%"
                                height="100%"
                                src={item.msgContent?.url}
                                controls
                              />
                            ) : (
                              <div
                                className="userMessage searchContent"
                                dangerouslySetInnerHTML={{
                                  __html: item.searchContent,
                                }}
                              />
                            )
                          }
                        />
                      </List.Item>
                    );
                  })}
                  {result[SearchTypes.MESSAGE]?.length > 3 && (
                    <List.Item key="more">
                      <a onClick={() => handleTabChange(SearchTypes.MESSAGE)}>
                        <SearchOutlined
                          style={{ marginRight: 4, fontSize: 14 }}
                        />{' '}
                        查看更多
                      </a>
                    </List.Item>
                  )}
                </List>
              )}
              {!result[SearchTypes.USER]?.length &&
                !result[SearchTypes.GROUP]?.length &&
                !result[SearchTypes.MESSAGE]?.length && <Empty />}
            </>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="联系人" key={SearchTypes.USER}>
          <InfiniteScroll
            height={400}
            dataLength={result[SearchTypes.USER]?.length || 10}
            next={getNextData}
            hasMore={
              pagination[tabKey]?.totalPage > pagination[tabKey]?.pageIndex
            }
            loader={'加载中...'}
            endMessage={<Divider plain>没有更多了</Divider>}
          >
            <List style={{ padding: '0 12px' }}>
              {result[SearchTypes.USER] && result[SearchTypes.USER].length ? (
                (result[SearchTypes.USER] || []).map((item) => (
                  <List.Item
                    key={item.member.userId}
                    onClick={() => {
                      getPathF('联系人', item.member.userId);
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <AvatarImage
                          src={item.member?.avatarUrl}
                          nickName={item.member?.nickName}
                          userName={item.member?.userName}
                          userId={item.member?.userId}
                          style={{ marginTop: 12, borderRadius: 8 }}
                          fit="cover"
                          width={42}
                          height={42}
                        />
                      }
                      description={`${
                        item?.properties?.departments
                          ? listPath(item?.properties?.departments)
                          : ''
                      }`}
                      title={
                        <div
                          className="userName"
                          onClick={() => createConversation(item.member.userId)}
                        >
                          {item.member.userName || item.member.nickName}
                        </div>
                      }
                    />
                  </List.Item>
                ))
              ) : (
                <Empty />
              )}
            </List>
          </InfiniteScroll>
          {/* <InfiniteScroll loadMore={getNextData} hasMore={pagination[SearchTypes.USER]?.totalPage > pagination[SearchTypes.USER]?.pageIndex} /> */}
        </Tabs.TabPane>
        <Tabs.TabPane tab="我的群组" key={SearchTypes.GROUP}>
          <List style={{ padding: '0 12px' }}>
            {result[SearchTypes.GROUP] && result[SearchTypes.GROUP].length ? (
              (result[SearchTypes.GROUP] || []).map((item) => {
                return (
                  <List.Item
                    key={item.sid}
                    onClick={() => {
                      getPathF('我的群组', item);
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <AvatarImage
                          src={item.member?.avatarUrl}
                          groupName={item.sessionName}
                          style={{ borderRadius: 8 }}
                          fit="cover"
                          width={42}
                          height={42}
                        />
                      }
                      description={`${item.memberCount}人`}
                      title={
                        <span
                          className="searchContent"
                          dangerouslySetInnerHTML={{ __html: item.sessionName }}
                          onClick={
                            () => {}
                            // history.push(`/chatDetail/${item.sid}`)
                          }
                        ></span>
                      }
                    />
                  </List.Item>
                );
              })
            ) : (
              <Empty />
            )}
          </List>
          {/* <InfiniteScroll loadMore={getNextData} hasMore={pagination[SearchTypes.GROUP]?.totalPage > pagination[SearchTypes.GROUP]?.pageIndex} />     console.log(pagination[tabKey]?.totalPage);
    console.log(pagination[tabKey]?.pageIndex);*/}
        </Tabs.TabPane>
        <Tabs.TabPane tab="聊天记录" key={SearchTypes.MESSAGE}>
          <InfiniteScroll
            height={400}
            dataLength={result[SearchTypes.MESSAGE]?.length || 10}
            next={getNextData}
            hasMore={
              pagination[tabKey]?.totalPage > pagination[tabKey]?.pageIndex
            }
            loader={'加载中...'}
            endMessage={<Divider plain>没有更多了</Divider>}
          >
            <List style={{ padding: '0 12px' }}>
              {result[SearchTypes.MESSAGE] &&
              result[SearchTypes.MESSAGE].length ? (
                (result[SearchTypes.MESSAGE] || []).map((item) => {
                  return (
                    <List.Item
                      key={item.msgId}
                      onClick={() => {
                        getPathF('聊天记录', item.from?.userId);
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <AvatarImage
                            src={item.from?.avatarUrl}
                            nickName={item.from?.nickName}
                            userName={item.from?.userName}
                            userId={item.from?.userId}
                            style={{ marginTop: 12, borderRadius: 8 }}
                            fit="cover"
                            width={42}
                            height={42}
                          />
                        }
                        title={
                          <div className="briefInfoBar">
                            {item.from?.userName || item.from?.nickName}
                            {/* &gt; 林育 */}
                            <div className="time">
                              {moment(item.timestamp).format('HH:mm')}
                            </div>
                          </div>
                        }
                        description={
                          item.msgContent?.pic ? (
                            <Image src={item.msgContent?.pic} />
                          ) : item?.msgType == 'video' ? (
                            <video
                              width="100%"
                              height="100%"
                              src={item.msgContent?.url}
                              controls
                            />
                          ) : (
                            <div
                              className="userMessage searchContent"
                              dangerouslySetInnerHTML={{
                                __html: item.searchContent,
                              }}
                            />
                          )
                        }
                      />
                    </List.Item>
                  );
                })
              ) : (
                <Empty />
              )}
            </List>
          </InfiniteScroll>
          {/* <InfiniteScroll loadMore={getNextData} hasMore={pagination[SearchTypes.MESSAGE]?.totalPage > pagination[SearchTypes.MESSAGE]?.pageIndex} /> */}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
