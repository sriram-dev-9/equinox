import { Inngest} from "inngest";

export const inngest = new Inngest({
    id: 'equinox',
    eventKey: process.env.INNGEST_EVENT_KEY,
    ai: { gemini: { apiKey: process.env.GOOGLE_API_KEY! }}
})
