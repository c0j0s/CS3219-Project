import { Mail } from "./mail";


const webURL = "http://localhost:3000/forgotpassword?"     // todo change the link in env

class ResetPasswordMail extends Mail {
    constructor(id:string, recipient:string, token:string) {
        
        const verificationSubject = `Peer Prep Reset Password`;
        const verificationContent = `<p>Click <a href="${webURL}id=${id}&token=${token}">here</a> to reset your password.</p>`;

        super(recipient, verificationSubject, verificationContent)
    };
}

export { ResetPasswordMail };
