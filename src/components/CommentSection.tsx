import React, { useState } from 'react';
import { Send, User, MessageSquare, ShieldCheck } from 'lucide-react';
import { Comment, UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CommentSectionProps {
  requestId: string;
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export function CommentSection({ requestId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      requestId,
      userId: 'admin-1',
      userName: 'Elena Rodriguez',
      userRole: 'designer',
      content: 'I have started reviewing the dimensions for the Q4 Report. Looks solid.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      requestId,
      userId: 'req-1',
      userName: 'Alexander Thorne',
      userRole: 'solicitante',
      content: 'Perfect, please keep me updated on the vector format.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);

  const canPost = currentUser.role === 'designer' || currentUser.role === 'admin' || currentUser.role === 'solicitante';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      requestId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: newComment,
      timestamp: new Date().toISOString(),
    };

    setComments([...comments, comment]);
    setNewComment('');

    // Simulate email notification logic
    if (currentUser.role === 'designer' || currentUser.role === 'admin') {
      setIsNotifying(true);
      console.log(`[Email Notification] To: solicitante@lumina.com | Subj: New comment on request ${requestId}`);
      setTimeout(() => setIsNotifying(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-sm space-y-8 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-zinc-950">Discussion Thread</h3>
        </div>
        <AnimatePresence>
          {isNotifying && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Email Notification Sent</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6 max-h-[400px] overflow-y-auto px-2 scrollbar-hide">
        {comments.map((comment) => (
          <div 
            key={comment.id}
            className={`flex gap-4 p-5 rounded-[24px] border transition-shadow hover:shadow-sm ${
              comment.userId === currentUser.id 
                ? 'bg-primary/5 border-primary/10 ml-8' 
                : 'bg-zinc-50 border-zinc-100 mr-8'
            }`}
          >
            <div className="w-10 h-10 rounded-full signature-gradient flex items-center justify-center text-white shrink-0 shadow-lg">
              <User size={20} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-950 uppercase tracking-tight">{comment.userName}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    comment.userRole === 'solicitante' ? 'bg-zinc-200 text-zinc-600' : 'bg-primary/10 text-primary'
                  }`}>
                    {comment.userRole}
                  </span>
                </div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">
                  {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed font-bold uppercase tracking-tight opacity-90">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {canPost && (
        <form onSubmit={handleSubmit} className="relative pt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="ADD TO THE LEDGER..."
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-primary transition-all p-5 text-sm rounded-[24px] outline-none font-bold text-zinc-950 placeholder:text-zinc-400 min-h-[100px] pr-16 shadow-inner"
          />
          <button 
            type="submit"
            className="absolute bottom-10 right-6 p-4 signature-gradient text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      )}

      {!canPost && (
        <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-100 flex items-center gap-4">
          <ShieldCheck className="text-zinc-400" size={24} />
          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Read-only access enabled for your role.</p>
        </div>
      )}
    </div>
  );
}
