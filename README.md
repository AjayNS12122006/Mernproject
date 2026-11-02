# Safety Walk Companion

Safety Walk Companion is a React/Vite app with an Express, MongoDB, and Mongoose backend for sharing live walk status and contacting trusted emergency contacts.

## Setup

Install frontend dependencies from the repository root and backend dependencies from `backend/`:

```bash
npm install
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env`, then set the MongoDB URI, JWT secret, and Twilio credentials. Start the API with `npm run dev` in `backend/`; start the frontend with `npm run dev` from the repository root.

## Automatic SOS Delivery

An SOS marks the walk as `SOS` and sends an alert from the backend to each unique, valid emergency-contact number. Numbers without a country prefix are interpreted as India (+91). If WhatsApp delivery fails, the backend attempts SMS using `TWILIO_PHONE_NUMBER` when configured. Successful recipients are remembered for that walk, and retry requests only target contacts that were not reached. New SOS attempts are limited to one per walk per 60 seconds.

For Twilio's WhatsApp Sandbox, **each emergency contact must first send the sandbox join message/code to the sandbox number once**. Use the join code shown in your Twilio Console; contacts who have not joined the sandbox will not receive WhatsApp messages.

Free-form WhatsApp messages are generally limited to the 24-hour customer-service window. For messages outside that window, create and get approval for a WhatsApp Content template in Twilio, then set `TWILIO_WHATSAPP_TEMPLATE_SID`. The approved template must use `{{1}}` for the user's name, `{{2}}` for the map URL, `{{3}}` for the live tracking URL, and `{{4}}` for the timestamp. When configured, the backend sends the template instead of free text. For SMS fallback, configure a Twilio SMS-capable sender in `TWILIO_PHONE_NUMBER`.

## SOS Endpoint

Send an authenticated request for a walk owned by the logged-in user:

```http
POST /api/walks/:id/sos
Authorization: Bearer <JWT>
Content-Type: application/json
```

```json
{
  "lat": 12.9716,
  "lon": 77.5946
}
```

The response contains `success`, `sent` contacts with their delivery channel, and `failed` contacts with a reason. To retry only undelivered contacts, send `"retry": true` in the request body.

## Automatic email alerts on SOS

When a user confirms an SOS action in the app, the backend saves the SOS status and automatically emails the user's saved trusted contacts that have email addresses. The email includes the destination, last known map location when available, and live tracking URL. The existing frontend then opens WhatsApp with a prepared message; the user still chooses recipients and presses **Send** manually. Email delivery is independent: a mail configuration/delivery failure does not prevent the WhatsApp flow or undo the saved SOS status.

Configure these backend environment variables to enable email:
- `EMAIL_SERVICE=gmail` (or configure `EMAIL_HOST` and `EMAIL_PORT` for SMTP)
- `EMAIL_USER` — sender email
- `EMAIL_PASS` — sender's provider app password (for Gmail, use a Google App Password, not the normal account password)
- `EMAIL_FROM` — optional sender display/address

Add email addresses to trusted contacts. Email is not sent to contacts without an email address. `FRONTEND_URL` should be set to the deployed frontend base URL so the email's tracking link points to the deployed site.

Test with trusted contacts who have agreed to receive alerts. This feature sends email when the backend SOS endpoint is triggered; it does not automatically send a WhatsApp message because the current WhatsApp share flow requires the user to press Send.
