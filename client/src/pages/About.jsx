import React from 'react';
import '../css/about.css';

export default function About() {
  return (
    <div id="about-main">
      <div id="container">
        <div id="contain-left">
          <div className="hero-section">
            <h1 className="main-title">A team of Three Musketeers</h1>
            <h2 className="subtitle">
              We call ourselves <span className="highlight">JAY</span>-den
            </h2>
          </div>
          
          <div className="team-section">
            <div className="names">
              <div className="team-member" id="name1">
                <span className="member-number">01</span>
                <h3>Jatin Yadav</h3>
              </div>
              <div className="team-member" id="name2">
                <span className="member-number">02</span>
                <h3>Adil Khan</h3>
              </div>
              <div className="team-member" id="name3">
                <span className="member-number">03</span>
                <h3>Yashswi Shukla</h3>
              </div>
            </div>
          </div>
          
          {/* <div className="info">
            <div className="story-card">
              <p id="paragraph">
                You are probably wondering why our team name is JAY-den.
                <br /><br />
                Actually the word <strong>JAY</strong> is made up of our initials,
                <br />
                there was a character named Jayden so we decided to keep this as our
                team name.
              </p>
            </div>
          </div> */}
        </div>
        
        <div id="contain-right">
          <div className="image-section">
            <div className="image-container">
              <img id="team-image" src="./img/Jayden.jpg" alt="Team JAY-den" />
              <div className="image-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}