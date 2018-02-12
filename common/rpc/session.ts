export interface Session
{
    showLoginDialog() : Promise<void>
    endSession() : Promise<void>
}