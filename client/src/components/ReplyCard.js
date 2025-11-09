import React from 'react';
import { FaUser, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const ReplyCard = ({ reply }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FaUser className="text-xs" />
          <span className="font-medium">{reply.author}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
          <FaClock className="text-xs" />
          <span>{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
        </div>
      </div>
      <p className="text-text dark:text-textLight leading-relaxed whitespace-pre-wrap">{reply.content}</p>
    </div>
  );
};

export default ReplyCard;

