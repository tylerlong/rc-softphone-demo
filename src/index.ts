import fs from 'fs';
import Softphone from 'ringcentral-softphone';
import type { RtpPacket } from 'werift-rtp';

console.log(process.env.SIP_INFO_USERNAME);

const softphone = new Softphone({
  username: process.env.SIP_INFO_USERNAME,
  password: process.env.SIP_INFO_PASSWORD,
  authorizationId: process.env.SIP_INFO_AUTHORIZATION_ID,
});
softphone.enableDebugMode(); // print all SIP messages
const main = async () => {
  await softphone.register();
  // inbound call
  softphone.on('invite', async (inviteMessage) => {
    // answer the call
    const callSession = await softphone.answer(inviteMessage);
    // receive audio
    const writeStream = fs.createWriteStream(`${callSession.callId}.raw`, { flags: 'a' });
    callSession.on('audioPacket', (rtpPacket: RtpPacket) => {
      writeStream.write(rtpPacket.payload);
    });
    // receive DTMF
    callSession.on('dtmf', (digit) => {
      console.log('dtmf', digit);
    });
  });
};
main();
