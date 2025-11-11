// video areas
const myMedia = document.getElementById("user1");
const yourMedia = document.getElementById("user2");
let myMediaStream = null;


let pc = null;

// media control buttons
const ctrlbtns = document.getElementsByClassName("ctlbtn");
const cameraBtn  = ctrlbtns[0];
const micBtn  = ctrlbtns[1];
const HangBtn  = ctrlbtns[2];

// Session discription protocol buttons
const createOffer = document.getElementById("createOffer");
const createAns = document.getElementById("createAns");
const addAns = document.getElementById("addAns");

// actual SDP textarea
const createOfferText = document.getElementById("createOfferText");
const createAnsText = document.getElementById("createAnsText");
const recvOffer = document.getElementById("recvOffer");
const addAnsText = document.getElementById("addAnsText");


// add media access 
navigator.mediaDevices.getUserMedia({
        video: { width: 340, height: 200 },
        audio:true
})
.then((stream)=>{
        myMediaStream = stream;
        myMedia.srcObject = stream;

        const audioTrack = myMediaStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;

        const VideoTrack = myMediaStream.getVideoTracks()[0];
        VideoTrack.enabled = !VideoTrack.enabled;
})
.catch((err)=>{
        console.log("Error : ",err);
});

micBtn.addEventListener("click",()=>{
        const audioTrack = myMediaStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        micBtn.textContent = audioTrack.enabled ? "Mic is ON" : "Mic is OFF";
});

cameraBtn.addEventListener("click",()=>{
        const VideoTrack = myMediaStream.getVideoTracks()[0];
        VideoTrack.enabled = !VideoTrack.enabled;
        cameraBtn.textContent = VideoTrack.enabled ? "Camera is ON" : "Camera is OFF";
});


// start the webrtc from the offer creator

createOffer.addEventListener("click",async ()=>{
        // initialize the peer connection
        pc = new RTCPeerConnection({
                iceServers : [{ urls: "stun:stun.l.google.com:19302" }]
        });

        //define a callback that will be used when ice candidates are found
        let candidates = [];
        pc.onicecandidate = (iceCandidate)=>{
                if(iceCandidate.candidate){
                        candidates.push(iceCandidate.candidate);
                        console.log("gathering");
                }
                else{
                        const completeOffer = {
                                sdp:pc.localDescription,
                                ice:candidates
                        }
                        console.log(completeOffer);
                        createOfferText.value = JSON.stringify(completeOffer);
                }
        };

        // add event listener to attach the remote media stream sent by connection
        pc.ontrack = (event)=>{
                yourMedia.srcObject = event.streams[0];
        }
        
        // get the connection access to the media tracks
        for(let i of myMediaStream.getTracks()){
                pc.addTrack(i,myMediaStream);
        }
        
        // create the sdp offe rthat would be send with the candidate
        const offer = await pc.createOffer();

        

        // tells webrtc to start Ice 
        await pc.setLocalDescription(offer);
});


// respond answer to the offer recieved

createAns.addEventListener("click",async ()=>{
        // initialize the peer connection
        pc = new RTCPeerConnection({
                iceServers : [{ urls: "stun:stun.l.google.com:19302" }]
        });

        //define a callback that will be used when ice candidates are found
        let candidates = [];
        pc.onicecandidate = (iceCandidate)=>{
                if(iceCandidate.candidate){
                        candidates.push(iceCandidate.candidate);
                        console.log("gathering");
                }
                else{
                        const completeAnswer = {
                                sdp:pc.localDescription,
                                ice:candidates
                        }
                        console.log(completeAnswer);
                        createAnsText.value = JSON.stringify(completeAnswer);
                }
        };

        // add event listener to attach the remote media stream sent by connection
        pc.ontrack = (event)=>{
                yourMedia.srcObject = event.streams[0];
        } 

        // get the connection access to the media tracks
        for(let i of myMediaStream.getTracks()){
                pc.addTrack(i,myMediaStream);
        }

        // add the remote sdp and candidates
        const offer = JSON.parse(recvOffer.value);
        await pc.setRemoteDescription(offer.sdp);
        for(let i of offer.ice){
                pc.addIceCandidate(i);
        }

        // make a sdp in repsonse to the offer
        const answer = await pc.createAnswer();

        // tells webrtc to start Ice 
        await pc.setLocalDescription(answer);
});


// add the answer and candidates

addAns.addEventListener("click",async ()=>{
        const answer = JSON.parse(addAnsText.value);
        await pc.setRemoteDescription(answer.sdp);
        for(let i of answer.ice){
                pc.addIceCandidate(i);
        }
        console.log("connection done");
});


// add hanh up function

HangBtn.addEventListener("click",()=>{
        location.replace(location.href);

});




