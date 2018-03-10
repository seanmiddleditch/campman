declare module 'mailgun-js'
{
    namespace mailgun
    {
        interface MessageSendData
        {
            from: string
            to: string
            subject: string
            text: string
        }
    
        interface Messages
        {
            send(data: MessageSendData, callback: (error: any, body: string) => void): void
        }
    
        class Mailgun
        {
            messages(): Messages
        } 
    }

    function mailgun(config: {apiKey: string, domain: string}): mailgun.Mailgun

    export = mailgun
}