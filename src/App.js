import { useState, useRef } from "react";
import "./App.css";

// firebase sdk
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
// hooks
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
// config firebase
firebase.initializeApp({
    apiKey: "AIzaSyBxcZdP4fZL8Wf1KsGn6eQj1tA5hRLEreA",
    authDomain: "evident-ocean-328716.firebaseapp.com",
    projectId: "evident-ocean-328716",
    storageBucket: "evident-ocean-328716.appspot.com",
    messagingSenderId: "726277262963",
    appId: "1:726277262963:web:4d6f9b48d51eeac7586406",
    measurementId: "G-LKTZ6MP0J4",
});
const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };
    return (
        <button className="sign-in" onClick={signInWithGoogle}>
            sign in with google
        </button>
    );
}

function SignOut() {
    return (
        auth.currentUser && (
            <button className="sign-out" onClick={() => auth.signOut()}>
                sign out
            </button>
        )
    );
}

function ChatRoom() {
    const dummy = useRef();

    const messagesRef = firestore.collection("messages");
    const query = messagesRef.orderBy("createdAt").limit(25);

    // listen to data with a hook
    const [messages] = useCollectionData(query, { idField: "id" });

    const [formValue, setFormValue] = useState("");

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });

        setFormValue("");

        dummy.current.scrollIntroView({ behavior: "smooth" });
    };

    return (
        <>
            <main>
                {messages &&
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                <div ref={dummy}></div>
            </main>

            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                />
                <button type="submit" disabled={!formValue}>
                    send
                </button>
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL} />
            <p>{text}</p>
        </div>
    );
}

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header>
                <h1>⚛️🔥💬</h1>
                <SignOut />
            </header>
            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

export default App;
