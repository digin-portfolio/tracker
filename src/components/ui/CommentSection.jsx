import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from './Button';
import { RatingWidget } from './RatingWidget';
import { useUserStore } from '../../lib/userStore';
import '../ui.css'; // Just in case we need global UI classes

export function CommentSection({ titleKey, titleData }) {
  const getComments = useUserStore(state => state.getComments);
  const saveComment = useUserStore(state => state.saveComment);
  const profile = useUserStore(state => state.profile);
  const titleComments = useUserStore(state => state.titleComments); // trigger re-render

  const [comments, setComments] = useState(() => getComments(titleKey));
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);

  useEffect(() => {
    setComments(getComments(titleKey));
    setNewComment('');
    setNewRating(0);
  }, [titleKey, titleComments, getComments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: {
        name: `You (${profile.name})`,
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4'
      },
      text: newComment,
      rating: newRating,
      timestamp: Date.now()
    };

    setComments(saveComment(titleKey, comment, titleData));
    setNewComment('');
    setNewRating(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Input Area */}
      <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', overflow: 'visible' }}>
        <img 
          src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4" 
          alt="Avatar" 
          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea 
            placeholder="What did you think about this? Leave a comment or review..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ 
              width: '100%', 
              minHeight: '80px', 
              background: 'transparent', 
              border: 'none', 
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Your Rating:</span>
              <RatingWidget onRate={setNewRating} initialRating={newRating} />
            </div>
            
            <Button variant="accent" onClick={handleSubmit} icon={Send}>
              Post
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {comments.map((comment) => (
          <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
            <img 
              src={comment.user.avatar} 
              alt={comment.user.name} 
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{comment.user.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : 'Just now'}
                </span>
                {comment.rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-bg)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>★ {comment.rating}/5</span>
                  </div>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
