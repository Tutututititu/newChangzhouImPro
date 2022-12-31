import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';

interface PropsType {
  msgContent: {
    text: string;
  };
}
// __at_all__
export default function (props: PropsType) {
  console.log(props, 'pp0p00o');
  const { userInfo, sdk } = useModel('global');
  let { userId } = userInfo;
  let { text = '' } = props.msgContent;
  let newStr = '';
  if (props?.atUsers?.length) {
    let chat;
    props?.atUsers.forEach((x, i) => {
      if (x.userId == userId) {
        chat = i;
      }
    });
    if (chat != undefined) {
      let index = 0;
      newStr = text.replace(/,/g, ' ').replace(/@(\S+)/g, (str) => {
        let p;
        if (props?.atUsers[index]?.userId == userId) {
          p = `<a class="at hightColor">${str}</a>`;
          index++;
        } else {
          p = `<a class="at">${str}</a>`;
          index++;
        }
        return p;
      });
    } else {
      if (props?.from?.userId == userId) {
        // debugger
        let index = 0;
        // newStr = text.replace(/,/g, ' ').replace(/@(\S+)/g, `<a class="at">@$1</a>`);
        newStr = text.replace(/,/g, ' ').replace(/@(\S+)/g, (str) => {
          // if (props?.bizParams) {

          let p;
          console.log(props, 'p - r - o - p - s');
          if (props?.atUsers[index]?.userId == '__at_all__') {
            index++;
            return (p = `<a class="at">${str}</a>`);
          }
          if (props?.atUsers[index].extInfo?.at_user_read_status == 1) {
            p = `<a class="at">${str}</a><span class="newRead"></span>`;
            index++;
          } else {
            p = `<a class="at">${str}</a><span class="unRead"></span>`;
            index++;
          }
          return p;
        });
      } else {
        newStr = text
          .replace(/,/g, ' ')
          .replace(/@(\S+)/g, `<a class="at">@$1</a>`);
      }
    }
  } else {
    newStr = text.replaceAll(/@.+\s/g, (str) => `<a>${str}</a>`);
  }

  const html = newStr;
  // const html = text.replace(/,/g, ' ').replace(/@(\S+)/g, `<a class="at">@$1</a>`);
  return (
    <div className="userMessage" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
