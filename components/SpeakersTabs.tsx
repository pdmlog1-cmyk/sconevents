'use client';

import { useState } from 'react';
import { conf } from '@/lib/config';

type Tab = 'ocm' | 'keynotes' | 'speakers';

export default function SpeakersTabs() {
  const [tab, setTab] = useState<Tab>('ocm');

  return (
    <>
      <div className="spk-tabs" role="tablist">
        <button className={`spk-tab${tab === 'ocm' ? ' active' : ''}`} onClick={() => setTab('ocm')} role="tab">
          <span className="spk-tab-label">Organizing Committee</span>
          <span className="spk-tab-count">{conf.ocm.length}</span>
        </button>
        <button className={`spk-tab${tab === 'keynotes' ? ' active' : ''}`} onClick={() => setTab('keynotes')} role="tab">
          <span className="spk-tab-label">Keynote Speakers</span>
          <span className="spk-tab-count">{conf.keynotes.length}</span>
        </button>
        <button className={`spk-tab${tab === 'speakers' ? ' active' : ''}`} onClick={() => setTab('speakers')} role="tab">
          <span className="spk-tab-label">Invited &amp; Plenary</span>
          <span className="spk-tab-count">{conf.speakers_all.length}</span>
        </button>
      </div>

      {tab === 'ocm' && (
        <div className="spk-panel active">
          <div className="speakers-grid">
            {conf.ocm.map(([name, role, aff, photo]) => (
              <div key={name} className="speaker-card">
                <div className="speaker-photo" style={{ backgroundImage: `url('${photo}')` }}>
                  <span className="speaker-badge">OCM</span>
                </div>
                <div className="speaker-info">
                  <h4>{name}</h4>
                  <div className="speaker-role">{role}</div>
                  <div className="speaker-affiliation">{aff}</div>
                  <div className="speaker-social">
                    <a href="#"><i className="fab fa-linkedin-in" /></a>
                    <a href="#"><i className="fas fa-globe" /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'keynotes' && (
        <div className="spk-panel active">
          <div className="speakers-grid speakers-grid-wide">
            {conf.keynotes.map(([name, talk, aff, photo]) => (
              <div key={name} className="speaker-card speaker-card-kn">
                <div className="speaker-photo" style={{ backgroundImage: `url('${photo}')` }}>
                  <span className="speaker-badge speaker-badge-accent">Keynote</span>
                </div>
                <div className="speaker-info">
                  <h4>{name}</h4>
                  <div className="speaker-role speaker-talk">&ldquo;{talk}&rdquo;</div>
                  <div className="speaker-affiliation">{aff}</div>
                  <div className="speaker-social">
                    <a href="#"><i className="fab fa-linkedin-in" /></a>
                    <a href="#"><i className="fab fa-twitter" /></a>
                    <a href="#"><i className="fas fa-globe" /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'speakers' && (
        <div className="spk-panel active">
          <div className="speakers-grid">
            {conf.speakers_all.map(([name, role, aff, photo]) => (
              <div key={name} className="speaker-card">
                <div className="speaker-photo" style={{ backgroundImage: `url('${photo}')` }}>
                  <span className="speaker-badge">{role}</span>
                </div>
                <div className="speaker-info">
                  <h4>{name}</h4>
                  <div className="speaker-role">{role} Speaker</div>
                  <div className="speaker-affiliation">{aff}</div>
                  <div className="speaker-social">
                    <a href="#"><i className="fab fa-linkedin-in" /></a>
                    <a href="#"><i className="fab fa-twitter" /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
