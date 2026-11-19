
import { shouldDisplayDate, shouldDisplayTime } from '@/utils';
import { AIMessage, Message } from '@prisma/client';
import moment from 'moment';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import ChatBot from '@/assets/images/chatbot.png';
import Image from 'next/image';
import { remark } from 'remark';
import html from 'remark-html';

type UIMessageProps = {
  message: Message | AIMessage;
  userId: number;
  nextMessage: Message | AIMessage | null;
  isAI?: boolean;
};

const UIMessage = ({ message, userId, nextMessage, isAI }: UIMessageProps) => {
  const [displayTime, setDisplayTime] = useState(false);
  const [contentHtml, setContentHtml] = useState<string | null>(null);

  const isEmptyMessage = _.isEmpty(message);

  useEffect(() => {
    if (isEmptyMessage) {
      setContentHtml(null);
      return;
    }

    let cancelled = false;

    const convertMarkdown = async () => {
      let htmlContent = message.content;

      if (message.content && isAI) {
        const result = await remark()
          .use(html)
          .process(message.content);

        htmlContent = result.toString();
      }

      if (!cancelled) {
        setContentHtml(htmlContent);
      }
    };

    void convertMarkdown();

    return () => {
      cancelled = true;
    };
  }, [message.content, isAI, isEmptyMessage]);

  // Les Hooks React sont maintenant tous appelés
  // avant un éventuel retour anticipé.
  if (isEmptyMessage) {
    return null;
  }

  const isShouldDisplayTime = shouldDisplayTime(message, nextMessage);
  const isShouldDisplayDate = shouldDisplayDate(message, nextMessage);

  const onClick = () => {
    setDisplayTime((previous) => !previous);
  };

  let alignClass = '';
  let colorClass = '';

  if (isAI) {
    if ('sender' in message && message.sender === 'AI') {
      alignClass = 'items-start';
      colorClass = 'bg-gray-100';
    } else {
      alignClass = 'items-end';
      colorClass = 'bg-primary text-white';
    }
  } else {
    if ('userId' in message && message.userId !== userId) {
      alignClass = 'items-start';
      colorClass = 'bg-gray-100';
    } else {
      alignClass = 'items-end';
      colorClass = 'bg-primary text-white';
    }
  }

  return (
    <>
      <div
        key={message.id}
        className={`w-full flex flex-col ${alignClass}`}
      >
        <div className='flex flex- gap-1'>
          {isAI && 'sender' in message && message.sender === 'AI' && (
            <Image
              src={ChatBot}
              alt='chatbot'
              width={10}
              height={10}
              className='rounded-full h-7 w-7 border border-gray-200'
            />
          )}

          <p
            className={`w-fit rounded-xl p-2 text-wrap text-sm sm:text-base ${colorClass}`}
            onClick={onClick}
            dangerouslySetInnerHTML={{
              __html: contentHtml || message.content
            }}
          />
        </div>

        {(isShouldDisplayTime || displayTime) && (
          <span className='text-xs text-gray-400'>
            {moment(message.sendDate).format('HH:mm')}
          </span>
        )}
      </div>

      {isShouldDisplayDate && (
        <span className='text-xs text-gray-400'>
          {moment(message.sendDate).format('DD/MM/YYYY')}
        </span>
      )}
    </>
  );
};

export default UIMessage;
