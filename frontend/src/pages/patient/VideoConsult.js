import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function VideoConsult() {
  const { roomId } = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const { joinRoom, onEvent, offEvent, sendOffer, sendAnswer, sendIceCandidate, sendChatMessage } = useSocket() || {};

  const localRef  = useRef(null);
  const remoteRef = useRef(null);
  const pcRef     = useRef(null);
  const streamRef = useRef(null);
  const timerRef  = useRef(null);

  const [inCall,    setInCall]    = useState(false);
  const [muted,     setMuted]     = useState(false);
  const [camOff,    setCamOff]    = useState(false);
  const [duration,  setDuration]  = useState(0);
  const [remoteName,setRemoteName]= useState('');
  const [messages,  setMessages]  = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat,  setShowChat]  = useState(false);
  const [error,     setError]     = useState('');

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const ICE = { iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}] };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.onicecandidate = ({ candidate }) => { if(candidate) sendIceCandidate?.('remote', candidate); };
      pc.ontrack = ({ streams:[s] }) => {
        if(remoteRef.current) remoteRef.current.srcObject = s;
        timerRef.current = setInterval(() => setDuration(d => d+1), 1000);
      };

      joinRoom?.(roomId, user?._id, user?.name);

      const handlePeers = async (peers) => {
        if (peers.length > 0) {
          setRemoteName(peers[0].userName);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendOffer?.(peers[0].socketId, offer);
        }
      };
      const handleOffer = async ({ from, offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendAnswer?.(from, answer);
      };
      const handleAnswer = async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      };
      const handleCandidate = async ({ candidate }) => {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch(_){}
      };
      const handleJoined = ({ userName: name }) => setRemoteName(name);
      const handleMsg = (m) => setMessages(prev => [...prev, m]);

      onEvent?.('room-peers',    handlePeers);
      onEvent?.('offer',         handleOffer);
      onEvent?.('answer',        handleAnswer);
      onEvent?.('ice-candidate', handleCandidate);
      onEvent?.('user-joined',   handleJoined);
      onEvent?.('chat-message',  handleMsg);

      setInCall(true);
    } catch(e) {
      setError('Could not access camera/microphone. Please allow permissions and try again.');
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    clearInterval(timerRef.current);
    navigate(-1);
  };

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(m => !m);
  };

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOff(c => !c);
  };

  const sendMsg = () => {
    if (!chatInput.trim()) return;
    sendChatMessage?.(roomId, chatInput, user?.name);
    setMessages(prev => [...prev, { message:chatInput, sender:user?.name, timestamp:new Date(), own:true }]);
    setChatInput('');
  };

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    clearInterval(timerRef.current);
  }, []);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontFamily:'Fraunces,serif',fontSize:28,fontWeight:300,color:'var(--navy)',marginBottom:4 }}>Video Consultation</h1>
        <p style={{ fontSize:14,color:'var(--text-mid)' }}>Room: {roomId} · End-to-end encrypted</p>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:20 }}>
        {/* Video area */}
        <div>
          <div style={{ background:'#0A1628',borderRadius:20,overflow:'hidden' }}>
            {/* Remote video */}
            <div style={{ position:'relative',minHeight:340,background:'#12233F',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <video ref={remoteRef} autoPlay playsInline style={{ width:'100%',height:'100%',objectFit:'cover',display:inCall?'block':'none' }}/>
              {!inCall && (
                <div style={{ textAlign:'center',color:'rgba(255,255,255,.7)' }}>
                  {error ? (
                    <div style={{ background:'rgba(217,64,64,.2)',borderRadius:12,padding:'16px 24px',maxWidth:300,fontSize:13,color:'#ff8080',lineHeight:1.6 }}>{error}</div>
                  ) : (
                    <>
                      <div style={{ width:72,height:72,borderRadius:'50%',background:'var(--teal)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Fraunces,serif',fontSize:28,color:'#fff',margin:'0 auto 16px' }}>
                        {user?.name?.charAt(0)||'U'}
                      </div>
                      <div style={{ fontSize:14,color:'white',fontWeight:500,marginBottom:6 }}>Ready to consult?</div>
                      <div style={{ fontSize:12,marginBottom:20 }}>Room: <code style={{ background:'rgba(255,255,255,.1)',padding:'2px 8px',borderRadius:6 }}>{roomId}</code></div>
                      <button onClick={startCall} style={{ padding:'10px 28px',background:'var(--teal)',color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>
                        Join Consultation
                      </button>
                    </>
                  )}
                </div>
              )}
              {inCall && (
                <>
                  <div style={{ position:'absolute',top:14,left:14,background:'rgba(0,0,0,.5)',color:'#fff',fontSize:12,padding:'4px 10px',borderRadius:6 }}>
                    {remoteName || 'Waiting for other participant…'} {duration > 0 && `· ${fmt(duration)}`}
                  </div>
                  {/* PiP local */}
                  <div style={{ position:'absolute',bottom:14,right:14,width:110,height:80,background:'#1A3A5C',borderRadius:10,border:'2px solid rgba(255,255,255,.2)',overflow:'hidden' }}>
                    <video ref={localRef} autoPlay playsInline muted style={{ width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)' }}/>
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:12,padding:16,background:'#0A1628' }}>
              <button onClick={toggleMute} title={muted?'Unmute':'Mute'} style={{ width:48,height:48,borderRadius:'50%',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:muted?'#E8A020':'rgba(255,255,255,.12)',color:muted?'#0E2340':'#fff',transition:'all .15s' }}>
                {muted ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0014 0v-2M12 19v4M8 23h8"/></svg>
                )}
              </button>
              <button onClick={toggleCam} title="Toggle camera" style={{ width:48,height:48,borderRadius:'50%',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:camOff?'#E8A020':'rgba(255,255,255,.12)',color:camOff?'#0E2340':'#fff',transition:'all .15s' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="13" height="10" rx="2"/><polygon points="17 9 22 5 22 19 17 15"/></svg>
              </button>
              <button onClick={() => setShowChat(c => !c)} style={{ width:48,height:48,borderRadius:'50%',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:showChat?'var(--teal)':'rgba(255,255,255,.12)',color:'#fff',transition:'all .15s' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </button>
              {inCall && (
                <button onClick={endCall} style={{ width:48,height:48,borderRadius:'50%',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:'#D94040',color:'#fff' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.07 8.64a16 16 0 006.29 6.29l1.17-1.17a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                </button>
              )}
            </div>
          </div>

          {/* Chat */}
          {showChat && (
            <div style={{ background:'#fff',border:'1px solid var(--border)',borderRadius:16,marginTop:16,overflow:'hidden' }}>
              <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:13,fontWeight:600,color:'var(--navy)' }}>Chat</div>
              <div style={{ height:180,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:8 }}>
                {messages.length === 0 ? <div style={{ textAlign:'center',color:'var(--text-light)',fontSize:13,marginTop:20 }}>No messages yet</div> : messages.map((m,i) => (
                  <div key={i} style={{ alignSelf:m.own?'flex-end':'flex-start',maxWidth:'80%' }}>
                    <div style={{ background:m.own?'var(--teal)':'var(--cream)',color:m.own?'#fff':'var(--navy)',padding:'7px 12px',borderRadius:10,fontSize:13 }}>{m.message}</div>
                    <div style={{ fontSize:10,color:'var(--text-light)',marginTop:2,textAlign:m.own?'right':'left' }}>{m.sender}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',gap:8,padding:10,borderTop:'1px solid var(--border)' }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&sendMsg()} placeholder="Type a message…"
                  style={{ flex:1,border:'1.5px solid var(--border)',borderRadius:8,padding:'8px 12px',fontFamily:'DM Sans,sans-serif',fontSize:13,outline:'none',background:'var(--cream)' }}/>
                <button onClick={sendMsg} style={{ padding:'8px 14px',background:'var(--teal)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontSize:13,fontFamily:'DM Sans,sans-serif' }}>Send</button>
              </div>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <div style={{ background:'#fff',border:'1px solid var(--border)',borderRadius:16,padding:20 }}>
            <div style={{ fontSize:13,fontWeight:600,color:'var(--navy)',marginBottom:14 }}>Session Info</div>
            {[
              { l:'Room ID', v:roomId },
              { l:'Status', v:inCall?`Connected · ${fmt(duration)}`:'Waiting to connect' },
              { l:'Encryption', v:'End-to-end' },
              { l:'Connection', v:'WebRTC P2P' },
            ].map(r => (
              <div key={r.l} style={{ display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:13 }}>
                <span style={{ color:'var(--text-mid)' }}>{r.l}</span>
                <span style={{ fontWeight:500,color:'var(--navy)' }}>{r.v}</span>
              </div>
            ))}
          </div>

          <div style={{ background:'#fff',border:'1px solid var(--border)',borderRadius:16,padding:20 }}>
            <div style={{ fontSize:13,fontWeight:600,color:'var(--navy)',marginBottom:12 }}>Tips for Best Experience</div>
            {['Use a stable internet connection','Ensure good lighting on your face','Use headphones to avoid echo','Keep your device charged','Find a quiet, private space'].map(tip => (
              <div key={tip} style={{ display:'flex',gap:8,marginBottom:8,fontSize:12.5,color:'var(--text-mid)',lineHeight:1.5 }}>
                <div style={{ width:5,height:5,borderRadius:'50%',background:'var(--teal)',flexShrink:0,marginTop:6 }}/>
                {tip}
              </div>
            ))}
          </div>

          {!inCall && (
            <button onClick={startCall} style={{ width:'100%',padding:'12px',background:'var(--teal)',color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>
              🎥 Join Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
