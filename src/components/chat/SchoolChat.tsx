import React, { useState } from 'react';
import { 
  MessageSquareText, 
  Send, 
  Megaphone, 
  AlertCircle, 
  Smile, 
  Paperclip, 
  Hash, 
  Bell, 
  Check, 
  Sparkles,
  Users
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const SchoolChat: React.FC = () => {
  const { 
    chatMessages, 
    sendMessage, 
    addReaction, 
    currentUser, 
    isPrincipal, 
    t 
  } = useSchool();

  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [inputText, setInputText] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const channels = [
    { id: 'general', name: 'general-announcements', desc: 'School-wide official faculty notices', icon: Megaphone },
    { id: 'teachers', name: 'teachers-lounge', desc: 'Staff room coordination and lesson plans', icon: Hash },
    { id: 'accounts', name: 'fee-accounts', desc: 'Financial disbursement and fee clearance updates', icon: Hash },
    { id: 'exam-cell', name: 'exam-cell', desc: 'Question papers, schedules and marks submission', icon: Hash },
  ];

  const filteredMessages = chatMessages.filter(m => m.channelId === activeChannel);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(activeChannel, inputText.trim(), isBroadcast, isUrgent);
    setInputText('');
    setIsBroadcast(false);
    setIsUrgent(false);
  };

  const reactionEmojis = ['👍', '❤️', '👏', '🎉', '🙏'];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      
      {/* Channels Sidebar */}
      <div className="w-full md:w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-950/40 shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-orange-500" />
            {t('School Communication Cell', 'स्कूल संवाद कक्ष')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {t('Internal faculty & administrative channels', 'आंतरिक शिक्षक एवं प्रशासनिक चैनल')}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
            {t('Channels', 'चैनल')}
          </span>

          {channels.map((ch) => {
            const Icon = ch.icon;
            const isActive = activeChannel === ch.id;
            const count = chatMessages.filter(m => m.channelId === ch.id).length;

            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">#{ch.name}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current User footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2.5">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
            <span className="text-[10px] font-semibold text-emerald-600">Active Online</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        
        {/* Active Channel Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>#{channels.find(c => c.id === activeChannel)?.name}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {channels.find(c => c.id === activeChannel)?.desc}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="w-4 h-4 text-slate-400" />
            <span>All Staff & Principal</span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquareText className="w-10 h-10 mb-2 opacity-30 text-orange-500" />
              <p className="text-xs font-semibold">{t('No messages in this channel yet.', 'इस चैनल में अभी कोई संदेश नहीं है।')}</p>
              <p className="text-[11px] mt-1">{t('Be the first to post a staff notice or update!', 'पहला संदेश या सूचना पोस्ट करें!')}</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-xl object-cover shrink-0 mt-0.5"
                  />

                  <div className={`max-w-[78%] space-y-1 ${isMine ? 'items-end text-right' : ''}`}>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-slate-900 dark:text-white">{msg.senderName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {msg.senderRole}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all ${
                        msg.isBroadcast
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium shadow-md'
                          : isMine
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {msg.isBroadcast && (
                        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider mb-1 text-orange-100">
                          <Megaphone className="w-3.5 h-3.5" />
                          <span>{t('Official School Broadcast', 'आधिकारिक स्कूल घोषणा')}</span>
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </div>

                    {/* Emoji Reactions Pill */}
                    <div className={`flex items-center gap-1.5 pt-0.5 ${isMine ? 'justify-end' : ''}`}>
                      {msg.reactions?.map((rc, idx) => (
                        <button
                          key={idx}
                          onClick={() => addReaction(msg.id, rc.emoji)}
                          className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300"
                        >
                          <span>{rc.emoji}</span>
                          <span className="text-[10px] font-bold">{rc.count}</span>
                        </button>
                      ))}

                      {/* Quick reaction selector */}
                      <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                        {reactionEmojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg.id, emoji)}
                            className="text-xs hover:scale-125 transition-transform"
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          
          {/* Principal Broadcast Tag option */}
          {isPrincipal && (
            <div className="flex items-center gap-3 mb-2 px-1 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-orange-600 dark:text-orange-400 font-bold">
                <input
                  type="checkbox"
                  checked={isBroadcast}
                  onChange={(e) => setIsBroadcast(e.target.checked)}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <Megaphone className="w-3.5 h-3.5" />
                <span>{t('Priority Broadcast Notice', 'प्राथमिकता घोषणा')}</span>
              </label>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t(`Type a message in #${channels.find(c => c.id === activeChannel)?.name}...`, `संदेश लिखें...`)}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Send', 'भेजें')}</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
