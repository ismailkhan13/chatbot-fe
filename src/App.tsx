import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import 'primeicons/primeicons.css';
import './App.scss';
import axios from 'axios';

function App() {

  let [messages, setMessages] = useState([{ message: "Hello, How can I help you today?", bot: 1 }])
  let [fpq, setFpq] = useState("");
  let [loading, setLoading] = useState(false);
  let inputRef: any = useRef(null);

  const onAsk = async () => {
    let query = inputRef.current?.value;
    if (!query) return;

    inputRef.current.value = '';
    pushMessage(query);

    setLoading(true);
    let botres = await axios.post('http://localhost:3200/ask-mip-msh', { "question": query })
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

  const onFollowUp = () => {
    inputRef.current.value = fpq;
    onAsk();
  }

  useEffect(() => {
    retrieveChat();
  }, [])

  return (
    <div>
      {/* chatbot ui */}
      {/* chatbot head */}
      <div className='chatbot-ui'>
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
            <img className='chatbot-ui-title-img' src='https://mindler-products-images.imgix.net/mip-msh-23/bot1.jpeg' />
            <span className='chatbot-title-details'>
              <span className='chatbot-title-text-1'> Chat with  </span>
              <span className='chatbot-title-text-2'> Mindler AI  </span>
            </span>
          </div>
          <span className='chatbot-ui-options'>
            <ul className='chatbot-ui-menu'>
              <li className='chat-dropdown'><a className='toogle-links' href='javascript:void(0)'> <i className="pi pi-ellipsis-v"></i> </a>
                <ul className='chatbot-ui-submenu'>
                  <li> <a href='javascript:void(0)'> Close </a> </li>
                </ul>
              </li>

            </ul>
          </span>
        </div>
        {/* chatbot contents */}
        <div className='chatbot-ui-contents'>

          {
            messages.map((m, idx) => (
              m.bot == 1 ?
                <div className='chat-left'>
                  <span className='user-chat tw-relative'>
                    <img className='bot-profile' src="https://mindler-products-images.imgix.net/mip-msh-23/bot1.jpeg" alt="" />
                  </span>
                  <span className='chat-r-1'>
                    <span className='c-text-1'> {m.message} </span>
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
            <div onClick={onFollowUp} className='chat-slection-options'>
              <ul className='chat-slection-option-lists'>
                <li> <a className='button-links' href='javascript:void(0)'> {fpq} </a> </li>
              </ul>
            </div>
          }

        </div>

        {/* chatbot footer */}
        <div className='chatbot-ui-footer'>
          <form className='tw-block' onSubmit={(e) => { e.preventDefault() }}>
            <span className='chat-ui-input'>
              <input className='chat-input-f' ref={inputRef} type='text' placeholder='Type your message here' />
              {/* <span className='chat-ui-input-cta'>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_1424_81)">
                  <path d="M12.3566 6.46415L7.64325 11.1783C7.56365 11.2552 7.50017 11.3471 7.4565 11.4488C7.41282 11.5505 7.38983 11.6598 7.38887 11.7705C7.38791 11.8811 7.40899 11.9909 7.4509 12.0933C7.4928 12.1957 7.55467 12.2887 7.63292 12.367C7.71116 12.4452 7.8042 12.5071 7.90662 12.549C8.00903 12.5909 8.11877 12.612 8.22941 12.611C8.34006 12.6101 8.44941 12.5871 8.55108 12.5434C8.65275 12.4997 8.74471 12.4362 8.82158 12.3567L13.5357 7.64332C14.0046 7.17444 14.268 6.5385 14.268 5.8754C14.268 5.21231 14.0046 4.57637 13.5357 4.10749C13.0669 3.63861 12.4309 3.37519 11.7678 3.37519C11.1047 3.37519 10.4688 3.63861 9.99991 4.10749L5.28575 8.82165C4.89081 9.20676 4.57627 9.66645 4.36038 10.1741C4.14448 10.6817 4.03153 11.2271 4.02808 11.7787C4.02462 12.3303 4.13073 12.8771 4.34024 13.3874C4.54976 13.8977 4.85851 14.3613 5.24859 14.7513C5.63867 15.1413 6.10232 15.45 6.61263 15.6595C7.12293 15.8689 7.66975 15.9749 8.22136 15.9714C8.77297 15.9679 9.31838 15.8548 9.82596 15.6389C10.3335 15.4229 10.7932 15.1083 11.1782 14.7133L15.8924 9.99999L17.0707 11.1783L12.3566 15.8925C11.8149 16.4342 11.1718 16.8639 10.464 17.1571C9.75625 17.4502 8.99766 17.6011 8.23158 17.6011C7.4655 17.6011 6.70691 17.4502 5.99915 17.1571C5.29138 16.8639 4.64828 16.4342 4.10658 15.8925C3.56488 15.3508 3.13518 14.7077 2.84201 13.9999C2.54884 13.2922 2.39795 12.5336 2.39795 11.7675C2.39795 11.0014 2.54884 10.2428 2.84201 9.53505C3.13518 8.82728 3.56488 8.18419 4.10658 7.64249L8.82158 2.92915C9.60742 2.17016 10.6599 1.75019 11.7524 1.75968C12.8449 1.76917 13.89 2.20738 14.6625 2.97991C15.435 3.75244 15.8732 4.7975 15.8827 5.88998C15.8922 6.98247 15.4722 8.03498 14.7132 8.82082L9.99991 13.5367C9.76769 13.7688 9.49202 13.953 9.18863 14.0786C8.88524 14.2042 8.56007 14.2689 8.2317 14.2688C7.90333 14.2688 7.57818 14.2041 7.27482 14.0784C6.97146 13.9527 6.69583 13.7685 6.46366 13.5362C6.2315 13.304 6.04734 13.0283 5.92172 12.725C5.79609 12.4216 5.73145 12.0964 5.73149 11.768C5.73153 11.4397 5.79624 11.1145 5.92194 10.8111C6.04764 10.5078 6.23186 10.2322 6.46408 9.99999L11.1782 5.28582L12.3566 6.46415Z" fill="#FFB21B" />
                </g>
                <defs>
                  <clipPath id="clip0_1424_81">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>

            </span> */}
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
    </div>
  );
}

export default App;