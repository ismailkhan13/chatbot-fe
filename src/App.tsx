import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import 'primeicons/primeicons.css';
import './App.scss';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function App() {

  let [messages, setMessages] = useState([{ message: "Hello, How can I help you today?", bot: 1 }])
  let [fpq, setFpq] = useState("");
  let [loading, setLoading] = useState(false);
  let inputRef: any = useRef(null);
  let containerRef: any = useRef(null);
  let [showChatbot, setShowChatbot] = useState(true);
  let [speak, setSpeak] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ticket, setTicket] = useState(false);
  const mailref = useRef<any>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const onAsk = async () => {
    let query = inputRef.current?.value;
    if (!query) return;

    inputRef.current.value = '';
    resetTranscript();

    if ((query?.trim()?.toLowerCase() == 'yes' || query?.trim()?.toLowerCase() == 'yeah') && fpq) {
      query = fpq;
    }

    pushMessage(query);

    setFpq("");

    setLoading(true);

    let botres = await axios.post('https://mipchatbot.onrender.com/ask-mip-msh-liamsi', { "question": query })
      .catch(err => {
        setLoading(false);
      })
    setLoading(false);

    if (botres?.status == 200 && botres.data) {
      pushMessage(botres.data.answer, 1);
      if (botres.data?.follow_up_question && botres.data?.follow_up_question?.length) {
        setFpq(botres.data?.follow_up_question);
      } else {
        setFpq("");
      }
    }
  }

  const scrolldown = () => {
    containerRef?.current?.scrollBy(0, containerRef?.current?.scrollHeight)

  }

  const pushMessage = (message: string, bot = 0) => {
    setMessages((prev) => {
      let clone = [...prev];
      persistChat([...prev, { message: message, bot: bot }]);
      return [...clone, { message: message, bot: bot }]
    })
  }

  const persistChat = (list: any[]) => {
    if (!list || !list.length) return;
    sessionStorage.setItem('chatbot-chat', JSON.stringify(list));
  }

  const retrieveChat = () => {
    let chat = sessionStorage.getItem('chatbot-chat');
    if (chat) {
      try {
        let parsed_chat = JSON.parse(chat);
        setMessages((prev) => {
          let new_chat = [];
          for (const chat of parsed_chat) {
            new_chat.push(chat)
          }
          return new_chat;
        });
      } catch (err) {

      }
    }
  }

  const onFollowUp = (ques = '') => {
    inputRef.current.value = ques || fpq;
    onAsk();
  }

  const onSpeechInput = () => {
    if (speak) {
      setSpeak(false);
      SpeechRecognition.stopListening();
    } else {
      setSpeak(true);
      SpeechRecognition.startListening({ continuous: true });
    }
  }

  const handlePlay = (text: string) => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;

    let allVoices = synth.getVoices();
    console.log(allVoices);

    let voice = allVoices?.find((v) => v.name.toLowerCase() == 'samantha');
    if (voice) {
      u.voice = voice;
    }
    synth.speak(u);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;

    synth.cancel();
  };

  const onSpeakerClick = (text = '') => {
    if (!isPlaying) {
      handlePlay(text);
      setIsPlaying(true);
    } else {
      handleStop();
      setIsPlaying(false);
    }
  }

  const raiseIssue = async () => {
    let email = mailref.current?.value;
    if (!email) return;
    if (messages.length <= 1) return;
    let botres = await axios.post('https://mipchatbot.onrender.com/send-chat-mip', { "email": email, chat: messages })
      .catch(err => {
        setLoading(false);
      })
    if (botres?.status == 200) {
      setTicket(false);
      mailref.current.value = "";
    }
  }

  useEffect(() => {
    retrieveChat();
  }, [])

  useEffect(() => {
    scrolldown();
  }, [messages])

  useEffect(() => {
    if (inputRef.current)
      inputRef.current.value = transcript;

  }, [transcript])

  return (
    <div>
      {/* chatbot ui */}
      {/* chatbot head */}
      {
        showChatbot &&
        <div className='chatbot-ui'>
          {/* <div className='chars'>
            <div className='sp-1'></div>
          </div> */}

          <div className='chatbot-ui-head'>
            <div className='chatbot-ui-title'>
              {
                (loading) &&
                <div className='think'>
                  <p>
                    Umm... let me think!
                  </p>

                  <div className="loading">
                    <span className="loading__dot"></span>
                    <span className="loading__dot"></span>
                    <span className="loading__dot"></span>
                  </div>

                </div>
              }
              {/* <img className='chatbot-ui-title-img' src='https://mindler-products-images.imgix.net/mip-msh-23/bot1.jpeg' /> */}
              <div className={`${loading ? 'sp-2' : fpq ? 'sp-3' : 'sp-1'}`}></div>
              <span className='chatbot-title-details'>
                <span className='chatbot-title-text-1'> Chat with  </span>
                <span className='chatbot-title-text-2'> Mindler AI <span className='online'> <span className='greencirle'></span> <span>Online</span> </span>    </span>
              </span>
            </div>
            <span className='chatbot-ui-options'>
              <button className='issue' onClick={() => { setTicket(!ticket) }}>{!ticket ? 'Raise Issue' : 'Cancel'}</button>
            </span>
            <span className='chatbot-ui-options'>
              <ul className='chatbot-ui-menu'>
                <li onClick={() => { setShowChatbot(false) }} className='chat-dropdown'><a className='toogle-links' href='javascript:void(0)'> <i className="pi pi-times"></i> </a>
                </li>

              </ul>
            </span>
          </div>
          {/* chatbot contents */}
          {
            !ticket &&

            <div ref={containerRef} className='chatbot-ui-contents'>


              {
                messages.map((m, idx) => (
                  m.bot == 1 ?
                    <div className='chat-left'>
                      <span className='user-chat tw-relative'>
                        {/* <img className='bot-profile' src="https://mindler-products-images.imgix.net/mip-msh-23/bot1.jpeg" alt="" /> */}
                        <div className='sp-small'></div>
                      </span>
                      <span className='chat-r-1 tw-relative'>
                        <span className='c-text-1'> {m.message} <i onClick={() => { onSpeakerClick(m.message) }} className='pi pi-volume-up tw-cursor-pointer tw-absolute tw-top-0 tw-right-1'></i> </span>
                        {/* <span className='thumb-response active'> </span> */}
                      </span>
                    </div> :
                    <div className='chat-right'>
                      <span className='chat-r-1'>
                        {/* <span className='thumb-response'> </span> */}
                        <span className='c-text-1'> {m.message} </span>
                      </span>
                      <span className='user-chat'> <i className="pi pi-user"></i> </span>
                    </div>
                ))
              }

              {(fpq && fpq.length) &&
                <div onClick={() => { onFollowUp() }} className='chat-slection-options'>
                  <ul className='chat-slection-option-lists'>
                    <li> <a className='button-links' href='javascript:void(0)'> Do you want to ask : {fpq} </a> </li>
                  </ul>
                </div>
              }

              {(messages && messages.length == 1) &&
                <div className='chat-slection-options'>
                  <p className='tw-text-center'>Frequently Asked: </p>
                  <ul className='chat-slection-option-lists'>
                    <li onClick={() => { onFollowUp("What is MIP ?") }}> <a className='button-links' href='javascript:void(0)'> What is MIP ?  </a> </li>
                    <li onClick={() => { onFollowUp("What are the stages in MSH ?") }}> <a className='button-links' href='javascript:void(0)'> What are the stages in MSH ?  </a> </li>
                    <li onClick={() => { onFollowUp("What are the benefits of mindler internship ?") }}> <a className='button-links' href='javascript:void(0)'> What are the benefits of mindler internship ?  </a> </li>
                  </ul>
                </div>
              }

            </div>
          }

          {ticket &&

            <div ref={containerRef} className='chatbot-ui-contents'>
              <p className='tw-text-center'>Raise a Ticket with your conversation:</p>
              <div className='tw-flex tw-flex-col tw-items-center tw-gap-y-1'>
                <input ref={mailref} type="text" placeholder='Type your email..' className='emailip' />
                <button type='button' onClick={raiseIssue} className='raise'>Raise</button>
              </div>
            </div>
          }

          {/* chatbot footer */}
          <div className='chatbot-ui-footer'>
            <form className='tw-block' onSubmit={(e) => { e.preventDefault() }}>
              <span className='chat-ui-input'>
                <input className='chat-input-f' ref={inputRef} type='text' placeholder='Type your message here' />
                <button className='tw-relative' type='button' onClick={(e) => { onSpeechInput() }}>
                  {
                    speak &&
                    <div className='listening-pop tw-text-xs tw-text-center'>
                      Listening... <br /> Tap to stop
                    </div>
                  }
                  <span className='chat-ui-input-cta tw-p-1'>
                    <img src="https://mindler-products-images.imgix.net/mip-msh-23/microphone.png" alt="microphone" />
                  </span>
                </button>
                <button onClick={onAsk} type='submit'>
                  <span className='chat-ui-input-cta' >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_1422_108)">
                        <path d="M1.62169 7.76262C1.18669 7.61762 1.18253 7.38345 1.63003 7.23428L17.5359 1.93261C17.9767 1.78595 18.2292 2.03262 18.1059 2.46428L13.5609 18.3693C13.4359 18.8101 13.1817 18.8251 12.995 18.4068L10 11.6668L15 5.00012L8.33336 10.0001L1.62169 7.76262Z" fill="#FFB21B" />
                      </g>
                      <defs>
                        <clipPath id="clip0_1422_108">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>

                  </span>
                </button>

              </span>
            </form>

          </div>

        </div>
      }

      {
        !showChatbot &&
        <div className='chatbot-opener' onClick={() => { setShowChatbot(true) }}>
          {/* <img className='chatbot-ui-title-img' src='https://mindler-products-images.imgix.net/mip-msh-23/bot1.jpeg' /> */}
          <div className='sp-op'></div>
        </div>
      }
    </div>
  );
}

export default App;