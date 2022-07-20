import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { FirebaseConfig } from './firebase_config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'

import { Box, Flex, HStack, VStack } from '@chakra-ui/react';


firebase.initializeApp(FirebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Accepted &#9989; Chat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>

  );

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  );
}


function ChatRoom() {

  const [room, setRoom] = useState("messages");
  const [showChat, setShowChat] = useState(false);

  const dummy = useRef();
  const messagesRef = firestore.collection(room);
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const joinRoom = (school) => {
    if (room !== "") {
      setRoom(school);
      setShowChat(true);
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      time:
        new Date(Date.now()).getHours() +
        ":" +
        ('0' + new Date(Date.now()).getMinutes()).slice(-2)
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (

    <div>
      {!showChat ? (
        <Flex flexDirection="column">
          <button className="Harvard" onClick={() => joinRoom("Harvard")}>Harvard</button>
          <button className="Yale" onClick={() => joinRoom("Yale")}>Yale</button>
          <button className="Princeton" onClick={() => joinRoom("Princeton")}>Princeton</button>
        </Flex>
      ) : (
        <div>
          <main>
            {messages && messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
            <span ref={dummy}></span>
          </main>

          <form onSubmit={sendMessage}>
            <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="type your message..." />
            <button type="submit" disabled={!formValue}>send</button>
          </form> </div>)}
    </div>
  )
}


function ChatMessage(props) {
  const { text, uid, photoURL, time } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <Flex className="chatflex1" justify="center" align="start" flexDirection="column">
        <div id='author'>{uid}</div>
        <Flex className="chatflex2" justify="center" align="center" flexDirection="row">
          <img src={photoURL || './batman_avatar.png'} alt="avatar" />
          <p>{text}</p>
          <div id='timestamp'>{time}</div>
        </Flex>
      </Flex>
    </div>
  )
}


export default App;