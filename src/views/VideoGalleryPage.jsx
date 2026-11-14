'use client';

import { useState, useMemo } from 'react';
import { parseYouTubeId, youTubeThumb } from '../lib/videos';
import '../components/ArticleLayout.css';
import './VideoGalleryPage.css';

function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false);
  const ytId = parseYouTubeId(video.videoUrl);
  const thumb = video.thumbnail || (ytId ? youTubeThumb(ytId) : '');
  return (
    <div className="vid-card">
      <div className="vid-frame">
        {playing ? (
          ytId ? (
            <iframe className="vid-embed" src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} title={video.title}
              allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : video.videoUrl ? (
            // crossOrigin is only needed to load an external caption track, and it
            // forces a CORS check on the video itself — so only set it when captions exist.
            <video className="vid-embed" src={video.videoUrl} controls autoPlay {...(video.captions ? { crossOrigin: 'anonymous' } : {})}>
              {video.captions && <track kind="captions" src={video.captions} srcLang="en" label="English" default />}
            </video>
          ) : (
            <div className="vid-noembed">No video source set.</div>
          )
        ) : (
          <button className="vid-thumb" onClick={() => setPlaying(true)}
            style={thumb ? { backgroundImage: `url(${thumb})` } : undefined} aria-label={`Play ${video.title}`}>
            <span className="vid-play" aria-hidden="true">▶</span>
            {video.length && <span className="vid-length">{video.length}</span>}
          </button>
        )}
      </div>
      {video.topic && <p className="card-pillar">{video.topic}</p>}
      <p className="card-title">{video.title}</p>
      {video.description && <p className="vid-desc">{video.description}</p>}
      {video.transcript && (
        <details className="vid-transcript">
          <summary>Transcript</summary>
          <div>{video.transcript.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}</div>
        </details>
      )}
    </div>
  );
}

// The list is rendered on the server (with VideoObject structured data); only the
// topic filter and the click-to-play players run in the browser.
export default function VideoGalleryPage({ videos }) {
  const [topic, setTopic] = useState('');

  const topics = useMemo(() => [...new Set(videos.map((v) => v.topic).filter(Boolean))].sort(), [videos]);
  const shown = useMemo(() => videos.filter((v) => !topic || v.topic === topic), [videos, topic]);

  return (
    <div className="proxa-article">
      <section className="shell blog-index">
        <p className="eyebrow blog-eyebrow">Videos</p>
        <h1 className="blog-title">Watch &amp; learn</h1>
        <p className="blog-sub">Short, practical videos on AI in biopharma commercial learning — strategy, evidence, and the field.</p>

        {topics.length > 1 && (
          <div className="blog-filters">
            <label className="blog-filter">
              <span>Topic</span>
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="">All topics</option>
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>
        )}

        {videos.length === 0 ? (
          <p className="blog-sub">No videos published yet — check back soon.</p>
        ) : shown.length === 0 ? (
          <p className="blog-sub">No videos match this topic.</p>
        ) : (
          <div className="vid-grid">
            {shown.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        )}
      </section>
    </div>
  );
}
