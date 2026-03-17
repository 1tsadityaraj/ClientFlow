import PusherJS from 'pusher-js'

let client

export const getPusherClient = () => {
  if (!client) {
    client = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    })
  }
  return client
}
